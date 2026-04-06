import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// ✅ Use MaterialCommunityIcons for outlined icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './customer/HomeScreen';
import ServicesScreen from './customer/ServicesScreen';
import BookingsScreen from './customer/MyBookingsScreen';
import ProfileScreen from './customer/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
  case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
  case 'Services': iconName = focused ? 'wrench' : 'wrench-outline'; break;
  case 'Bookings': iconName = focused ? 'clipboard-check' : 'clipboard-text-outline'; break;
  case 'Profile': iconName = focused ? 'account' : 'account-outline'; break;
}
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Booking" component={BookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainApp;