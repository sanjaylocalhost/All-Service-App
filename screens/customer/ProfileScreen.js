import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  StatusBar,    // ✅ Added
  Platform,     // ✅ Added
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const user = { name: 'Testing', email: 'sanjayhot39@gmail.com', mobile: '8073665236' };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        },
      },
    ]);
  };

  const menuItems = [
    { icon: 'person', label: 'Edit Profile', action: () => navigation.navigate('EditProfile') },
    { icon: 'location-on', label: 'My Addresses', action: () => {} },
    { icon: 'payment', label: 'Payment Methods', action: () => {} },
    { icon: 'notifications', label: 'Notifications', action: () => {} },
    { icon: 'help', label: 'Help & Support', action: () => {} },
    { icon: 'info', label: 'About', action: () => {} },
  ];

  return (
    <>
      {/* ✅ StatusBar for proper top spacing */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8f9fa" 
        translucent={Platform.OS === 'android'} 
      />
      
      {/* ✅ ScrollView with contentContainerStyle for top padding */}
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userMobile}>📱 {user.mobile}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem} 
              onPress={item.action}
            >
              <Icon name={item.icon} size={24} color="#666" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={handleLogout}
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
  // ✅ NEW: Add top padding to avoid status bar overlap
  scrollContent: { 
    paddingTop: Platform.OS === 'android' ? 45 : 50,
    paddingBottom: 20,
  },
  profileHeader: { 
    backgroundColor: '#fff', 
    padding: 24, 
    alignItems: 'center' 
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#007AFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  avatarText: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#fff' 
  },
  userName: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1a1a1a' 
  },
  userEmail: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4 
  },
  userMobile: { 
    fontSize: 13, 
    color: '#999', 
    marginTop: 2 
  },
  menuSection: { 
    backgroundColor: '#fff', 
    marginTop: 12 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  menuLabel: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333', 
    marginLeft: 12 
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#e74c3c', 
    margin: 20, 
    padding: 14, 
    borderRadius: 12 
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
    paddingBottom: 20 
  },
});

export default ProfileScreen;