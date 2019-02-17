import React from "react";
import { View, StyleSheet, Button, TextInput, AsyncStorage } from "react-native";

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
    this.state = {domain: '', authDomain: '', authClientId: '', authAudience: '', autoclose: '60'}
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Settings",
      headerLeft: null
    };
  }

  async componentDidMount() {
    let domain = await AsyncStorage.getItem('domain')
    let authDomain = await AsyncStorage.getItem('auth_domain')
    let authClientId = await AsyncStorage.getItem('auth_client_id')
    let authAudience = await AsyncStorage.getItem('auth_audience')
    let autoclose = await AsyncStorage.getItem('autoclose')

    this.setState({ domain: domain, authDomain: authDomain, authClientId: authClientId, authAudience: authAudience, autoclose: autoclose})
  }

  async save(navigate) {
    if (!this.state.domain || !this.state.authDomain || !this.state.authClientId || !this.state.authAudience || !this.state.autoclose) {
      alert('All values must be set')
      return
    }
    try {
      await AsyncStorage.multiSet([
        ['domain', this.state.domain],
        ['auth_domain', this.state.authDomain],
        ['auth_client_id', this.state.authClientId],
        ['auth_audience', this.state.authAudience],
        ['autoclose', this.state.autoclose]
      ])
    } catch (error) {
      alert(`Failed to save settings: ${error}`)
    }
    navigate("Login")
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
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(authAudience) => this.setState({ authAudience })}
          placeholder="Auth0 API Audience"
          value={this.state.authAudience}
        />
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={(autoclose) => this.setState({ autoclose })}
          placeholder="Autoclose time"
          value={this.state.autoclose}
        />
        <Button
          title="Save"
          onPress={() => this.save(navigate)}
        />
      </View>
    );
  }
}
