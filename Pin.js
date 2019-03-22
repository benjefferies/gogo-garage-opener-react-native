import React from "react";
import { Alert, Clipboard, View } from "react-native";
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { oneTimePin } from "./GarageService";
import { isLoggedIn } from "./LoginService";
import { isSettingsConfigured } from "./StorageService";
import styles from './Style';

export default class Pin extends React.Component {

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
  render() {
    return (
      <View  style={styles.container}>
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
      </View>
    );
  }
}
