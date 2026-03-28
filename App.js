import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import OtpVerificationScreen from './screens/auth/OtpVerificationScreen';
import MainApp from './screens/MainApp';
import ProviderListScreen from './screens/customer/ProviderListScreen';
import ProviderDetailsScreen from './screens/customer/ProviderDetailsScreen';
import HelpSupportScreen from './screens/customer/HelpSupportScreen';
// import BookingsScreen from './screens/customer/MyBookingsScreen';
import EditProfileScreen from './screens/customer/EditProfileScreen';

import NotificationsScreen from './screens/customer/NotificationsScreen';
import PaymentMethodsScreen from './screens/customer/PaymentMethodsScreen';

import AddressesScreen from './screens/customer/AddressesScreen';

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
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Addresses"
          component={AddressesScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
          options={{ headerShown: false }}
        />

        {/* <Stack.Screen
          name="Bookings"
          component={myBookingsScreen}
          options={{ headerShown: false }}
        /> */}

        <Stack.Screen
          name="PaymentMethods"
          component={PaymentMethodsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;