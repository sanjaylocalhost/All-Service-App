import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  StatusBar,    // ✅ Added
  Platform,     // ✅ Added
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BookingsScreen = ({ navigation }) => {
  const bookings = [
    { id: 1, service: 'Plumbing', provider: 'Rajesh Kumar', date: 'Today, 3:00 PM', status: 'upcoming', price: 450 },
    { id: 2, service: 'AC Repair', provider: 'Amit Sharma', date: 'Yesterday', status: 'completed', price: 800 },
  ];

  const renderBooking = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.bookingCard} 
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
    >
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.bookingService}>{item.service}</Text>
          <Text style={styles.bookingProvider}>{item.provider}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'upcoming' ? '#e3f2fd' : '#e8f5e9' }]}>
          <Text style={[styles.statusText, { color: item.status === 'upcoming' ? '#1976d2' : '#388e3c' }]}>
            {item.status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </Text>
        </View>
      </View>
      <View style={styles.bookingDetails}>
        <Icon name="event" size={16} color="#666" />
        <Text style={styles.bookingDate}>{item.date}</Text>
        <Text style={styles.bookingPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>Track and manage your service appointments</Text>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="assignment" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Book your first service to see it here</Text>
            <TouchableOpacity 
              style={styles.bookBtn} 
              onPress={() => navigation.navigate('Services')}
            >
              <Text style={styles.bookBtnText}>Browse Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>{bookings.map(renderBooking)}</View>
        )}
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
  header: { 
    backgroundColor: '#fff', 
    padding: 20, 
    paddingBottom: 15 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1a1a1a' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#666' 
  },
  list: { 
    padding: 15 
  },
  bookingCard: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    elevation: 2 
  },
  bookingHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  bookingService: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1a1a1a' 
  },
  bookingProvider: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 2 
  },
  statusBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  bookingDetails: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#eee' 
  },
  bookingDate: { 
    fontSize: 13, 
    color: '#666', 
    marginLeft: 6, 
    flex: 1 
  },
  bookingPrice: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#007AFF' 
  },
  emptyState: { 
    alignItems: 'center', 
    padding: 40, 
    marginTop: 40 
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333', 
    marginTop: 16 
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 8, 
    textAlign: 'center' 
  },
  bookBtn: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 24, 
    marginTop: 20 
  },
  bookBtnText: { 
    color: '#fff', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});

export default BookingsScreen;