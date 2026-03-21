import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationsScreen = ({ navigation }) => {
  // Mock Data for Notifications
  const notifications = [
    {
      id: '1',
      title: 'Booking Confirmed',
      message: 'Your service with Rajesh Kumar is confirmed for tomorrow at 10:00 AM.',
      time: '2 mins ago',
      type: 'success',
      image: 'https://cdn-icons-png.flaticon.com/512/5610/5610920.png',
    },
    {
      id: '2',
      title: 'Special Offer!',
      message: 'Get 20% off on AC cleaning services this weekend.',
      time: '1 hour ago',
      type: 'promo',
      image: 'https://cdn-icons-png.flaticon.com/512/2620/2620551.png',
    },
    {
      id: '3',
      title: 'Payment Successful',
      message: 'Your payment of ₹500 for Plumbing services was successful.',
      time: '5 hours ago',
      type: 'info',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.notificationCard}>
      <Image source={{ uri: item.image }} style={styles.notificationIcon} />
      <View style={styles.notificationContent}>
        <View style={styles.headerRow}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} /> {/* Spacer for center alignment */}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default NotificationsScreen;