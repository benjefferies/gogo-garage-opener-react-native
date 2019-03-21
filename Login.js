import React from "react";
import { Button, View } from "react-native";
import { isLoggedIn, login } from "./LoginService";
import { isSettingsConfigured } from "./StorageService";
import styles from './Style'

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
      <View style={styles.container}>
        <Button style={styles.button}
          title="Login"
          onPress={() => this.tryLogin()}
        />
        <Button style={styles.button}
          title="Settings"
          onPress={() => navigate("Settings")}
        />
      </View>
    );
  }
}
