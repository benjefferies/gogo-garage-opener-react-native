import React from "react";
import axios from 'axios'
import { View, StyleSheet, Button, TextInput, AsyncStorage } from "react-native";

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
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Settings",
      headerLeft: null
    };
  }

  async componentDidMount() {
    let domain = await AsyncStorage.getItem('domain')
    this.setState({ domain: domain ? domain : '' })
  }

  async save(navigate) {
    AsyncStorage.setItem('domain', this.state.domain)
    AsyncStorage.setItem('domain', this.state.domain)
    AsyncStorage.setItem('domain', this.state.domain)
    AsyncStorage.setItem('domain', this.state.domain)
    navigate('Login')
  }

  render() {
    let { navigate } = this.props.navigation
    return (
      <View style={styles.container}>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(domain) => this.setState({ domain })}
          placeholder="Garage Opener Domain"
          value={this.state.domain}
        />
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(auth_server) => this.setState({ auth_server })}
          placeholder="Auth0 Domain"
          value={this.state.auth_server}
        />
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(auth_client_id) => this.setState({ auth_client_id })}
          placeholder="Auth0 Client ID"
          value={this.state.auth_client_id}
        />
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(auth_audience) => this.setState({ auth_audience })}
          placeholder="Auth0 API Audience"
          value={this.state.auth_audience}
        />
        <Button
          title="Save"
          onPress={() => this.save(navigate)}
        />
      </View>
    );
  }
}
