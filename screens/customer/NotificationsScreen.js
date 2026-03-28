// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StatusBar,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const NotificationsScreen = ({ navigation }) => {
//   // Mock Data for Notifications
//   const notifications = [
//     {
//       id: '1',
//       title: 'Booking Confirmed',
//       message: 'Your service with Rajesh Kumar is confirmed for tomorrow at 10:00 AM.',
//       time: '2 mins ago',
//       type: 'success',
//       image: 'https://cdn-icons-png.flaticon.com/512/5610/5610920.png',
//     },
//     {
//       id: '2',
//       title: 'Special Offer!',
//       message: 'Get 20% off on AC cleaning services this weekend.',
//       time: '1 hour ago',
//       type: 'promo',
//       image: 'https://cdn-icons-png.flaticon.com/512/2620/2620551.png',
//     },
//     {
//       id: '3',
//       title: 'Payment Successful',
//       message: 'Your payment of ₹500 for Plumbing services was successful.',
//       time: '5 hours ago',
//       type: 'info',
//       image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
//     },
//   ];

//   const renderItem = ({ item }) => (
//     <View style={styles.notificationCard}>
//       <Image source={{ uri: item.image }} style={styles.notificationIcon} />
//       <View style={styles.notificationContent}>
//         <View style={styles.headerRow}>
//           <Text style={styles.notificationTitle}>{item.title}</Text>
//           <Text style={styles.timeText}>{item.time}</Text>
//         </View>
//         <Text style={styles.notificationMessage}>{item.message}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Notifications</Text>
//         <View style={{ width: 24 }} /> {/* Spacer for center alignment */}
//       </View>

