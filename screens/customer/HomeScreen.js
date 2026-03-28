import axios from "axios";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_BASE_URL } from "../../constants/config";
import { serviceCategories } from "../../constants/data";
import { addressService } from '../../services/addressService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressesScreen from '../customer/AddressesScreen';

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Select Location");
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [notificationCount] = useState(3);
  
  // Address states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  // Modal States
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarScale = useRef(new Animated.Value(1)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: "clamp",
  });

  const loadSavedAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found, using mock data');
        setSavedAddresses([
          {
            id: "1",
            name: "Home",
            street: "#51, 5th Cross, Venkatapp Layout",
            city: "Bangalore",
            state: "Karnataka",
            pincode: "560001",
            type: "home",
            isDefault: true,
            fullAddress: "#51, 5th Cross, Venkatapp Layout, Bangalore - 560001"
          }
        ]);
        setAddress("#51, 5th Cross, Venkatapp Layout, Bangalore - 560001");
        return;
      }
      
      const response = await addressService.getAddresses();
      
      if (response && response.success) {
        const addresses = response.data.map(addr => ({
          id: addr._id,
          name: addr.addressName,
          street: addr.streetAddress,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          landmark: addr.landmark,
          type: addr.addressType,
          isDefault: addr.isDefault,
          fullName: addr.fullName,
          phoneNumber: addr.phoneNumber,
          fullAddress: addr.formattedAddress || `${addr.streetAddress}, ${addr.city}, ${addr.state} - ${addr.pincode}`
        }));
        
        setSavedAddresses(addresses);
        
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setAddress(defaultAddress.fullAddress);
          setSelectedAddressId(defaultAddress.id);
        } else if (addresses.length > 0) {
          setAddress(addresses[0].fullAddress);
          setSelectedAddressId(addresses[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setSavedAddresses([
        {
          id: "1",
          name: "Home",
          street: "#51, 5th Cross, Venkatapp Layout",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          type: "home",
          isDefault: true,
          fullAddress: "#51, 5th Cross, Venkatapp Layout, Bangalore - 560001"
        }
      ]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProviders();
    loadSavedAddresses();
    
    // Only show location modal once on initial load
    if (!hasInitialized && savedAddresses.length === 0) {
      setTimeout(() => {
        setIsLocationModalVisible(true);
        setHasInitialized(true);
      }, 500);
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services to get accurate results.",
          [{ text: "OK" }]
        );
        setLocationLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to find providers near you.",
          [{ text: "OK" }]
        );
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const addressParts = [];
        
        if (place.name) addressParts.push(place.name);
        if (place.street) addressParts.push(place.street);
        if (place.district) addressParts.push(place.district);
        if (place.city) addressParts.push(place.city);
        
        const formattedAddress = addressParts.join(", ");
        setAddress(formattedAddress || "Current Location");
        setIsLocationModalVisible(false);
      } else {
        setAddress("Current Location");
        setIsLocationModalVisible(false);
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Could not fetch location. Please select a saved address.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSelectSavedAddress = (item) => {
    setAddress(item.fullAddress);
    setSelectedAddressId(item.id);
    setIsLocationModalVisible(false);
  };

  const navigateToAddressScreen = () => {
    navigation.navigate("Addresses");
  };

  const deleteAddress = (addressId) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (token) {
                await addressService.deleteAddress(addressId);
                await loadSavedAddresses();
              } else {
                setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
                if (selectedAddressId === addressId) {
                  const remaining = savedAddresses.filter(addr => addr.id !== addressId);
                  if (remaining.length > 0) {
                    setAddress(remaining[0].fullAddress);
                    setSelectedAddressId(remaining[0].id);
                  } else {
                    setAddress("Select Location");
                    setSelectedAddressId(null);
                  }
                }
              }
              Alert.alert("Success", "Address deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to delete address");
            }
          }
        }
      ]
    );
  };

  const fetchFeaturedProviders = async () => {
    try {
      const endpoint = `${API_BASE_URL}/providers/featured`;
      const response = await axios.get(endpoint, { timeout: 10000 });
      setFeaturedProviders(response.data?.providers || response.data || []);
    } catch (error) {
      setFeaturedProviders([
        {
          _id: "1",
          name: "Rajesh Kumar",
          service: "Plumber",
          rating: 4.5,
          reviews: 120,
          price: 300,
          profileImage: "https://i.pravatar.cc/150?img=1",
        },
        {
          _id: "2",
          name: "Priya Singh",
          service: "Electrician",
          rating: 4.8,
          reviews: 85,
          price: 400,
          profileImage: "https://i.pravatar.cc/150?img=5",
        },
        {
          _id: "3",
          name: "Amit Sharma",
          service: "Carpenter",
          rating: 4.6,
          reviews: 95,
          price: 350,
          profileImage: "https://i.pravatar.cc/150?img=3",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.trim() === "") {
        setIsSearching(false);
        setSearchResults([]);
      } else {
        performSearch();
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const performSearch = () => {
    setIsSearching(true);
    const searchTerm = searchText.toLowerCase().trim();

    const providerResults = allProviders.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.service?.toLowerCase().includes(searchTerm)
    );

    const categoryResults = serviceCategories.filter((c) =>
      c.name.toLowerCase().includes(searchTerm)
    );

    const results = [
      ...providerResults.map((p) => ({
        ...p,
        resultType: "provider",
        uniqueId: `p_${p._id}`,
        displayName: p.name,
        subtitle: p.service,
      })),
      ...categoryResults.map((c) => ({
        ...c,
        resultType: "category",
        uniqueId: `c_${c.id}`,
        displayName: c.name,
        subtitle: `${c.providerCount || 0} providers available`,
      })),
    ];

    setSearchResults(results);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      getCurrentLocation(),
      fetchFeaturedProviders(),
      loadSavedAddresses(),
    ]);
    setRefreshing(false);
  }, []);

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

  const clearSearch = () => {
    setSearchText("");
    setIsSearching(false);
    setSearchResults([]);
  };

  // Location Selection Modal
  const LocationSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLocationModalVisible}
      onRequestClose={() => setIsLocationModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setIsLocationModalVisible(false)}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Location</Text>
            <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.currentLocButton} 
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            <View style={styles.iconCircle}>
              {locationLoading ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Icon name="my-location" size={24} color="#FF6B6B" />
              )}
            </View>
            <View style={styles.currentLocTextContainer}>
              <Text style={styles.currentLocTitle}>Use Current Location</Text>
              <Text style={styles.currentLocSubtitle}>Using GPS</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.savedHeader}>
            <Text style={styles.savedTitle}>SAVED ADDRESSES</Text>
          </View>

          <FlatList
            data={savedAddresses}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.savedItem}
                onPress={() => handleSelectSavedAddress(item)}
              >
                <View style={styles.savedIconContainer}>
                  <Icon 
                    name={item.type === "home" ? "home" : item.type === "work" ? "work" : "location-on"} 
                    size={22} 
                    color={selectedAddressId === item.id ? "#FF6B6B" : "#777"} 
                  />
                </View>
                <View style={styles.savedInfo}>
                  <View style={styles.savedTopRow}>
                    <Text style={styles.savedLabel}>{item.name}</Text>
                    {item.isDefault && (
                      <View style={styles.selectedTag}>
                        <Text style={styles.selectedTagText}>DEFAULT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.savedAddress} numberOfLines={2}>{item.street}</Text>
                  <Text style={styles.savedAddress}>{item.city}, {item.state} - {item.pincode}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                  <Icon name="delete-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          ListFooterComponent={
  <TouchableOpacity style={styles.addNewBtn} onPress={navigateToAddressScreen}>
    <Icon name="add" size={20} color="#FF6B6B" />
    <Text style={styles.addNewText}>Manage Addresses</Text>
  </TouchableOpacity>
}
          />
        </View>
      </View>
    </Modal>
  );

  const Header = () => (
    <Animated.View
      style={[
        styles.header,
        { opacity: headerOpacity, transform: [{ scale: headerScale }] },
      ]}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.locationContainer} 
          onPress={() => setIsLocationModalVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="location-on" size={20} color="#FF6B6B" />
          <View style={styles.locationTextWrapper}>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {address}
            </Text>
          </View>
          <Icon name="keyboard-arrow-down" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications" size={22} color="#FF6B6B" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Find the best</Text>
        <Text style={styles.welcomeHighlight}>service providers</Text>
      </View>
    </Animated.View>
  );

  const SearchResults = () => (
    <View style={styles.searchResultsContainer}>
      {searchResults.length > 0 ? (
        <>
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsTitle}>
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {searchResults.map((item) => (
            <TouchableOpacity
              key={item.uniqueId}
              style={styles.searchResultItem}
              onPress={() => {
                if (item.resultType === "provider") {
                  navigation.navigate("ProviderDetails", { provider: item });
                } else {
                  navigation.navigate("Services", { category: item });
                }
                clearSearch();
              }}
            >
              <View style={styles.searchResultIcon}>
                {item.resultType === "provider" ? (
                  <Image 
                    source={{ uri: item.profileImage }} 
                    style={styles.searchResultImage}
                  />
                ) : (
                  <View style={[styles.categoryIconSmall, { backgroundColor: item.color + "15" }]}>
                    <Icon name={item.icon} size={24} color={item.color} />
                  </View>
                )}
              </View>
              <View style={styles.searchResultContent}>
                <Text style={styles.searchResultName}>{item.displayName}</Text>
                <Text style={styles.searchResultSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <View style={styles.noResultsContainer}>
          <Icon name="search-off" size={50} color="#ccc" />
          <Text style={styles.noResultsText}>No results found for "{searchText}"</Text>
          <Text style={styles.noResultsSubtext}>Try searching for different keywords</Text>
        </View>
      )}
    </View>
  );

  const FeaturedProviders = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Rated Providers</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.providersScrollContainer}
      >
        {featuredProviders.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.providerHorizontalCard}
            onPress={() => navigation.navigate("ProviderDetails", { provider: item })}
          >
            <Image
              source={{ uri: item.profileImage }}
              style={styles.providerHorizontalImage}
            />
            <View style={styles.providerHorizontalInfo}>
              <Text style={styles.providerName}>{item.name}</Text>
              <Text style={styles.providerService}>{item.service}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewsText}>({item.reviews})</Text>
              </View>
              <Text style={styles.price}>₹{item.price}/hr</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
            colors={["#FF6B6B"]}
          />
        }
      >
        <Header />

        <Animated.View
          style={[
            styles.searchWrapper,
            { transform: [{ scale: searchBarScale }] },
          ]}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={22} color="#FF6B6B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services or providers..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              onFocus={animateSearchBar}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {isSearching ? (
          <SearchResults />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Services</Text>
              <FlatList
                data={serviceCategories.slice(0, 8)}
                keyExtractor={(item) => item.id.toString()}
                numColumns={4}
                scrollEnabled={false}
                columnWrapperStyle={styles.categoryRow}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryCard}
                    onPress={() =>
                      navigation.navigate("Services", { category: item })
                    }
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: item.color + "15" },
                      ]}
                    >
                      <Icon name={item.icon} size={28} color={item.color} />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <FeaturedProviders />
          </>
        )}
      </Animated.ScrollView>
      
      <LocationSelectionModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationTextWrapper: {
    marginLeft: 8,
    marginRight: 5,
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: "#777",
    fontWeight: "500",
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  notificationBtn: {
    padding: 5,
    marginLeft: 10,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  notificationCount: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  welcomeSection: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "400",
  },
  welcomeHighlight: {
    fontSize: 24,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  searchResultsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    paddingBottom: 20,
  },
  searchResultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  clearSearchText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  searchResultIcon: {
    marginRight: 15,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  categoryIconSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: "#555",
    marginTop: 15,
    fontWeight: "600",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  categoryRow: {
    justifyContent: "space-between",
  },
  categoryCard: {
    alignItems: "center",
    marginBottom: 15,
    width: width / 4 - 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  providersScrollContainer: {
    paddingRight: 20,
  },
  providerHorizontalCard: {
    width: 160,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginRight: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  providerHorizontalImage: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  providerHorizontalInfo: {
    marginLeft: 5,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  providerService: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: "#999",
    marginLeft: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginTop: 5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  currentLocButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  currentLocTextContainer: {
    flex: 1,
  },
  currentLocTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  currentLocSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  savedHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#777",
    letterSpacing: 1,
  },
  savedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  savedIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  savedInfo: {
    flex: 1,
  },
  savedTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  savedLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  selectedTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedTagText: {
    fontSize: 10,
    color: "#2E7D32",
    fontWeight: "bold",
  },
  savedAddress: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  addNewText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
});

export default HomeScreen;