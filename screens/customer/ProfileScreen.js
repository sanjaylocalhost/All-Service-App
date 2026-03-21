import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Get token and user data from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token) {
        setUserToken(token);
      }
      
      if (userData) {
        // If user data exists in storage, use it
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
      } else if (token) {
        // If only token exists, fetch user data from API
        await fetchUserProfile(token);
      } else {
        // No user data, use default or show login
        setUser({
          name: 'Guest User',
          email: 'guest@example.com',
          mobile: 'Not provided',
          profileImage: null,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser({
        name: 'User',
        email: 'user@example.com',
        mobile: 'Not available',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        // Save to AsyncStorage for future use
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If API fails, try to get from AsyncStorage again
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        setUser(JSON.parse(storedUserData));
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout', 
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all user data from AsyncStorage
              await AsyncStorage.multiRemove(['userToken', 'userData', 'userEmail', 'userPassword']);
              
              // Optionally call logout API if needed
              if (userToken) {
                await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
                  headers: { Authorization: `Bearer ${userToken}` }
                }).catch(err => console.log('Logout API error:', err));
              }
              
              // Reset navigation to Auth screen
              navigation.reset({ 
                index: 0, 
                routes: [{ name: 'Auth' }] 
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Still reset navigation even if API fails
              navigation.reset({ 
                index: 0, 
                routes: [{ name: 'Auth' }] 
              });
            }
          },
        },
      ],
    );
  };

  const menuItems = [
    { 
      icon: 'person', 
      label: 'Edit Profile', 
      action: () => navigation.navigate('EditProfile', { userData: user }) 
    },
    { 
      icon: 'location-on', 
      label: 'My Addresses', 
      action: () => navigation.navigate('Addresses') 
    },
    { 
      icon: 'payment', 
      label: 'Payment Methods', 
      action: () => navigation.navigate('PaymentMethods') 
    },
    { 
      icon: 'notifications', 
      label: 'Notifications', 
      action: () => navigation.navigate('Notifications') 
    },
    { 
      icon: 'history', 
      label: 'Booking History', 
      action: () => navigation.navigate('BookingHistory') 
    },
    { 
      icon: 'help', 
      label: 'Help & Support', 
      action: () => navigation.navigate('HelpSupport') 
    },
    { 
      icon: 'info', 
      label: 'About', 
      action: () => Alert.alert('About', 'Service Provider App\nVersion 1.0.0') 
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    // Format as +91 XXXXX XXXXX if needed
    return phone;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8f9fa" 
        translucent={Platform.OS === 'android'} 
      />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#FF6B6B"
            colors={['#FF6B6B']}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {user?.profileImage ? (
            <Image 
              source={{ uri: user.profileImage }} 
              style={styles.avatarImage} 
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: user?.avatarColor || '#FF6B6B' }]}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
          )}
          
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          <Text style={styles.userMobile}>
            <Icon name="phone" size={12} color="#999" /> {formatPhoneNumber(user?.mobile)}
          </Text>
          
          {/* Membership Status */}
          {user?.membership && (
            <View style={styles.membershipBadge}>
              <Icon name="stars" size={14} color="#FFD700" />
              <Text style={styles.membershipText}>{user.membership} Member</Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.completedBookings || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.rating || 0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem} 
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Icon name={item.icon} size={22} color="#FF6B6B" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>App Version 1.0.0</Text>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  scrollContent: { 
    paddingTop: Platform.OS === 'android' ? 45 : 50,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  profileHeader: { 
    backgroundColor: '#fff', 
    padding: 24, 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#FF6B6B', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FF6B6B',
  },
  avatarText: { 
    fontSize: 40, 
    fontWeight: '700', 
    color: '#fff' 
  },
  userName: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 4,
  },
  userMobile: { 
    fontSize: 13, 
    color: '#999',
    marginTop: 2,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 6,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#f0f0f0',
  },
  menuSection: { 
    backgroundColor: '#fff', 
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333', 
    fontWeight: '500',
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FF6B6B', 
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    padding: 14, 
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  version: { 
    textAlign: 'center', 
    color: '#999', 
    fontSize: 12, 
    paddingVertical: 20,
  },
});

export default ProfileScreen;