import {
  getAllSettings,
  getApi,
  removeAccessToken,
  saveAccessToken
} from "./StorageService";
import { loginResourceServer } from "./GarageService";
import Auth0 from "react-native-auth0";

async function isLoggedIn(auth0, accessToken) {
  try {
    await auth0.auth
      .userInfo({ token: accessToken })
      .then(_ => console.log("Got user info assuming logged in"));
  } catch (error) {
    return false;
  }
  return true;
}

export async function isLoggedInOrRefresh() {
  const settings = await getAllSettings();
  const api = await getApi();
  var auth0
  try {
    auth0 = new Auth0({
      domain: settings.asDomain,
      clientId: settings.clientId
    });
  } catch (error) {
    console.log("Failed to init auth0 " + error);
    return false;
  }
  const loggedIn = await isLoggedIn(auth0, api.accessToken);
  console.log(`Access token valid: ${loggedIn}`)
  if (loggedIn) {
    return true;
  }
  console.log(`Using refresh token: ${api.refreshToken}`)
  try {
    const newAccessToken = await auth0.auth.refreshToken({
      refreshToken: api.refreshToken,
      scope: "openid email"
    });
    console.log(`Got new access token ${newAccessToken.accessToken}`)
    saveAccessToken(newAccessToken.accessToken, api.refreshToken);
    return await isLoggedIn(auth0, api.accessToken);
  } catch (error) {
    console.log("Could not get access token from refresh token " + error);
    return false;
  }
}

export async function logout() {
  const settings = await getAllSettings();
  try {
    await removeAccessToken();
    const auth0 = new Auth0({
      domain: settings.asDomain,
      clientId: settings.clientId
    });
    await auth0.webAuth
      .clearSession()
      .then(_ => console.log("Cleared user session"));
  } catch (error) {
    console.log(`Failed to clear user session=${error}`);
  }
}

export async function login() {
  const settings = await getAllSettings();
  const auth0 = new Auth0({
    domain: settings.asDomain,
    clientId: settings.clientId
  });
  try {
    const credentials = await auth0.webAuth.authorize({
      scope: "openid email offline_access",
      audience: `${settings.rsDomain}`
    });
    await saveAccessToken(credentials.accessToken, credentials.refreshToken);
    await loginResourceServer();
  } catch (error) {
    alert(`Failed to login auth0: ${error}`);
    throw error;
  }
}
