import React from "react";
import { Clipboard, ScrollView, Text } from "react-native";
import { Card, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { oneTimePin, getOneTimePins, deleteOneTimePin } from "./GarageService";
import { isLoggedIn } from "./LoginService";
import { isSettingsConfigured, getApi } from "./StorageService";
import styles from './Style';

export default class Pin extends React.Component {

  constructor() {
    super()
    this.state = {
      pins: [],
    }
  }

  static navigationOptions = ({ _ }) => {
    return {
      tabBarIcon: (<Icon
        name="pin"
        size={25}
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
      navigation.navigate("Login")
      return
    }
    const pins = await getOneTimePins()
    this.setState({ pins: pins })
  }

  async oneTimePinPressed() {
    await oneTimePin()
    const pins = await getOneTimePins()
    this.setState({ pins: pins })
  }

  async deletePinPressed(pin) {
    await deleteOneTimePin(pin)
    const pins = await getOneTimePins()
    this.setState({ pins: pins })
  }

  async copyPinPressed(pin) {
    const api = await getApi()
    Clipboard.setString(`${api.rsDomain}/user/one-time-pin/${pin}`)
  }

  isUsed(usedTime) {
    return new Date(usedTime).getTime() > 0 ? "Yes" : "No"
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <Button buttonStyle={{ marginVertical: 1 }}
          icon={
            <Icon
              name="pin"
              size={40}
              color="white"
            />
          }
          title="NEW PIN"
          onPress={() => this.oneTimePinPressed()}
        />
        {
          this.state.pins.map((p, i) => {
            return (<Card key={i}
              title={p.pin}>
              <Text style={{ marginBottom: 10 }}>
                Created by: {p.createdBy}
              </Text>
              <Text style={{ marginBottom: 10 }}>
                Used: {this.isUsed(p.used)}
              </Text>
              <Text style={{ marginBottom: 10 }}>
                Created: {new Date(p.created).toLocaleString()}
              </Text>
              <Button buttonStyle={{ marginVertical: 1 }}
                onPress={() => this.copyPinPressed(p.pin)}
                icon={<Icon name='content-copy'
                  size={25}
                  color="white" />}
                title='COPY' />
              <Button buttonStyle={{ marginVertical: 1 }}
                onPress={() => this.deletePinPressed(p.pin)}
                icon={<Icon name='delete'
                  size={25}
                  color="white" />}
                title='DELETE' />
            </Card>)
          })
        }
      </ScrollView>
    );
  }
}
