import React from "react";
import { RefreshControl, ScrollView, View, Text, ActivityIndicator } from "react-native";
import { Button, Overlay } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getState, toggle } from "./GarageService";
import { isLoggedInOrRefresh, login } from "./LoginService";
import { isSettingsConfigured, addAutocloseTimes, getAutoCloseTimes, setSettings } from "./StorageService";
import ActionButton from 'react-native-action-button';
import { TextInput } from "react-native-gesture-handler";
import styles from './Style';
import Zeroconf from 'react-native-zeroconf'

export default class Home extends React.Component {

  constructor() {
    super()
    this.state = {
      doorState: 'Loading',
      refreshing: false,
      loadingConfig: true,
      autoCloseTimes: [],
      addAutoClose: false
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
      const zeroconf = new Zeroconf();
      zeroconf.on('start', () => {
          console.log('[Start]')
      });
      zeroconf.on('resolved', service => {
          console.log('[resolved]')
          setSettings(service["txt"]["garage_domain"], service["txt"]["as_domain"], service["txt"]["client_id"])
          this.setState({loadingConfig: false})
          console.log('[Set state]', JSON.stringify(service["txt"], null, 2))
          alert('Automatically discovered configuration')
      });
      zeroconf.on('update', service => {
          console.log('[updated]')
      });
      zeroconf.on('found', service => {
          console.log('[found]')
          alert("found")
      });
      zeroconf.on('stop', async service => {
          console.log('[stopped]')
          this.setState({loadingConfig: false})
          if (!await isSettingsConfigured()) {
              alert('Could not autodiscover configuration')
              navigation.navigate("Settings")
          }
      });
      zeroconf.on('error', service => {
          console.log('[stopped]')
      });
      zeroconf.scan('gogo-garage-opener', 'tcp','local.')
      setTimeout(() => zeroconf.stop(), 30000)
      return
    } else {
      this.setState({loadingConfig: false})
    }
    if (!await isLoggedInOrRefresh()) {
      await login()
      return
    }
    // For when redirected back from login page  
    navigation.addListener('willFocus', async () => {
      const status = await getState()
      this.setState({ doorState: status })
    });
    const status = await getState()
    const autoCloseTimes = await getAutoCloseTimes()
    this.setState({ doorState: status, autoCloseTimes: autoCloseTimes })
  }

  async togglePressed() {
    await toggle()
    for (let c = 0; c < 10; c++) {
      setTimeout(async () => this.setState({ doorState: await getState() }), c * 5000)
    }
  }

  async autoClosePressed(autoCloseTime) {
    await toggle(true, autoCloseTime)
    for (let c = 0; c < 10; c++) {
      setTimeout(async () => this.setState({ doorState: await getState() }), c * 5000)
    }
  }

  async _onRefresh(_) {
    this.setState({ refreshing: true });
    try {
      this.setState({ doorState: await getState(), refreshing: false, autoCloseTimes: await getAutoCloseTimes() })
    } catch (error) {
      this.setState({ refreshing: false });
    }
  }

  async createNewButton(newAutoCloseButtonTime) {
    addAutocloseTimes(newAutoCloseButtonTime)
    const autoCloseTimes = this.state.autoCloseTimes
    autoCloseTimes.push(newAutoCloseButtonTime)
    this.setState({autoCloseTimes: autoCloseTimes, addAutoClose: false})
  }

  render() {
    const { navigation } = this.props;
    const autoCloseButtons = []
    for (const autoCloseTime of this.state.autoCloseTimes) {
      autoCloseButtons.push(
        <Button buttonStyle={{ marginVertical: 1 }}
          icon={
            <Icon
              name="garage-open"
              size={40}
              color="white"
            />
          }
          title={"AUTOCLOSE IN " + autoCloseTime + "s"}
          onPress={() => this.autoClosePressed(autoCloseTime)}
        />
      )
    }
    return (
      <View  style={{flex:1}}>
          <ScrollView style={{flex:1.8}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this._onRefresh(navigation)}
              />
            }>
            {this.state.loadingConfig ? <ActivityIndicator animating={this.state.loadingConfig} size="large" color="#0000ff" /> : null }
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
            {autoCloseButtons}
          </ScrollView>
          <Overlay isVisible={this.state.addAutoClose}>
            <View>
              <Text>How long to do want the auto close to be in seconds?</Text>
              <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                onChangeText={(autoCloseTime) => this.setState({newAutoCloseButtonTime: autoCloseTime})}
                keyboardType="numeric"
              />
              <Button style={styles.button}
                title="ADD"
                icon={
                  <Icon
                    name="content-save"
                    size={40}
                    color="white"
                  />
                }
                onPress={() => this.createNewButton(this.state.newAutoCloseButtonTime)} />
                <Button style={styles.button}
                  title="CLOSE"
                  icon={
                    <Icon
                      name="cancel"
                      size={40}
                      color="white"
                    />
                  }
                  onPress={() => this.setState({addAutoClose: false})} />
              </View>
          </Overlay>
          <ActionButton
              buttonColor="rgba(231,76,60,1)"
              onPress={() => this.setState({addAutoClose: true})}
            />
      </View>
    );
  }
}
