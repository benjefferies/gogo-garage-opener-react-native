import React from "react";
import { ScrollView, RefreshControl, Clipboard, Alert } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-elements';
import { isSettingsConfigured } from "./StorageService"
import { isLoggedIn, logout } from "./LoginService"
import { getState, toggle, oneTimePin } from "./GarageService"
import styles from './Style'

const myButton = (
  <Button buttonStyle={{ marginVertical: 1 }} >
  </Button>
);

export default class Home extends React.Component {

  constructor() {
    super()
    this.state = {
      doorState: 'Loading',
      refreshing: false,
    }
  }

  static navigationOptions = ({ _ }) => {
    return {
      headerTitle: "Garage Opener",
      headerLeft: null
    };
  }

  getOptions(accessToken) {
    return { headers: { 'Authorization': `Bearer ${accessToken}` } }
  }

  async componentDidMount() {
    const { navigation } = this.props;
    if (!await isSettingsConfigured()) {
      navigation.navigate("Settings")
      return
    }
    if (!await isLoggedIn()) {
      navigation.navigate("Login")
      return
    }
    // For when redirected back from login page  
    navigation.addListener('willFocus', async () => {
      const status = await getState()
      this.setState({ doorState: status })
    });
    const status = await getState()
    this.setState({ doorState: status })
  }

  async togglePressed() {
    await toggle()
    for (let c = 0; c < 10; c++) {
      setTimeout(async () => this.setState({ doorState: await getState() }), c * 5000)
    }
  }

  async autoclosePressed() {
    await toggle(true)
    for (let c = 0; c < 10; c++) {
      setTimeout(async () => this.setState({ doorState: await getState() }), c * 5000)
    }
  }

  async oneTimePinPressed() {
    const pin = await oneTimePin()
    Alert.alert('One time pin', pin,
      [
        { text: 'Copy', onPress: () => Clipboard.setString(pin) }
      ],
      { cancelable: false }
    )
  }

  async logoutPressed() {
    logout()
  }

  async _onRefresh(_) {
    this.setState({ refreshing: true });
    try {
      this.setState({ doorState: await getState(), refreshing: false })
    } catch (error) {
      this.setState({ refreshing: false });
    }
  }

  render() {
    const { navigation } = this.props;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this._onRefresh(navigation)}
          />
        }>
        <Button buttonStyle={{ marginVertical: 1 }}
          icon={
            <Icon
              name="garage"
              size={40}
              color="white"
            />
          }
          title={this.state.doorState}
          onPress={() => this.togglePressed()}
        />
        <Button buttonStyle={{ marginVertical: 1 }}
          icon={
            <Icon
              name="garage-open"
              size={40}
              color="white"
            />
          }
          title="Auto close"
          onPress={() => this.autoclosePressed()}
        />
        <Button buttonStyle={{ marginVertical: 1 }}
          icon={
            <Icon
              name="pin"
              size={40}
              color="white"
            />
          }
          title="One time pin"
          onPress={() => this.oneTimePinPressed()}
        />
        <Button buttonStyle={{ marginVertical: 1 }}
          icon={
            <Icon
              name="settings"
              size={40}
              color="white"
            />
          }
          title="Settings"
          onPress={() => navigation.navigate("Settings")}
        />
        <Button buttonStyle={{ marginVertical: 1 }}
        iconRight="true"
          icon={
            <Icon
              name="logout"
              size={40}
              color="white"
            />
          }
          title="Logout"
          onPress={() => this.logoutPressed()}
        />
      </ScrollView>
    );
  }
}
