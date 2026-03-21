import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import OtpVerificationScreen from './screens/auth/OtpVerificationScreen';
import MainApp from './screens/MainApp';
import ProviderListScreen from './screens/customer/ProviderListScreen';
import ProviderDetailsScreen from './screens/customer/ProviderDetailsScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="MainApp" component={MainApp} />
        <Stack.Screen name="ProviderList" component={ProviderListScreen} />
        <Stack.Screen name="ProviderDetails" component={ProviderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;