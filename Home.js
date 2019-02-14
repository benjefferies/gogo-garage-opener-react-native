import React from "react";
import axios from 'axios'
import { View, StyleSheet, Button, AsyncStorage } from "react-native";
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({ domain: 'gogo-garage-opener.eu.auth0.com', clientId: 'v31OMS8iXKbzZPMXzs1Ltq0gIegv5nbT' });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1'
  },
});


export default class Home extends React.Component {

  constructor() {
    super()
    this.state = { doorState: 'Loading' }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Garage Opener",
      headerLeft: null
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const accessToken = navigation.getParam('accessToken');
    let domain = await AsyncStorage.getItem('domain')
    axios.get(`${domain}/garage/state`, {headers: {'Authorization': `Bearer ${accessToken}`}})
    .then((response) => this.setState({doorState: response.data['Description']}))
    .catch(function (error) {
      alert("Failed to get garage state")
    });
  }

  async toggle(accessToken) {
    let domain = await AsyncStorage.getItem('domain')
    axios.post(`${domain}/garage/toggle`, {}, {headers: {'Authorization': `Bearer ${accessToken}`}})
    .then(function (response) {
      alert("Toggled")
    })
    .catch(function (error) {
      alert("Failed to toggle")
    });
  }

  async oneTimePin(accessToken) {
    let domain = await AsyncStorage.getItem('domain')
    axios.post(`${domain}/user/one-time-pin`, {}, {headers: {'Authorization': `Bearer ${accessToken}`}})
    .then(function (response) {
      alert(`${domain}/garage/one-time-pin/${response.data["pin"]}`)
    })
    .catch(function (error) {
      alert("Failed to generate one time pin")
    });
  }
  
  logout() {
    auth0.webAuth
    .clearSession()
    .then(() => {
        AsyncStorage.removeItem('accessToken')
    })
    .catch(error => console.log(error));
  }

  render() {
    const { navigation } = this.props;
    const accessToken = navigation.getParam('accessToken');
    return (
      <View style={styles.container}>
        <Button
          title={this.state.doorState}
          onPress={() => this.toggle(accessToken)}
        />
        <Button
          title="One time pin"
          onPress={() => this.oneTimePin(accessToken)}
        />
        <Button
          title="Settings"
          onPress={() => navigation("Settings")}
        />
        <Button
          title="Log out"
          onPress={() => this.logout()}
        />
      </View>
    );
  }
}
