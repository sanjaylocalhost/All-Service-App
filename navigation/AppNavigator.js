import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;



// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ActivityIndicator, View } from 'react-native';

// // --- IMPORT YOUR SCREENS HERE ---
// // Main Tab Screens
// import HomeScreen from '../screens/customer/HomeScreen';
// import ServicesScreen from '../screens/customer/ServicesScreen';
// import MyBookingsScreen from '../screens/customer/MyBookingsScreen';
// import ProfileScreen from '../screens/customer/ProfileScreen';

// // Auth Screens
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';

// // Common Screens
// import ProviderListScreen from '../screens/customer/ProviderListScreen';
// import ProviderDetailsScreen from '../screens/customer/ProviderDetailsScreen';
// import BookingScreen from '../screens/customer/BookingScreen';
// import PaymentScreen from '../screens/customer/PaymentScreen';
// import AboutUsScreen from '../screens/customer/AboutUsScreen';
// import ContactUsScreen from '../screens/customer/ContactUsScreen';
// import ReviewScreen from '../screens/customer/ReviewScreen';
// import NotificationsScreen from '../screens/customer/NotificationsScreen';
// import RentalPropertiesScreen from '../screens/customer/RentalPropertiesScreen';
// import RentalDetailsScreen from '../screens/customer/RentalDetailsScreen';
// import EditProfileScreen from '../screens/customer/EditProfileScreen';
// import AddressesScreen from '../screens/customer/AddressesScreen';
// import PaymentMethodsScreen from '../screens/customer/PaymentMethodsScreen';
// import HelpSupportScreen from '../screens/customer/HelpSupportScreen';
// import BookingHistoryScreen from '../screens/customer/BookingHistoryScreen';

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// const HomeTabs = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;
//           if (route.name === 'Home') {
//             iconName = 'home';
//           } else if (route.name === 'Services') {
//             iconName = 'build';
//           } else if (route.name === 'Bookings') {
//             iconName = 'book-online';
//           } else if (route.name === 'Profile') {
//             iconName = 'person';
//           }
//           return <Icon name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#FF6B6B',
//         tabBarInactiveTintColor: 'gray',
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: '#fff',
//           borderTopWidth: 1,
//           borderTopColor: '#f0f0f0',
//           paddingBottom: 5,
//           paddingTop: 5,
//           height: 60,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '500',
//         },
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="Services" component={ServicesScreen} />
//       <Tab.Screen name="Bookings" component={MyBookingsScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// };

// const AppNavigator = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [userToken, setUserToken] = useState(null);

//   useEffect(() => {
//     // Check if user is logged in
//     const checkAuthState = async () => {
//       try {
//         const token = await AsyncStorage.getItem('userToken');
//         setUserToken(token);
//       } catch (error) {
//         console.error('Error checking auth state:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuthState();
//   }, []);

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
//         <ActivityIndicator size="large" color="#FF6B6B" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         screenOptions={{
//           headerStyle: {
//             backgroundColor: '#fff',
//             elevation: 0,
//             shadowOpacity: 0,
//             borderBottomWidth: 1,
//             borderBottomColor: '#f0f0f0',
//           },
//           headerTitleStyle: {
//             fontSize: 18,
//             fontWeight: '600',
//             color: '#333',
//           },
//           headerBackTitleVisible: false,
//           headerTintColor: '#FF6B6B',
//         }}
//       >
//         {userToken ? (
//           // User is logged in - Show Main App (Tabs)
//           <Stack.Screen 
//             name="MainApp" 
//             component={HomeTabs} 
//             options={{ headerShown: false }}
//           />
//         ) : (
//           // User is not logged in - Show Auth Flow
//           <>
//             <Stack.Screen 
//               name="Login" 
//               component={LoginScreen} 
//               options={{ headerShown: false }}
//             />
//             <Stack.Screen 
//               name="Register" 
//               component={RegisterScreen} 
//               options={{ 
//                 title: 'Create Account',
//                 headerBackTitle: 'Back',
//               }}
//             />
//             <Stack.Screen 
//               name="OtpVerification" 
//               component={OtpVerificationScreen} 
//               options={{ 
//                 title: 'Verify OTP',
//                 headerBackTitle: 'Back',
//               }}
//             />
//           </>
//         )}
        
//         {/* ========================================= */}
//         {/*        COMMON SCREENS FOR ALL USERS       */}
//         {/* ========================================= */}
        
//         {/* Service Related Screens */}
//         <Stack.Screen 
//           name="ProviderList" 
//           component={ProviderListScreen} 
//           options={{ 
//             title: 'Service Providers',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="ProviderDetails" 
//           component={ProviderDetailsScreen} 
//           options={{ 
//             title: 'Provider Details',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="Booking" 
//           component={BookingScreen} 
//           options={{ 
//             title: 'Book Service',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="Payment" 
//           component={PaymentScreen} 
//           options={{ 
//             title: 'Payment',
//             headerBackTitle: 'Back',
//           }}
//         />
        
//         {/* Rental Related Screens */}
//         <Stack.Screen 
//           name="RentalProperties" 
//           component={RentalPropertiesScreen} 
//           options={{ 
//             title: 'Rental Properties',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="RentalDetails" 
//           component={RentalDetailsScreen} 
//           options={{ 
//             title: 'Property Details',
//             headerBackTitle: 'Back',
//           }}
//         />
        
//         {/* Profile Related Screens */}
//         <Stack.Screen 
//           name="EditProfile" 
//           component={EditProfileScreen} 
//           options={{ 
//             title: 'Edit Profile',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="Addresses" 
//           component={AddressesScreen} 
//           options={{ 
//             title: 'My Addresses',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="PaymentMethods" 
//           component={PaymentMethodsScreen} 
//           options={{ 
//             title: 'Payment Methods',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="Notifications" 
//           component={NotificationsScreen} 
//           options={{ 
//             title: 'Notifications',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="BookingHistory" 
//           component={BookingHistoryScreen} 
//           options={{ 
//             title: 'Booking History',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="HelpSupport" 
//           component={HelpSupportScreen} 
//           options={{ 
//             title: 'Help & Support',
//             headerBackTitle: 'Back',
//           }}
//         />
        
//         {/* App Information Screens */}
//         <Stack.Screen 
//           name="AboutUs" 
//           component={AboutUsScreen} 
//           options={{ 
//             title: 'About Us',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="ContactUs" 
//           component={ContactUsScreen} 
//           options={{ 
//             title: 'Contact Us',
//             headerBackTitle: 'Back',
//           }}
//         />
//         <Stack.Screen 
//           name="Review" 
//           component={ReviewScreen} 
//           options={{ 
//             title: 'Write Review',
//             headerBackTitle: 'Back',
//           }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default AppNavigator;