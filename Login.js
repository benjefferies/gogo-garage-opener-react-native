import React from "react";
import axios from 'axios'
import { View, Text, AsyncStorage, Button } from "react-native";
import {decode as atob} from 'base-64'
import Auth0 from 'react-native-auth0';


export default class Login extends React.Component {

    async _login(navigate) {
      let authDomain = await AsyncStorage.getItem('auth_domain') // gogo-garage-opener.eu.auth0.com
      let authClient = await AsyncStorage.getItem('auth_client_id') // v31OMS8iXKbzZPMXzs1Ltq0gIegv5nbT
      let authAudience = await AsyncStorage.getItem('auth_audience') // 'https://open.mygaragedoor.space/api'
      const auth0 = new Auth0({ domain: authDomain, clientId: authClient });
      auth0.webAuth
          .authorize({scope: 'openid profile email', audience: authAudience})
          .then(credentials => {
              AsyncStorage.setItem('accessToken', credentials.accessToken, () => {
                axios.post(`${this.state.domain}/user/login`, {}, {headers: {'Authorization': `Bearer ${credentials.accessToken}`}})
                .then(function (response) {
                  navigate('Home', {accessToken: credentials.accessToken})
                })
                .catch((error) => alert(`Could not login to garage opener: ${error}`));
              })
          })
          .catch(error => alert(`Failed to login auth0: ${error}`));
    }

    componentDidMount() {
      this.props.navigation.addListener('willFocus', ()=>{
        this.tryLogin()
      });
      this.tryLogin()
    }

    async tryLogin() {
      let {navigate} = this.props.navigation
      let domain = await AsyncStorage.getItem('domain')
      let authDomain = await AsyncStorage.getItem('auth_domain')
      this.setState({domain})
      if (!domain || !authDomain) {
        navigate('Settings')
      } else {
        AsyncStorage.getItem('accessToken', (err, accessToken) => {
          if (err || !accessToken) {
            this._login(navigate)
          }
          if (accessToken) {
            let payload = accessToken.split(".")[1];
            let exp = JSON.parse(atob(payload)).exp
            var current_time = new Date().getTime() / 1000;
            if (current_time < exp) {
              axios.post(`${this.state.domain}/user/login`, {}, {headers: {'Authorization': `Bearer ${accessToken}`}})
              .then(function (response) {
                navigate('Home', {accessToken: accessToken})
              })
              .catch((error) => {
                alert(`Could not login ${error}`)
                console.log(error)
              });
            } else {
              this._login(navigate)
            }
        }
        })
      }
    }

    render() {
      let {navigate} = this.props.navigation
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Login"
          onPress={() => this.tryLogin()}
        />
          <Button
            title="Settings"
            onPress={() => navigate("Settings")}
          />
        </View>
      );
    }
  }
