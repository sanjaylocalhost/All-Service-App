import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
  StatusBar, // ✅ Added for status bar handling
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { serviceCategories } from '../../constants/data';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching location...');
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    fetchFeaturedProviders();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to show nearby services',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const applyFallback = () => {
      setLocationLoading(false);
      setLocation({ latitude: 12.9716, longitude: 77.5946 });
      setAddress('Bangalore, Karnataka');
    };

    try {
      if (!Geolocation) {
        console.warn('⚠️ Geolocation module is null - using fallback');
        applyFallback();
        return;
      }

      if (typeof Geolocation.getCurrentPosition !== 'function') {
        console.warn('⚠️ getCurrentPosition not a function - using fallback');
        applyFallback();
        return;
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.log('📍 Permission denied by user');
        applyFallback();
        return;
      }

      try {
        Geolocation.getCurrentPosition(
          (position) => {
            try {
              const { latitude, longitude } = position?.coords || {};
              if (latitude && longitude) {
                setLocation({ latitude, longitude });
                getAddressFromCoordinates(latitude, longitude);
              } else {
                applyFallback();
              }
              setLocationLoading(false);
            } catch (e) {
              console.error('📍 Success callback error:', e);
              applyFallback();
            }
          },
          (error) => {
            console.log('📍 Location error (handled):', error?.message || error);
            applyFallback();
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 5000,
            showLocationDialog: true,
          }
        );
      } catch (geoError) {
        console.error('📍 Geolocation call exception:', geoError);
        applyFallback();
      }
    } catch (err) {
      console.error('📍 Outer exception:', err);
      applyFallback();
    }
  };

  // ✅ FIXED: Removed extra spaces in Google Maps URL
  const getAddressFromCoordinates = async (lat, lng) => {
    const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
    
    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('⚠️ Google Maps API key not set - using fallback address');
      return;
    }

    try {
      // ✅ FIXED: No extra spaces after latlng=
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      
      if (response.data?.results?.[0]?.formatted_address) {
        const fullAddress = response.data.results[0].formatted_address;
        const shortAddress = fullAddress.split(',')[0];
        setAddress(shortAddress);
      }
    } catch (e) {
      console.log('📍 Geocode error (non-critical):', e.message);
    }
  };

  const fetchFeaturedProviders = async () => {
    try {
      const endpoint = `${API_BASE_URL}/providers/featured`;
      const response = await axios.get(endpoint, { timeout: 10000 });
      const providers = response.data?.providers || response.data || [];
      setFeaturedProviders(providers);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.log('📦 Providers fetch error:', error.message);
      }
      setFeaturedProviders([
        { _id: 's1', name: 'Rajesh Kumar', service: 'Plumber', rating: 4.5, reviews: 120, price: 300, profileImage: 'https://i.pravatar.cc/150?img=1' },
        { _id: 's2', name: 'Priya Singh', service: 'Electrician', rating: 4.8, reviews: 85, price: 400, profileImage: 'https://i.pravatar.cc/150?img=5' },
        { _id: 's3', name: 'Amit Sharma', service: 'AC Repair', rating: 4.3, reviews: 60, price: 500, profileImage: 'https://i.pravatar.cc/150?img=3' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Services', { category: item })}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <Icon name={item.icon} size={28} color={item.color} />
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProviderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => navigation.navigate('ProviderDetails', { providerId: item._id })}
    >
      <Image 
        source={{ uri: item.profileImage?.trim() || 'https://via.placeholder.com/80' }} 
        style={styles.providerImage} 
      />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerService}>{item.service}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>
        <Text style={styles.price}>₹{item.price}/hr</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* ✅ Add StatusBar for proper top spacing on Android */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8f9fa" 
        translucent={Platform.OS === 'android'} 
      />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        // ✅ Add top padding: 45px for Android status bar + 10px extra spacing
        contentContainerStyle={styles.scrollContent}
      >
        {/* Location Header */}
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={20} color="#007AFF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationLoading ? 'Detecting...' : address}
            </Text>
            <TouchableOpacity onPress={getCurrentLocation} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="refresh" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Icon name="search" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, providers..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Services Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Services')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={serviceCategories.slice(0, 8)}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            numColumns={4}
            scrollEnabled={false}
            columnWrapperStyle={styles.categoryRow}
          />
        </View>

        {/* Featured Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Providers</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
          ) : (
            <FlatList
              data={featuredProviders}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.providerList}
            />
          )}
        </View>

        {/* Promo Banner */}
        <TouchableOpacity 
          style={styles.banner} 
          onPress={() => Alert.alert('Coming Soon!', 'Special offers will appear here')}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>🎉 First Booking?</Text>
            <Text style={styles.bannerSubtitle}>Get 20% OFF on your first service</Text>
            <Text style={styles.bannerBtn}>Claim Offer →</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  // ✅ NEW: Scroll content with top padding to avoid status bar overlap
  scrollContent: { 
    paddingTop: Platform.OS === 'android' ? 45 : 50, // ✅ Android: 45px for status bar + spacing
    paddingBottom: 20, // Bottom padding too
  },
  header: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500', marginLeft: 8 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    margin: 15, 
    padding: 12, 
    borderRadius: 12, 
    elevation: 2 
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  section: { padding: 15 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  seeAll: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  categoryRow: { justifyContent: 'space-between', marginBottom: 8 },
  categoryCard: { alignItems: 'center', width: '23%', padding: 8 },
  categoryIcon: { 
    width: 55, 
    height: 55, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  categoryName: { fontSize: 11, color: '#444', textAlign: 'center', fontWeight: '500' },
  providerList: { paddingRight: 15 },
  providerCard: { 
    width: 260, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginRight: 12, 
    padding: 12, 
    flexDirection: 'row', 
    elevation: 3 
  },
  providerImage: { width: 70, height: 70, borderRadius: 35 },
  providerInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  providerName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  providerService: { fontSize: 13, color: '#666', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 13, fontWeight: '600', color: '#333', marginLeft: 4 },
  reviews: { fontSize: 12, color: '#999', marginLeft: 4 },
  price: { fontSize: 14, fontWeight: '700', color: '#007AFF', marginTop: 6 },
  banner: { 
    margin: 15, 
    borderRadius: 16, 
    overflow: 'hidden', 
    backgroundColor: '#667eea' 
  },
  bannerContent: { padding: 20 },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  bannerSubtitle: { fontSize: 14, color: '#f0f0f0', marginBottom: 12 },
  bannerBtn: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#667eea', 
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    alignSelf: 'flex-start' 
  },
});

export default HomeScreen;