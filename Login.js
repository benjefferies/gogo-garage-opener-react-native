import React from "react";
import axios from 'axios'
import { View, Text, AsyncStorage, Button } from "react-native";
import { decode as atob } from 'base-64'
import Auth0 from 'react-native-auth0';
import { login, isLoggedIn } from "./LoginService"
import { getAllSettings, isSettingsConfigured, getApi } from "./StorageService";


export default class Login extends React.Component {


  componentDidMount() {
    this.props.navigation.addListener('willFocus', () => {
      this.tryLogin()
    });
  }

  async tryLogin() {
    let { navigate } = this.props.navigation
    if (!await isSettingsConfigured()) {
      navigate('Settings')
      return
    }
    if (!await isLoggedIn()) {
      await login()
      navigate('Home')
    }
  }

  render() {
    let { navigate } = this.props.navigation
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Login"
          onPress={() => this.tryLogin()}
        />
        <Button
          title="Settings"
          onPress={() => navigate("Settings")}
        />
      </View>
    );
  }
}
