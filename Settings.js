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
    this.state = { domain: 'https://your-garage-door.com' }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Settings",
      headerLeft: null
    };
  }

  async componentDidMount() {
    let domain = await AsyncStorage.getItem('domain')
    this.setState({domain})
  }

  save(navigate) {
    AsyncStorage.setItem('domain', this.state.domain, () => {
      navigate('Login')
    })
  }

  render() {
    let {navigate} = this.props.navigation
    return (
      <View style={styles.container}>
        <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(domain) => this.setState({domain})}
        value={this.state.domain}
      />
        <Button
          title="Save"
          onPress={() => this.save(navigate)}
        />
      </View>
    );
  }
}
