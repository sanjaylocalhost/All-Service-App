import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Animated,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { serviceCategories } from '../../constants/data';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching location...');
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });
  
  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: 'clamp',
  });

  const searchBarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getCurrentLocation();
    fetchFeaturedProviders();
    fetchAllProviders();
  }, []);

  // Search functionality with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.trim() === '') {
        setIsSearching(false);
        setSearchResults([]);
      } else {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const animateSearchBar = () => {
    Animated.sequence([
      Animated.timing(searchBarScale, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(searchBarScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const performSearch = () => {
    setIsSearching(true);
    const searchTerm = searchText.toLowerCase().trim();
    
    const providerResults = allProviders.filter(provider => 
      provider.name?.toLowerCase().includes(searchTerm) ||
      provider.service?.toLowerCase().includes(searchTerm) ||
      (provider.skills && provider.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
    );
    
    const categoryResults = serviceCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm)
    );
    
    const combinedResults = [
      ...providerResults.map(item => ({ ...item, resultType: 'provider', uniqueId: `provider_${item._id}` })),
      ...categoryResults.map(item => ({ ...item, resultType: 'category', uniqueId: `category_${item.id}` }))
    ];
    
    setSearchResults(combinedResults);
  };

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
        applyFallback();
        return;
      }

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        applyFallback();
        return;
      }

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
            applyFallback();
          }
        },
        (error) => {
          applyFallback();
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000,
        }
      );
    } catch (err) {
      applyFallback();
    }
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
    
    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      
      if (response.data?.results?.[0]?.formatted_address) {
        const fullAddress = response.data.results[0].formatted_address;
        const shortAddress = fullAddress.split(',')[0];
        setAddress(shortAddress);
      }
    } catch (e) {
      console.log('Geocode error:', e.message);
    }
  };

  const fetchFeaturedProviders = async () => {
    try {
      const endpoint = `${API_BASE_URL}/providers/featured`;
      const response = await axios.get(endpoint, { timeout: 10000 });
      const providers = response.data?.providers || response.data || [];
      setFeaturedProviders(providers);
    } catch (error) {
      setFeaturedProviders([
        { _id: '1', name: 'Rajesh Kumar', service: 'Plumber', rating: 4.5, reviews: 120, price: 300, profileImage: 'https://i.pravatar.cc/150?img=1', skills: ['Pipe Repair', 'Leakage Fix'] },
        { _id: '2', name: 'Priya Singh', service: 'Electrician', rating: 4.8, reviews: 85, price: 400, profileImage: 'https://i.pravatar.cc/150?img=5', skills: ['Wiring', 'Installation'] },
        { _id: '3', name: 'Amit Sharma', service: 'AC Repair', rating: 4.3, reviews: 60, price: 500, profileImage: 'https://i.pravatar.cc/150?img=3', skills: ['AC Service', 'Gas Refill'] },
        { _id: '4', name: 'Sneha Patel', service: 'Cleaning', rating: 4.7, reviews: 95, price: 250, profileImage: 'https://i.pravatar.cc/150?img=8', skills: ['Home Cleaning', 'Deep Cleaning'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProviders = async () => {
    try {
      const endpoint = `${API_BASE_URL}/providers`;
      const response = await axios.get(endpoint, { timeout: 10000 });
      const providers = response.data?.providers || response.data || [];
      setAllProviders(providers);
    } catch (error) {
      setAllProviders([
        { _id: '1', name: 'Rajesh Kumar', service: 'Plumber', rating: 4.5, reviews: 120, price: 300, profileImage: 'https://i.pravatar.cc/150?img=1', skills: ['Pipe Repair', 'Leakage Fix'] },
        { _id: '2', name: 'Priya Singh', service: 'Electrician', rating: 4.8, reviews: 85, price: 400, profileImage: 'https://i.pravatar.cc/150?img=5', skills: ['Wiring', 'Installation'] },
        { _id: '3', name: 'Amit Sharma', service: 'AC Repair', rating: 4.3, reviews: 60, price: 500, profileImage: 'https://i.pravatar.cc/150?img=3', skills: ['AC Service', 'Gas Refill'] },
        { _id: '4', name: 'Sneha Patel', service: 'Cleaning', rating: 4.7, reviews: 95, price: 250, profileImage: 'https://i.pravatar.cc/150?img=8', skills: ['Home Cleaning', 'Deep Cleaning'] },
      ]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeaturedProviders(), fetchAllProviders()]);
    setRefreshing(false);
  }, []);

  const renderCategoryItem = ({ item, index }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity 
        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
        onPress={() => {
          setSelectedCategory(isSelected ? null : item.id);
          navigation.navigate('Services', { category: item });
        }}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color + '15' }]}>
          <Icon name={item.icon} size={28} color={item.color} />
        </View>
        <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]} numberOfLines={1}>
          {item.name}
        </Text>
        {isSelected && <View style={styles.selectedIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderProviderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => navigation.navigate('ProviderDetails', { providerId: item._id })}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.profileImage?.trim() || 'https://via.placeholder.com/80' }} 
        style={styles.providerImage} 
      />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.providerService} numberOfLines={1}>{item.service}</Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews} reviews)</Text>
        </View>
        <Text style={styles.price}>₹{item.price}/hr</Text>
      </View>
      <TouchableOpacity style={styles.bookmarkBtn}>
        <Ionicons name="bookmark-outline" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => {
    if (item.resultType === 'provider' || item.service) {
      return (
        <TouchableOpacity 
          style={styles.searchResultItem}
          onPress={() => navigation.navigate('ProviderDetails', { providerId: item._id })}
        >
          <Image source={{ uri: item.profileImage }} style={styles.searchResultImage} />
          <View style={styles.searchResultInfo}>
            <Text style={styles.searchResultTitle}>{item.name}</Text>
            <Text style={styles.searchResultSubtitle}>{item.service}</Text>
            <Text style={styles.searchResultPrice}>₹{item.price}/hr</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity 
          style={styles.searchResultItem}
          onPress={() => navigation.navigate('Services', { category: item })}
        >
          <View style={[styles.searchResultIcon, { backgroundColor: item.color + '20' }]}>
            <Icon name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.searchResultInfo}>
            <Text style={styles.searchResultTitle}>{item.name}</Text>
            <Text style={styles.searchResultSubtitle}>Services available</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
      );
    }
  };

