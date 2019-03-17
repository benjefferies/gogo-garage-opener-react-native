import React from "react";
import axios from 'axios'
import { View, StyleSheet, Button, ScrollView, RefreshControl, Clipboard, Alert } from "react-native";
import { getAllSettings, isSettingsConfigured } from "./StorageService"
import { isLoggedIn, logout } from "./LoginService"
import { getState, toggle, oneTimePin } from "./GarageService"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1'
  }
});


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
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this._onRefresh(navigation)}
          />
        }>
        <View style={styles.container} >
          <Button
            title={this.state.doorState}
            onPress={() => this.togglePressed()}
            type="outline"
          />
          <Button
            title="Auto close"
            onPress={() => this.autoclosePressed()}
            type="outline"
          />
          <Button
            title="One time pin"
            onPress={() => this.oneTimePinPressed()}
            type="outline"
          />
          <Button
            title="Settings"
            onPress={() => navigation.navigate("Settings")}
            type="outline"
          />
          <Button
            title="Logout"
            onPress={() => this.logoutPressed()}
            type="outline"
          />
        </View>
      </ScrollView>
    );
  }
}