//       <FlatList
//         data={notifications}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEEEEE',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#333',
//   },
//   listContent: {
//     padding: 20,
//   },
//   notificationCard: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     padding: 15,
//     borderRadius: 16,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     elevation: 2,
//   },
//   notificationIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#F0F0F0',
//   },
//   notificationContent: {
//     flex: 1,
//     marginLeft: 15,
//     justifyContent: 'center',
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   notificationTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   timeText: {
//     fontSize: 12,
//     color: '#999',
//   },
//   notificationMessage: {
//     fontSize: 14,
//     color: '#666',
//     lineHeight: 20,
//   },
// });

// export default NotificationsScreen;


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Booking Confirmed',
      message: 'Your appointment with Rajesh Kumar (Plumber) has been confirmed for tomorrow at 10:00 AM',
      time: '2 hours ago',
      read: false,
      type: 'booking',
      date: '2024-01-15',
      bookingId: 'B12345',
      providerName: 'Rajesh Kumar',
      service: 'Plumbing',
      amount: '₹500'
    },
    {
      id: '2',
      title: 'Special Offer',
      message: 'Get 20% off on your first booking! Use code: WELCOME20',
      time: '1 day ago',
      read: false,
      type: 'offer',
      promoCode: 'WELCOME20',
      discount: '20%'
    },
    {
      id: '3',
      title: 'Service Completed',
      message: 'Your service with Priya Singh (Electrician) has been completed. Please rate your experience.',
      time: '2 days ago',
      read: true,
      type: 'feedback',
      bookingId: 'B12346',
      providerName: 'Priya Singh',
      service: 'Electrical'
    },
    {
      id: '4',
      title: 'Payment Received',
      message: 'Payment of ₹400 has been successfully processed for your booking with Amit Sharma',
      time: '3 days ago',
      read: true,
      type: 'payment',
      amount: '₹400',
      bookingId: 'B12347'
    },
    {
      id: '5',
      title: 'New Service Available',
      message: 'Professional AC repair services are now available in your area',
      time: '5 days ago',
      read: false,
      type: 'service',
      serviceName: 'AC Repair'
    }
  ]);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(notif => notif.id !== id));
          }
        }
      ]
    );
  };

  const markAllAsRead = () => {
    if (notifications.some(n => !n.read)) {
      Alert.alert(
        'Mark All as Read',
        'Mark all notifications as read?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark All',
            onPress: () => {
              setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
              );
            }
          }
        ]
      );
    }
  };

  const clearAllNotifications = () => {
    if (notifications.length > 0) {
      Alert.alert(
        'Clear All',
        'Are you sure you want to clear all notifications?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: () => {
              setNotifications([]);
            }
          }
        ]
      );
    }
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const handleAction = (notification) => {
    setModalVisible(false);
    
    switch (notification.type) {
      case 'booking':
        navigation.navigate('BookingDetails', { bookingId: notification.bookingId });
        break;
      case 'feedback':
        navigation.navigate('RateService', { 
          providerName: notification.providerName,
          bookingId: notification.bookingId 
        });
        break;
      case 'payment':
        navigation.navigate('PaymentHistory', { bookingId: notification.bookingId });
        break;
      case 'offer':
        // Copy promo code to clipboard
        Alert.alert('Promo Code', `Code: ${notification.promoCode} copied to clipboard!`);
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Icon name="event-available" size={24} color="#4CAF50" />;
      case 'offer':
        return <Icon name="local-offer" size={24} color="#FF9800" />;
      case 'feedback':
        return <Icon name="star-rate" size={24} color="#FFC107" />;
      case 'payment':
        return <Icon name="payment" size={24} color="#2196F3" />;
      case 'service':
        return <Icon name="build" size={24} color="#9C27B0" />;
      default:
        return <Icon name="notifications" size={24} color="#FF6B6B" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'booking':
        return '#E8F5E9';
      case 'offer':
        return '#FFF3E0';
      case 'feedback':
        return '#FFF8E1';
      case 'payment':
        return '#E3F2FD';
      case 'service':
        return '#F3E5F5';
      default:
        return '#FFF0F0';
    }
  };

  const renderRightActions = (id) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(id)}
      >
        <Icon name="delete" size={24} color="#FFF" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderNotification = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.notificationIcon, { backgroundColor: getBackgroundColor(item.type) }]}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const NotificationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notification Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedNotification && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.modalIcon, { backgroundColor: getBackgroundColor(selectedNotification.type) }]}>
                {getNotificationIcon(selectedNotification.type)}
              </View>

              <Text style={styles.modalNotificationTitle}>{selectedNotification.title}</Text>
              <Text style={styles.modalTime}>{selectedNotification.time}</Text>

              <View style={styles.divider} />

              <Text style={styles.modalMessage}>{selectedNotification.message}</Text>

              {selectedNotification.type === 'booking' && (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Booking ID:</Text>
                    <Text style={styles.detailValue}>{selectedNotification.bookingId}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Provider:</Text>
                    <Text style={styles.detailValue}>{selectedNotification.providerName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service:</Text>
                    <Text style={styles.detailValue}>{selectedNotification.service}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>{selectedNotification.amount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{selectedNotification.date}</Text>
                  </View>
                </View>
              )}

              {selectedNotification.type === 'offer' && (
                <View style={styles.promoContainer}>
                  <Text style={styles.promoLabel}>Promo Code</Text>
                  <View style={styles.promoCodeContainer}>
                    <Text style={styles.promoCode}>{selectedNotification.promoCode}</Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => Alert.alert('Copied!', 'Promo code copied to clipboard')}
                    >
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.promoText}>Get {selectedNotification.discount} off on your first booking!</Text>
                </View>
              )}

              {selectedNotification.type === 'feedback' && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>How was your experience with {selectedNotification.providerName}?</Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} style={styles.starButton}>
                        <Icon name="star-outline" size={32} color="#FFC107" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(selectedNotification)}
              >
                <Text style={styles.actionButtonText}>
                  {selectedNotification.type === 'booking' && 'View Booking'}
                  {selectedNotification.type === 'offer' && 'Apply Now'}
                  {selectedNotification.type === 'feedback' && 'Rate Now'}
                  {selectedNotification.type === 'payment' && 'View Details'}
                  {selectedNotification.type === 'service' && 'Book Now'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Mark all</Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBar}>
          <Text style={styles.unreadBarText}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />

      {notifications.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearAllNotifications}>
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}

      <NotificationModal />
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
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 5,
  },
  headerButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  unreadBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0E0',
  },
  unreadBarText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  markAllText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  unreadNotification: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  notificationTime: {
    fontSize: 10,
    color: '#999',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '70%',
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalNotificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalTime: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  promoContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  promoLabel: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 8,
  },
  promoCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  promoCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    letterSpacing: 1,
  },
  copyButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  promoText: {
    fontSize: 12,
    color: '#FF9800',
  },
  ratingContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  starButton: {
    padding: 5,
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  clearButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationsScreen;