import React from "react";
import axios from 'axios'
import { View, StyleSheet, Button } from "react-native";

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
      headerTitle: "Home",
      headerLeft: null
    };
  }

  toggle(accessToken) {
    axios.post('http://192.168.86.31:8080/garage/toggle', {}, {headers: {'Authorization': `Bearer ${accessToken}`}})
    .then(function (response) {
      alert("Toggled")
    })
    .catch(function (error) {
      alert("Failed to toggle")
    });
  }

  oneTimePin(accessToken) {
    axios.post('http://192.168.86.31:8080/user/one-time-pin', {}, {headers: {'Authorization': `Bearer ${accessToken}`}})
    .then(function (response) {
      alert(`Genereated one time pin ${JSON.stringify(response)}`)
    })
    .catch(function (error) {
      alert("Failed to generate one time pin")
    });
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
      </View>
    );
  }
}
