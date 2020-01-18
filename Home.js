import React from "react";
import { RefreshControl, ScrollView, View, Text } from "react-native";
import { Button, Overlay } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getState, toggle } from "./GarageService";
import { isLoggedInOrRefresh, login } from "./LoginService";
import { isSettingsConfigured, addAutocloseTimes, getAutoCloseTimes } from "./StorageService";
import ActionButton from 'react-native-action-button';
import { TextInput } from "react-native-gesture-handler";
import styles from './Style';

export default class Home extends React.Component {

  constructor() {
    super()
    this.state = {
      doorState: 'Loading',
      refreshing: false,
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
      navigation.navigate("Settings")
      return
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
