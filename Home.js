import React from "react";
import axios from 'axios'
import { View, StyleSheet, Button, AsyncStorage, ScrollView, RefreshControl, Clipboard } from "react-native";

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
    const accessToken = navigation.getParam('accessToken');
    let domain = await AsyncStorage.getItem('domain')
    axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then((response) => this.setState({ doorState: response.data['Description'] }))
      .catch((error) => alert(`Failed to get garage state: ${error}`));
  }

  async toggle(accessToken) {
    let domain = await AsyncStorage.getItem('domain')
    axios.post(`${domain}/garage/toggle`, {}, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then((response) => {
        for (let c = 0; c < 10; c++) {
          setTimeout(() => {
            axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
              .then((response) => {
                this.setState({ doorState: response.data['Description'], refreshing: false })
              }).catch(() => {
                alert(`Failed to get garage state: ${error}`)
                this.setState({ refreshing: false });
              });
          }, c * 5000)
        }
      })
      .catch((error) => alert(`Failed to toggle: ${error}`));
  }

  async autoclose(accessToken) {
    let domain = await AsyncStorage.getItem('domain')
    let autoclose = await AsyncStorage.getItem('autoclose')
    axios.post(`${domain}/garage/toggle`, {}, {
      params: {
        autoclose: autoclose
      }, headers: { 'Authorization': `Bearer ${accessToken}` }
    }).then((response) => {
      for (let c = 0; c < 10; c++) {
        setTimeout(() => {
          axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
            .then((response) => {
              this.setState({ doorState: response.data['Description'], refreshing: false })
            }).catch(() => {
              alert(`Failed to get garage state: ${error}`)
              this.setState({ refreshing: false });
            });
        }, c * 5000)
      }
    })
      .catch((error) => alert(`Failed to toggle: ${error}`));
  }

  async oneTimePin(accessToken) {
    let domain = await AsyncStorage.getItem('domain')
    axios.post(`${domain}/user/one-time-pin`, {}, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then(function (response) {
        alert('One time pin', 'One time pin generated tests',
          [
            { text: 'Copy', onPress: () => Clipboard.setString(response.data["pin"]) }
          ],
          { cancelable: false }
        )
      })
      .catch((error) => alert(`Failed to generate one time pin: ${error}`));
  }

  async _onRefresh(navigation) {
    this.setState({ refreshing: true });
    const accessToken = navigation.getParam('accessToken');
    let domain = await AsyncStorage.getItem('domain')
    axios.get(`${domain}/garage/state`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      .then((response) => {
        this.setState({ doorState: response.data['Description'], refreshing: false })
      }).catch(() => {
        alert(`Failed to get garage state: ${error}`)
        this.setState({ refreshing: false });
      });
  }

  render() {
    const { navigation } = this.props;
    const accessToken = navigation.getParam('accessToken');
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
            onPress={() => this.toggle(accessToken)}
          />
          <Button style={styles.button}
            title="Auto close"
            onPress={() => this.autoclose(accessToken)}
          />
          <Button style={styles.button}
            title="One time pin"
            onPress={() => this.oneTimePin(accessToken)}
          />
          <Button style={styles.button}
            title="Settings"
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
      </ScrollView>
    );
  }
}
