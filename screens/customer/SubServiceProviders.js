import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SubServiceProviders = ({ route, navigation }) => {
  const { subService, category } = route.params || {};
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching providers specific to this sub-service
    setTimeout(() => {
      setProviders([
        { _id: '1', name: 'John Doe', service: subService?.name || category, rating: 4.8, reviews: 120, price: 450, profileImage: 'https://i.pravatar.cc/150?img=11' },
        { _id: '2', name: 'Jane Smith', service: subService?.name || category, rating: 4.6, reviews: 85, price: 400, profileImage: 'https://i.pravatar.cc/150?img=12' },
        { _id: '3', name: 'Mike Ross', service: subService?.name || category, rating: 4.9, reviews: 200, price: 500, profileImage: 'https://i.pravatar.cc/150?img=13' },
      ]);
      setLoading(false);
    }, 1000);
  }, [subService, category]);

  const renderProvider = ({ item }) => (
    <TouchableOpacity style={styles.providerCard}>
      <Image source={{ uri: item.profileImage }} style={styles.providerImage} />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerService}>{item.service}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
        </View>
        <Text style={styles.price}>₹{item.price}/hr</Text>
      </View>
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookBtnText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{subService?.name || category}</Text>
          <Text style={styles.headerSubtitle}>Available Providers</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={providers}
          renderItem={renderProvider}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    paddingTop: 50, // Status bar padding
    elevation: 2,
  },
  titleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#999' },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  providerImage: { width: 60, height: 60, borderRadius: 30 },
  providerInfo: { flex: 1, marginLeft: 15 },
  providerName: { fontSize: 16, fontWeight: '600', color: '#333' },
  providerService: { fontSize: 13, color: '#999', marginBottom: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 5 },
  price: { fontSize: 14, fontWeight: '700', color: '#FF6B6B', marginTop: 4 },
  bookBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
});

export default SubServiceProviders;