import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ServicesScreen from './screens/ServicesScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddressesScreen from './screens/AddressesScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';

// Import screens (keep your existing imports)
// ...

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Services') {
            iconName = 'build';
          } else if (route.name === 'Bookings') {
            iconName = 'book-online';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
          // User is logged in
          <Stack.Screen
            name="MainApp"
            component={HomeTabs}
            options={{ headerShown: false }}
          />
        ) : (
          // User is not logged in
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen
              name="OtpVerification"
              component={OtpVerificationScreen}
              options={{ title: 'Verify OTP' }}
            />
          </>
        )}

        {/* Common screens (accessible to both logged in and non-logged in users) */}
        <Stack.Screen
          name="ProviderList"
          component={ProviderListScreen}
          options={{ title: 'Service Providers' }}
        />
        <Stack.Screen
          name="ProviderDetails"
          component={ProviderDetailsScreen}
          options={{ title: 'Provider Details' }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: 'Book Service' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Payment' }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsScreen}
          options={{ title: 'About Us' }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={{ title: 'Contact Us' }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{ title: 'Write Review' }}
        />
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
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            headerShown: false,
            presentation: 'modal', // Optional: makes it slide up on iOS
          }}
        />


      </Stack.Navigator>


    </NavigationContainer>
  );
};

export default AppNavigator;