// Trust Building Section Component - Fixed padding and layout
const TrustSection = () => (
  <View style={styles.trustSection}>
    <Text style={styles.trustTitle}>Why Choose Us? 🤝</Text>
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.trustScrollContent}
      decelerationRate="fast"
      snapToAlignment="start"
    >
      <View style={styles.trustCard}>
        <View style={styles.trustIconContainer}>
          <Ionicons name="shield-checkmark" size={32} color="#FF6B6B" />
        </View>
        <Text style={styles.trustCardTitle}>100% Verified</Text>
        <Text style={styles.trustCardDesc}>All providers are background verified</Text>
      </View>
      
      <View style={styles.trustCard}>
        <View style={styles.trustIconContainer}>
          <Ionicons name="cash-outline" size={32} color="#FF6B6B" />
        </View>
        <Text style={styles.trustCardTitle}>Best Price</Text>
        <Text style={styles.trustCardDesc}>Price match guarantee</Text>
      </View>
      
      <View style={styles.trustCard}>
        <View style={styles.trustIconContainer}>
          <Ionicons name="time-outline" size={32} color="#FF6B6B" />
        </View>
        <Text style={styles.trustCardTitle}>24/7 Support</Text>
        <Text style={styles.trustCardDesc}>Round the clock assistance</Text>
      </View>
      
      <View style={styles.trustCard}>
        <View style={styles.trustIconContainer}>
          <Ionicons name="star" size={32} color="#FF6B6B" />
        </View>
        <Text style={styles.trustCardTitle}>5,000+ Reviews</Text>
        <Text style={styles.trustCardDesc}>Happy customers worldwide</Text>
      </View>
      
      <View style={styles.trustCardEnd} />
    </ScrollView>
  </View>
);

