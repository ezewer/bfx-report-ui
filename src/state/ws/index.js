import { store } from 'state/store'

import { selectAuth } from 'state/auth/selectors'
import { platform } from 'var/config'

import types from './constants'

const { NODE_ENV } = process.env

const getAuth = () => {
  const state = store.getState()
  return selectAuth(state)
}

class WS {
  constructor() {
    this.isConnected = false
    this.websocket = null
    this.isFirstConnect = true
  }

  heartbeat = () => {
    clearTimeout(this.pingTimeout)

    this.pingTimeout = setTimeout(() => {
      this.disconnect()
    }, 11000)
  }

  connect = () => {
    if (!platform.showFrameworkMode || this.isConnected) {
      return
    }

    const websocket = new WebSocket(platform.WS_ADDRESS)
    this.websocket = websocket

    // allows async use from sagas
    let resolver
    const isConnectionOpen = new Promise((res) => {
      resolver = res
    })

    websocket.onopen = () => {
      this.isConnected = true
      store.dispatch({ type: types.WS_CONNECT })

      if (!this.isFirstConnect) {
        store.dispatch({ type: types.WS_RECONNECT })
      }
      this.isFirstConnect = false

      this.heartbeat()
      resolver()
    }

    websocket.onclose = () => {
      this.isConnected = false
      this.connect()
    }

    websocket.onmessage = this.onMessage

    websocket.onerror = (err) => {
      if (NODE_ENV === 'development') {
        console.error(err) // eslint-disable-line no-console
      }
      resolver()
      websocket.close()
    }

    // eslint-disable-next-line consistent-return
    return isConnectionOpen
  }

  disconnect = () => {
    if (this.websocket) {
      this.websocket.close()
    }
  }

  send = (method = '', params = {}, auth = getAuth()) => {
    if (!this.isConnected) {
      return
    }

    try {
      const { apiKey, apiSecret } = auth

      const data = {
        auth: {
          apiKey,
          apiSecret,
        },
        method,
        params,
      }

      this.websocket.send(JSON.stringify(data))
    } catch (err) {
      if (NODE_ENV === 'development') {
        console.error(err) // eslint-disable-line no-console
      }
    }
  }

  // dispatches incoming messages
  onMessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      const { action, ...payload } = data

      if (!action) {
        return
      }

      if (action === '__ping__') {
        this.heartbeat()
        return
      }

      store.dispatch({ type: `ws_${action}`, payload })
    } catch (err) {
      console.error(err) // eslint-disable-line no-console
    }
  }
}

export default new WS()
