import React from "react";
import { Divider, Text, CheckBox } from 'react-native-elements';
import DatePicker from 'react-native-datepicker'
import moment from 'moment'
import { TextInput, View } from "react-native";
import { getAllSettings, setSettings, resetAutoClose } from "./StorageService";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './Style';
import { logout } from "./LoginService";
import { ScrollView } from "react-native-gesture-handler";
import { getGarageSettings, saveGarageSettings } from "./GarageService"

export default class Settings extends React.Component {

  constructor() {
    super()
    this.state = {domain: '', authDomain: '', authClientId: '', garageSettings: [], garageSettings: []}
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
    var garageSettings = await getGarageSettings()
    if (garageSettings.constructor === Object && Object.entries(garageSettings).length === 0) {
      garageSettings = []
    }
    this.setState({ domain: settings.rsDomain, authDomain: settings.asDomain, authClientId: settings.clientId, garageSettings: garageSettings})
  }

  async save() {
    if (!this.state.domain || !this.state.authDomain || !this.state.authClientId) {
      alert('All values must be set')
      return
    }
    try {
      await setSettings(this.state.domain, this.state.authDomain, this.state.authClientId)
      await saveGarageSettings(this.state.garageSettings)
      this.props.navigation.goBack()
    } catch (error) {
      alert(`Failed to save settings: ${error}`)
    }
  }

  async logoutPressed() {
    logout()
  }

  updateGarageSettings(day, shouldCloseTime = null, canStayOpenTime = null, openDuration = null, enabled = null) {
    let garageSettings = this.state.garageSettings
    if (shouldCloseTime != null) {
      garageSettings.filter(s => s.day === day).forEach(s => {
        let newTime = moment(s.shouldCloseTime)
        newTime.set({
          'hour' : shouldCloseTime.split(":")[0],
          'minute'  : shouldCloseTime.split(":")[1]
       });
       s.shouldCloseTime = newTime.toISOString()
      })
    } else if (canStayOpenTime != null) {
      garageSettings.filter(s => s.day === day).forEach(s => {

        let newTime = moment(s.shouldCloseTime)
        newTime.set({
          'hour' : shouldCloseTime.split(":")[0],
          'minute'  : shouldCloseTime.split(":")[1]
       });
       s.canStayOpenTime = newTime.toISOString()
      })
    } else if (openDuration != null) {
      garageSettings.filter(s => s.day === day).forEach(s => s.openDuration = parseInt(openDuration))
    } else if (enabled != null) {
      garageSettings.filter(s => s.day === day).forEach(s => s.enabled = enabled)
    }
    this.setState({garageSettings: garageSettings})
  }

  getGarageConfiguration(garageSettings) {
    let configuration = []
    for (const value of garageSettings) {
      configuration.push(
      <View key={value.day}>
        <Text h5>{value.day}</Text>
        <Divider style={{ backgroundColor: 'blue', marginBottom: 5, backgroundColor: "#000000" }} />
        <View key={value.day} style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <DatePicker
            style={{width: 100}}
            date={moment(value.canStayOpenTime)}
            mode="time"
            placeholder="select time"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: 'absolute',
                left: 0,
                top: 4,
                marginLeft: 0
              },
              dateInput: {
                marginLeft: 36
              }
            }}
            onDateChange={(date) => {this.updateGarageSettings(value.day, null, canStayOpenTime=date, null, null)}}
          />
          <DatePicker
          style={{width: 100}}
          date={moment(value.shouldCloseTime)}
          mode="time"
          placeholder="select time"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          customStyles={{
            dateIcon: {
              position: 'absolute',
              left: 0,
              top: 4,
              marginLeft: 0
            },
            dateInput: {
              marginLeft: 36
            }
          }}
          onDateChange={(date) => {this.updateGarageSettings(value.day, shouldCloseTime=date, null, null)}}
        />
        <TextInput
          label="Close after"
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(openDuration) => {this.updateGarageSettings(value.day, null, null, openDuration=openDuration, null)}}
          value={"" + value.openDuration}
          keyboardType="numeric"
        />
        <CheckBox
          title='Enabled'
          checked={value.enabled}
          onPress={(enabled) => {this.updateGarageSettings(value.day, null, null, null, enabled=!value.enabled)}}
        />
      </View>
    </View>)
    }
    return configuration
  }

  render() {
    let garageSettings = this.state.garageSettings
    configuration = this.getGarageConfiguration(garageSettings)
    return (
      <ScrollView style={styles.container}>
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
        {configuration}
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
              name="delete"
              size={40}
              color="white"
            />
          }
          title="RESET AUTOCLOSE"
          onPress={() => resetAutoClose()}
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
      </ScrollView>
    );
  }
}
