import { getAllSettings, getApi, removeAccessToken } from "./StorageService"
import Auth0 from 'react-native-auth0';

export async function isLoggedIn() {
  const settings = await getAllSettings()
  const api = await getApi()
  try {
    const auth0 = new Auth0({ domain: settings.asDomain, clientId: settings.clientId });
    await auth0
      .auth
      .userInfo({ token: api.accessToken })
      .then(r => console.log("Got user info assuming logged in"))
  } catch (error) {
    console.log(`Got error getting user info assuming not logged in error=${error}`)
    return false;
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
      .then(r => console.log("Cleared user session"))
  } catch (error) {
    console.log(`Failed to clear user session=${error}`)
  }
}