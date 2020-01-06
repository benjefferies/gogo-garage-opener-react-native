import { getAllSettings, getApi, removeAccessToken, saveAccessToken } from "./StorageService"
import { loginResourceServer } from "./GarageService"
import Auth0 from 'react-native-auth0';

export async function isLoggedIn() {
  const settings = await getAllSettings()
  const api = await getApi()
  try {
    const auth0 = new Auth0({ domain: settings.asDomain, clientId: settings.clientId });
    await auth0
      .auth
      .userInfo({ token: api.accessToken })
      .then(_ => console.log("Got user info assuming logged in"))
  } catch (error) {
    return false
  }
  return true
}

export async function logout() {
  const settings = await getAllSettings()
  try {
    await removeAccessToken()
    const auth0 = new Auth0({ domain: settings.asDomain, clientId: settings.clientId });
    await auth0
      .webAuth
      .clearSession()
      .then(_ => console.log("Cleared user session"))
  } catch (error) {
    console.log(`Failed to clear user session=${error}`)
  }
}

export async function login() {
  const settings = await getAllSettings()
  const auth0 = new Auth0({ domain: settings.asDomain, clientId: settings.clientId });
  try {
    const credentials = await auth0.webAuth
      .authorize({ scope: 'openid email', audience: `${settings.rsDomain}` })
    await saveAccessToken(credentials.accessToken)
    await loginResourceServer()
  } catch (error) {
    alert(`Failed to login auth0: ${error}`)
    throw error
  }
}