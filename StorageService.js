import { AsyncStorage } from "react-native";

export async function getAllSettings() {
  let asDomain = await AsyncStorage.getItem('auth_domain') // gogo-garage-opener.eu.auth0.com
  let clientId = await AsyncStorage.getItem('auth_client_id') // v31OMS8iXKbzZPMXzs1Ltq0gIegv5nbT
  let audience = await AsyncStorage.getItem('auth_audience') // 'https://open.mygaragedoor.space/api'
  let domain = await AsyncStorage.getItem('domain') // 'https://open.mygaragedoor.space
  return {
    asDomain: asDomain,
    clientId: clientId,
    audience: audience,
    rsDomain: domain
  }
}

export async function isSettingsConfigured() {
  let asDomain = await AsyncStorage.getItem('auth_domain') // gogo-garage-opener.eu.auth0.com
  let clientId = await AsyncStorage.getItem('auth_client_id') // v31OMS8iXKbzZPMXzs1Ltq0gIegv5nbT
  let audience = await AsyncStorage.getItem('auth_audience') // 'https://open.mygaragedoor.space/api'
  let domain = await AsyncStorage.getItem('domain') // 'https://open.mygaragedoor.space
  return !asDomain || !clientId || !audience || !domain
}

export async function getApi() {
  let accessToken = await AsyncStorage.getItem('accessToken')
  let domain = await AsyncStorage.getItem('domain') // 'https://open.mygaragedoor.space
  return {
    accessToken: accessToken,
    rsDomain: domain
  }
}

export async function saveAccessToken(accessToken) {
  await AsyncStorage.setItem('accessToken', accessToken)
}

export async function removeAccessToken() {
  await AsyncStorage.removeItem('accessToken')
}