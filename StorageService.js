import { AsyncStorage } from "react-native";

export async function getAllSettings() {
  const asDomain = await AsyncStorage.getItem('auth_domain') // gogo-garage-opener.eu.auth0.com
  const clientId = await AsyncStorage.getItem('auth_client_id') // v31OMS8iXKbzZPMXzs1Ltq0gIegv5nbT
  const domain = await AsyncStorage.getItem('domain') // 'https://open.mygaragedoor.space
  return {
    asDomain: asDomain,
    clientId: clientId,
    rsDomain: domain
  }
}

export async function setSettings(rsDomain, asDomain, clientId) {
  await AsyncStorage.multiSet([
    ['domain', rsDomain],
    ['auth_domain', asDomain],
    ['auth_client_id', clientId]
  ])
}

export async function addAutocloseTimes(autoCloseTime) {
  var autocloseConfiguration = await AsyncStorage.getItem('autoclose_configuration')
  if (!autocloseConfiguration) {
    autocloseConfiguration = []
  } else {
    autocloseConfiguration = JSON.parse(autocloseConfiguration)
  }
  autocloseConfiguration.push(autoCloseTime)
  await AsyncStorage.setItem('autoclose_configuration', JSON.stringify(autocloseConfiguration))
}

export async function getAutoCloseTimes() {
  const autocloseConfiguration = await AsyncStorage.getItem('autoclose_configuration')
  if (!autocloseConfiguration) {
    return []
  }
  return JSON.parse(autocloseConfiguration)
}

export async function resetAutoClose() {
  await AsyncStorage.removeItem('autoclose_configuration')
}

export async function isSettingsConfigured() {
  const asDomain = await AsyncStorage.getItem('auth_domain') // gogo-garage-opener.eu.auth0.com
  const clientId = await AsyncStorage.getItem('auth_client_id') // v31OMS8iXKbzZPMXzs1Ltq0gIegv5nbT
  const domain = await AsyncStorage.getItem('domain') // 'https://open.mygaragedoor.space
  return asDomain || clientId || domain
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