import authTypes from 'state/auth/constants'

import types from './constants'

const initialState = {
  exportEmail: '',
}

export function queryReducer(state = initialState, action) {
  const { type, payload = {} } = action
  switch (type) {
    case types.SET_EXPORT_EMAIL:
      return {
        ...state,
        exportEmail: payload || '',
      }
    case authTypes.LOGOUT:
      return initialState
    default:
      return state
  }
}

export default queryReducer
