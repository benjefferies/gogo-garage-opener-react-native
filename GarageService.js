import axios from 'axios';
import { getApi } from "./StorageService";

function getOptions(accessToken) {
  return { headers: { 'Authorization': `Bearer ${accessToken}` } }
}

export async function getState() {
  const api = await getApi()
  const response = await axios.get(`${api.rsDomain}/garage/state`, getOptions(api.accessToken))
    .catch((error) => {
      alert("Could not get garage status")
      console.log(error)
      throw error
    })
  return response.data['Description']
}

export async function getGarageSettings() {
  const api = await getApi()
  if (!api.rsDomain) {
    return {}
  }
  const response = await axios.get(`${api.rsDomain}/garage/config`, getOptions(api.accessToken))
    .catch((error) => {
      alert("Could not get garage config")
      console.log(error)
      throw error
    })
  return response.data
}

export async function saveGarageSettings(settings) {
  const api = await getApi()
  if (!api.rsDomain) {
    return {}
  }
  await axios.put(`${api.rsDomain}/garage/config`, settings, getOptions(api.accessToken))
    .catch((error) => {
      alert("Could not save garage config")
      console.log(error)
      throw error
    })
}

export async function toggle(autoclose = false) {
  const api = await getApi()
  return axios.post(`${api.rsDomain}/garage/toggle`, {}, {
    params: {
      autoclose: autoclose
    }, headers: { 'Authorization': `Bearer ${api.accessToken}` }
  })
    .catch((error) => {
      alert(`Failed to toggle: ${error}`)
      console.log(error)
      throw error
    });
}

export async function oneTimePin() {
  let api = await getApi()
  const response = await axios.post(`${api.rsDomain}/user/one-time-pin`, {}, getOptions(api.accessToken))
    .catch((error) => {
      alert(`Failed to generate one time pin: ${error}`)
      console.log(error)
      throw error
    });
  return `${api.rsDomain}/user/one-time-pin/${response.data["pin"]}`
}

export async function deleteOneTimePin(pin) {
  let api = await getApi()
  await axios.delete(`${api.rsDomain}/user/one-time-pin/${pin}`, getOptions(api.accessToken))
    .catch((error) => {
      alert(`Failed to delete one time pin: ${error}`)
      console.log(error)
      throw error
    });
}

export async function getOneTimePins() {
  let api = await getApi()
  const response = await axios.get(`${api.rsDomain}/user/one-time-pin`, getOptions(api.accessToken))
    .catch((error) => {
      alert(`Failed to get one time pins: ${error}`)
      console.log(error)
      throw error
    });
  return response.data || []
}

export async function loginResourceServer() {
  const api = await getApi()
  return axios.post(`${api.rsDomain}/user/login`, {}, getOptions(api.accessToken))
    .catch((error) => {
      alert(`Could not login to garage opener: ${error}`)
      throw error
    });
}