// Stats Section - Fixed grid layout
const StatsSection = () => (
  <View style={styles.statsSection}>
    <Text style={styles.statsTitle}>Our Achievements 🏆</Text>
    <View style={styles.statsGrid}>
      <View style={styles.statBox}>
        <Ionicons name="people" size={28} color="#FF6B6B" />
        <Text style={styles.statNumber}>10K+</Text>
        <Text style={styles.statLabel}>Happy Customers</Text>
      </View>
      <View style={styles.statBox}>
        <Ionicons name="briefcase" size={28} color="#FF6B6B" />
        <Text style={styles.statNumber}>500+</Text>
        <Text style={styles.statLabel}>Expert Professionals</Text>
      </View>
      <View style={styles.statBox}>
        <Ionicons name="location" size={28} color="#FF6B6B" />
        <Text style={styles.statNumber}>50+</Text>
        <Text style={styles.statLabel}>Cities Covered</Text>
      </View>
      <View style={styles.statBox}>
        <Ionicons name="happy" size={28} color="#FF6B6B" />
        <Text style={styles.statNumber}>98%</Text>
        <Text style={styles.statLabel}>Satisfaction Rate</Text>
      </View>
    </View>
  </View>
);

  const Header = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ scale: headerScale }] }]}>
      <View style={styles.headerTop}>
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={20} color="#FF6B6B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLoading ? 'Detecting...' : address}
          </Text>
          <TouchableOpacity onPress={getCurrentLocation} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="refresh" size={18} color="#999" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications" size={22} color="#FF6B6B" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Find the best</Text>
        <Text style={styles.welcomeHighlight}>service providers</Text>
        <Text style={styles.welcomeSubtext}>near you</Text>
      </View>
    </Animated.View>
  );

  const SearchBar = () => (
    <Animated.View style={[styles.searchWrapper, { transform: [{ scale: searchBarScale }] }]}>
      <TouchableOpacity 
        style={styles.searchContainer}
        activeOpacity={0.9}
        onPress={() => {}}
      >
        <Ionicons name="search-outline" size={22} color="#FF6B6B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services, providers..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={animateSearchBar}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      <Animated.ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />
        }
      >
        <Header />
        <SearchBar />
 
        
        {isSearching && searchResults.length > 0 ? (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchResultsTitle}>
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.uniqueId || `${item.resultType}_${item._id || item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.searchResultsList}
            />
          </View>
        ) : isSearching ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>Try different keywords</Text>
          </View>
        ) : (
          <>
            {/* Categories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Services</Text>
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

       
        {/* Trust Building Section */}
        <TrustSection />
        
        {/* Stats Section */}
        <StatsSection />


            {/* Featured Providers */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Rated Providers</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Providers')}>
                  <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 30 }} />
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.providersHorizontalList}
                >
                  {featuredProviders.map((item) => (
                    <View key={item._id} style={styles.providerHorizontalItem}>
                      <TouchableOpacity 
                        style={styles.providerHorizontalCard}
                        onPress={() => navigation.navigate('ProviderDetails', { providerId: item._id })}
                        activeOpacity={0.9}
                      >
                        <Image 
                          source={{ uri: item.profileImage?.trim() || 'https://via.placeholder.com/80' }} 
                          style={styles.providerHorizontalImage} 
                        />
                        <View style={styles.providerHorizontalInfo}>
                          <Text style={styles.providerName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.providerService} numberOfLines={1}>{item.service}</Text>
                          <View style={styles.ratingRow}>
                            <Icon name="star" size={14} color="#FFD700" />
                            <Text style={styles.rating}>{item.rating}</Text>
                            <Text style={styles.reviews}>({item.reviews})</Text>
                          </View>
                          <Text style={styles.price}>₹{item.price}/hr</Text>
                        </View>
                        <TouchableOpacity style={styles.bookmarkBtnHorizontal}>
                          <Ionicons name="bookmark-outline" size={20} color="#666" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Promo Banner - Without LinearGradient */}
            <TouchableOpacity 
              style={styles.promoContainer}
              onPress={() => Alert.alert('Coming Soon!', 'Special offers will appear here')}
              activeOpacity={0.95}
            >
              <View style={styles.promoBanner}>
                <View style={styles.promoContent}>
                  <Text style={styles.promoTitle}>🎉 Special Offer</Text>
                  <Text style={styles.promoSubtitle}>Get 20% OFF on your first booking</Text>
                  <View style={styles.promoButton}>
                    <Text style={styles.promoButtonText}>Claim Now</Text>
                    <Icon name="arrow-forward" size={16} color="#FF6B6B" />
                  </View>
                </View>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                  style={styles.promoImage}
                />
              </View>
            </TouchableOpacity>
          </>
        )}
      </Animated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeSection: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    lineHeight: 34,
  },
  welcomeHighlight: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF6B6B',
    lineHeight: 38,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
  },
  // Trust Building Section - Fixed
  trustSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  trustTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  trustScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 32,
  },
  trustCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 150,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trustCardEnd: {
    width: 4,
  },
  trustIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    paddingBottom: 4,
  },
  trustCardDesc: {
    marginBottom: 24,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 14,
  },
  // Stats Section - Fixed
  statsSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B6B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  seeAll: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryCard: {
    alignItems: 'center',
    width: '23%',
    padding: 10,
    borderRadius: 16,
    position: 'relative',
  },
  categoryCardSelected: {
    backgroundColor: '#FFF5F5',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF6B6B',
  },
  providersHorizontalList: {
    paddingRight: 20,
  },
  providerHorizontalItem: {
    width: 280,
    marginRight: 15,
  },
  providerHorizontalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  providerHorizontalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  providerHorizontalInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  providerService: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  bookmarkBtnHorizontal: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 5,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
    position: 'relative',
  },
  providerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 5,
  },
  promoContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  promoBanner: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
    marginRight: 6,
  },
  promoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  searchResultsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  searchResultsList: {
    paddingBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchResultIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  searchResultPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 2,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
export default HomeScreen;