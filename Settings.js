import React from "react";
import { TextInput, View, Text } from "react-native";
import { getAllSettings, setSettings } from "./StorageService";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './Style';
import { logout } from "./LoginService";

export default class Settings extends React.Component {

  constructor() {
    super()
    this.state = {domain: '', authDomain: '', authClientId: ''}
  }

  static navigationOptions = ({ _ }) => {
    return {
      tabBarIcon: (<Icon
              name="settings"
              size={25}
              color="black"
            />)
    };
  }

  async componentDidMount() {
    const settings = await getAllSettings()
    this.setState({ domain: settings.rsDomain, authDomain: settings.asDomain, authClientId: settings.clientId})
  }

  async save() {
    if (!this.state.domain || !this.state.authDomain || !this.state.authClientId) {
      alert('All values must be set')
      return
    }
    try {
      await setSettings(this.state.domain, this.state.authDomain, this.state.authClientId)
      this.props.navigation.goBack()
    } catch (error) {
      alert(`Failed to save settings: ${error}`)
    }
  }

  async logoutPressed() {
    logout()
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(domain) => this.setState({ domain })}
          placeholder="Garage Opener Domain"
          value={this.state.domain}
        />
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(authDomain) => this.setState({ authDomain })}
          placeholder="Auth0 Domain"
          value={this.state.authDomain}
        />
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(authClientId) => this.setState({ authClientId })}
          placeholder="Auth0 Client ID"
          value={this.state.authClientId}
        />
        <Button style={styles.button}
          title="SAVE"
          icon={
            <Icon
              name="content-save"
              size={40}
              color="white"
            />
          }
          onPress={() => this.save()}
        />
        <Button buttonStyle={{ marginVertical: 1 }}
          icon={
            <Icon
              name="logout"
              size={40}
              color="white"
            />
          }
          title="LOGOUT"
          onPress={() => this.logoutPressed()}
        />
      </View>
    );
  }
}
