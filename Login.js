import React from "react";
import axios from 'axios'
import { View, Text, AsyncStorage, Button } from "react-native";
import Auth0 from 'react-native-auth0';


export default class Login extends React.Component {

    async getAuthSettings() {
      let authDomain = await AsyncStorage.getItem('auth_domain') // gogo-garage-opener.eu.auth0.com
      let authClient = await AsyncStorage.getItem('auth_client_id') // v31OMS8iXKbzZPMXzs1Ltq0gIegv5nbT
      let authAudience = await AsyncStorage.getItem('auth_audience') // 'https://open.mygaragedoor.space/api'
      if (!authDomain || !authClient || !authAudience) {
        return {}
      }
      return {
        authDomain,
        authClient,
        authAudience
      }
    }

    async _login(navigate) {
      auth = getAuthSettings()
      const auth0 = new Auth0({ domain: auth.authDomain, clientId: auth.authClient });
      auth0.webAuth
          .authorize({scope: 'openid profile email', audience: auth.authAudience})
          .then(credentials => {
              AsyncStorage.setItem('accessToken', credentials.accessToken, () => {
                axios.post(`${this.state.domain}/user/login`, {}, {headers: {'Authorization': `Bearer ${credentials.accessToken}`}})
                .then(function (response) {
                  navigate('Home', {accessToken: credentials.accessToken})
                })
                .catch(function (error) {
                  alert(`Could not login ${error}`)
                });
              })
          })
          .catch(error => console.log(error));
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
      this.setState({domain})
      if (!domain || Object.keys(getAuthSettings()).length === 0) {
        navigate('Settings')
      } else {
        AsyncStorage.getItem('accessToken', (err, accessToken) => {
          if (err || !accessToken) {
            this._login(navigate)
          }
          let payload = accessToken.split(".")[1];
          let exp = JSON.parse(atob(payload)).exp
          var current_time = new Date().getTime() / 1000;
          if (current_time < exp) {
            axios.post(`${this.state.domain}/user/login`, {}, {headers: {'Authorization': `Bearer ${accessToken}`}})
            .then(function (response) {
              navigate('Home', {accessToken: accessToken})
            })
            .catch(function (error) {
              alert(`Could not login ${error}`)
            });
          } else {
            this._login(navigate)
          }
        })
      }
    }

    render() {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Login"
          onPress={() => this.tryLogin()}
        />
          <Button
            title="Settings"
            onPress={() => this.props.navigation.navigate("Settings")}
          />
        </View>
      );
    }
  }
