import React from "react";
import { Alert, Clipboard, RefreshControl, ScrollView } from "react-native";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getState, oneTimePin, toggle } from "./GarageService";
import { isLoggedIn, login } from "./LoginService";
import { isSettingsConfigured } from "./StorageService";


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
      tabBarIcon: (<Icon
              name="garage"
              size={45}
              color="black"
            />)
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    if (!await isSettingsConfigured()) {
      navigation.navigate("Settings")
      return
    }
    if (!await isLoggedIn()) {
      await login()
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
          title="AUTOCLOSE"
          onPress={() => this.autoclosePressed()}
        />
      </ScrollView>
    );
  }
}
