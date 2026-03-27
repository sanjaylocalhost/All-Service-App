import axios from "axios";
import * as Location from "expo-location"; // Added this missing import
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_BASE_URL } from "../../constants/config";
import { serviceCategories } from "../../constants/data";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Fetching location...");
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notificationCount] = useState(3);

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

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      // 1. Ask permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setAddress("Permission denied");
        setLocation({ latitude: 12.9716, longitude: 77.5946 }); // fallback Bangalore
        return;
      }

      // 2. Get current position
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });

      // 3. Reverse geocode to get address string
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        // Formatting: "Street/Name, City"
        const formattedAddress = `${place.name || place.street || ""}, ${
          place.city || place.district || ""
        }`;
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Location error:", error);
      setAddress("Bangalore, Karnataka");
      setLocation({ latitude: 12.9716, longitude: 77.5946 });
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchFeaturedProviders = async () => {
    try {
      const endpoint = `${API_BASE_URL}/providers/featured`;
      const response = await axios.get(endpoint, { timeout: 10000 });
      setFeaturedProviders(response.data?.providers || response.data || []);
    } catch (error) {
      // Fallback Static Data
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProviders = async () => {
    try {
      const endpoint = `${API_BASE_URL}/providers`;
      const response = await axios.get(endpoint, { timeout: 10000 });
      setAllProviders(response.data?.providers || response.data || []);
    } catch (error) {
      setAllProviders([]);
    }
  };

  useEffect(() => {
    getCurrentLocation();
    fetchFeaturedProviders();
    fetchAllProviders();
  }, []);

  // Search Debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.trim() === "") {
        setIsSearching(false);
        setSearchResults([]);
      } else {
        performSearch();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const performSearch = () => {
    setIsSearching(true);
    const searchTerm = searchText.toLowerCase().trim();

    const providerResults = allProviders.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.service?.toLowerCase().includes(searchTerm),
    );

    const categoryResults = serviceCategories.filter((c) =>
      c.name.toLowerCase().includes(searchTerm),
    );

    setSearchResults([
      ...providerResults.map((p) => ({
        ...p,
        resultType: "provider",
        uniqueId: `p_${p._id}`,
      })),
      ...categoryResults.map((c) => ({
        ...c,
        resultType: "category",
        uniqueId: `c_${c.id}`,
      })),
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      getCurrentLocation(),
      fetchFeaturedProviders(),
      fetchAllProviders(),
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

  // Sub-components
  const Header = () => (
    <Animated.View
      style={[
        styles.header,
        { opacity: headerOpacity, transform: [{ scale: headerScale }] },
      ]}
    >
      <View style={styles.headerTop}>
        <View style={styles.locationContainer}>
          <Icon name="location-on" size={20} color="#FF6B6B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLoading ? "Detecting..." : address}
          </Text>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Icon name="refresh" size={18} color="#999" />
          </TouchableOpacity>
        </View>
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
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
          />
        }
      >
        <Header />

        {/* Search Bar */}
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
              placeholder="Search services..."
              value={searchText}
              onChangeText={setSearchText}
              onFocus={animateSearchBar}
            />
          </View>
        </Animated.View>

        {isSearching ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Results</Text>
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <TouchableOpacity
                  key={item.uniqueId}
                  style={styles.searchResultItem}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No results found</Text>
            )}
          </View>
        ) : (
          <>
            {/* Popular Services */}
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

            {/* Featured Providers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Rated Providers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {featuredProviders.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.providerHorizontalCard}
                  >
                    <Image
                      source={{ uri: item.profileImage }}
                      style={styles.providerHorizontalImage}
                    />
                    <View style={styles.providerHorizontalInfo}>
                      <Text style={styles.providerName}>{item.name}</Text>
                      <Text style={styles.providerService}>{item.service}</Text>
                      <Text style={styles.price}>₹{item.price}/hr</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "android" ? 50 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 8,
    borderRadius: 12,
  },
  locationText: { flex: 1, fontSize: 13, color: "#666", marginLeft: 8 },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  notificationCount: { color: "white", fontSize: 10, fontWeight: "bold" },
  welcomeSection: { marginBottom: 10 },
  welcomeText: { fontSize: 24, color: "#333" },
  welcomeHighlight: { fontSize: 28, fontWeight: "800", color: "#FF6B6B" },
  searchWrapper: { paddingHorizontal: 20, marginTop: -20, marginBottom: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 50,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  searchInput: { flex: 1, marginLeft: 10 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 15 },
  categoryRow: { justifyContent: "space-between" },
  categoryCard: { width: "23%", alignItems: "center", marginBottom: 15 },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryName: { fontSize: 11, color: "#666" },
  providerHorizontalCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    marginRight: 15,
    flexDirection: "row",
    elevation: 2,
    width: 250,
  },
  providerHorizontalImage: { width: 60, height: 60, borderRadius: 30 },
  providerHorizontalInfo: { marginLeft: 10, justifyContent: "center" },
  providerName: { fontWeight: "bold", fontSize: 14 },
  providerService: { color: "#999", fontSize: 12 },
  price: { color: "#FF6B6B", fontWeight: "bold", marginTop: 2 },
  searchResultItem: {
    padding: 15,
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 10,
  },
});

export default HomeScreen;
