import React from "react";
import axios from 'axios'
import { View, StyleSheet, Button, AsyncStorage, ScrollView, RefreshControl, Clipboard, Alert } from "react-native";

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

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Garage Opener",
      headerLeft: null
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    let accessToken = await AsyncStorage.getItem('accessToken')
    if (!accessToken) {
      navigation.navigate("Login")
      return
    }
    let domain = await AsyncStorage.getItem('domain')
    axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then((response) => this.setState({ doorState: response.data['Description'] }))
  }

  async toggle() {
    let domain = await AsyncStorage.getItem('domain')
    let accessToken = await AsyncStorage.getItem('accessToken')
    axios.post(`${domain}/garage/toggle`, {}, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then((response) => {
        for (let c = 0; c < 10; c++) {
          setTimeout(() => {
            axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
              .then((response) => {
                this.setState({ doorState: response.data['Description'], refreshing: false })
              }).catch((error) => {
                alert(`Failed to get garage state: ${error}`)
                this.setState({ refreshing: false });
              });
          }, c * 5000)
        }
      })
      .catch((error) => alert(`Failed to toggle: ${error}`));
  }

  async autoclose() {
    let domain = await AsyncStorage.getItem('domain')
    let accessToken = await AsyncStorage.getItem('accessToken')
    axios.post(`${domain}/garage/toggle`, {}, {
      params: {
        autoclose: true
      }, headers: { 'Authorization': `Bearer ${accessToken}` }
    }).then((response) => {
      for (let c = 0; c < 10; c++) {
        setTimeout(() => {
          axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
            .then((response) => {
              this.setState({ doorState: response.data['Description'], refreshing: false })
            }).catch((error) => {
              alert(`Failed to get garage state: ${error}`)
              this.setState({ refreshing: false });
            });
        }, c * 5000)
      }
    })
      .catch((error) => alert(`Failed to toggle: ${error}`));
  }

  async oneTimePin() {
    let domain = await AsyncStorage.getItem('domain')
    let accessToken = await AsyncStorage.getItem('accessToken')
    axios.post(`${domain}/user/one-time-pin`, {}, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then(function (response) {
        Alert.alert('One time pin', 'One time pin generated',
          [
            { text: 'Copy', onPress: () => Clipboard.setString(`${domain}/user/one-time-pin/${response.data["pin"]}`) }
          ],
          { cancelable: false }
        )
      })
      .catch((error) => alert(`Failed to generate one time pin: ${error}`));
  }

  async _onRefresh(navigation) {
    this.setState({ refreshing: true });
    let accessToken = await AsyncStorage.getItem('accessToken')
    let domain = await AsyncStorage.getItem('domain')
    axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then((response) => {
        this.setState({ doorState: response.data['Description'], refreshing: false })
      }).catch((error) => {
        alert(`Failed to get garage state: ${error}`)
        this.setState({ refreshing: false });
      });
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
          <Button style={styles.button}
            title={this.state.doorState}
            onPress={this.toggle}
            type="outline"
          />
          <Button style={styles.button}
            title="Auto close"
            onPress={this.autoclose}
            type="outline"
          />
          <Button style={styles.button}
            title="One time pin"
            onPress={this.oneTimePin}
            type="outline"
          />
          <Button style={styles.button}
            title="Settings"
            onPress={() => navigation.navigate("Settings")}
            type="outline"
          />
        </View>
      </ScrollView>
    );
  }
}
