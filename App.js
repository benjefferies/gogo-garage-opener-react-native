import React from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Home from "./Home";
import Login from "./Login";
import Settings from "./Settings";

const AppNavigator = createStackNavigator(
  {
    Login: Login,
    Home: Home,
    Settings: Settings
  },
  {
    initialRouteName: "Login"
  }
);

const prevGetStateForAction = AppNavigator.router.getStateForAction;

AppNavigator.router.getStateForAction = (action, state) => {
  // Do not allow to go back from Home
  if (action.type === 'Navigation/BACK' && state && state.routes[state.index].routeName === 'Home') {
    return null;
  }

  // Do not allow to go back to Login
  if (action.type === 'Navigation/BACK' && state) {
    const newRoutes = state.routes.filter(r => r.routeName !== 'Login');
    const newIndex = newRoutes.length - 1;
    return prevGetStateForAction(action, { index: newIndex, routes: newRoutes });
  }
  return prevGetStateForAction(action, state);
};

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}