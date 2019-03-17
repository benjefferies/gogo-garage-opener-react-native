import { getApi } from "./StorageService"
import axios from 'axios'

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