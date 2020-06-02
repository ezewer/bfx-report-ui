import { platform } from 'var/config'

const getAuth = state => state.auth

export const getAuthStatus = state => getAuth(state).authStatus
export const getIsShown = state => getAuth(state).isShown
export const getIsLoading = state => getAuth(state).loading
export const getEmail = state => getAuth(state).email
export const getAuthData = state => {
  const {
    apiKey,
    apiSecret,
    authToken,
    email,
    password,
    token,
    isNotFirstAuth,
    isPersisted,
  } = getAuth(state)

  return {
    apiKey,
    apiSecret,
    authToken,
    email,
    password,
    token,
    isNotFirstAuth,
    isPersisted,
  }
}

// auth is done either with authToken, apiKey + apiSecret for web or email + password for framework
export function selectAuth(state) {
  const {
    apiKey,
    apiSecret,
    authToken,
    email,
    password,
    token,
  } = getAuthData(state)

  if (!platform.showFrameworkMode) {
    if (authToken) {
      return { authToken }
    }
    if (apiKey && apiSecret) {
      return { apiKey, apiSecret }
    }
    return {}
  }

  if (token) {
    return { token }
  }

  if (email && password) {
    return { email, password }
  }
  return {}
}

export default {
  getAuthData,
  getAuthStatus,
  getIsLoading,
  getIsShown,
  selectAuth,
}
