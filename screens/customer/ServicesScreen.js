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
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { serviceCategories } from '../../constants/data';

const ServicesScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [providers, setProviders] = useState([]);

  // Sample data for subcategories based on main category
  const subCategoriesData = {
    'Electrician': [
      { id: 'e1', name: 'Wiring & Installation', icon: 'bolt', count: 15 },
      { id: 'e2', name: 'Repair & Maintenance', icon: 'build', count: 23 },
      { id: 'e3', name: 'Emergency Service', icon: 'warning', count: 8 },
      { id: 'e4', name: 'Appliance Repair', icon: 'electrical-services', count: 12 },
    ],
    'Plumber': [
      { id: 'p1', name: 'Pipe Repair', icon: 'plumbing', count: 18 },
      { id: 'p2', name: 'Leakage Fix', icon: 'water-damage', count: 22 },
      { id: 'p3', name: 'Installation', icon: 'install', count: 14 },
      { id: 'p4', name: 'Drain Cleaning', icon: 'clean-hands', count: 10 },
    ],
    'AC Repair': [
      { id: 'ac1', name: 'AC Service', icon: 'ac-unit', count: 16 },
      { id: 'ac2', name: 'Gas Refill', icon: 'propane', count: 12 },
      { id: 'ac3', name: 'Installation', icon: 'install', count: 9 },
      { id: 'ac4', name: 'Repair', icon: 'build', count: 20 },
    ],
    'House Cleaning': [
      { id: 'h1', name: 'Deep Cleaning', icon: 'cleaning-services', count: 25 },
      { id: 'h2', name: 'Regular Cleaning', icon: 'cleaning', count: 30 },
      { id: 'h3', name: 'Kitchen Cleaning', icon: 'kitchen', count: 18 },
      { id: 'h4', name: 'Bathroom Cleaning', icon: 'bathroom', count: 15 },
    ],
    'Tutor': [
      { id: 't1', name: 'Mathematics', icon: 'calculate', count: 12 },
      { id: 't2', name: 'Science', icon: 'science', count: 10 },
      { id: 't3', name: 'English', icon: 'language', count: 14 },
      { id: 't4', name: 'Computer', icon: 'computer', count: 8 },
    ],
    'Delivery Helper': [
      { id: 'd1', name: 'Parcel Delivery', icon: 'delivery-dining', count: 20 },
      { id: 'd2', name: 'Food Delivery', icon: 'fastfood', count: 25 },
      { id: 'd3', name: 'Grocery', icon: 'shopping-cart', count: 18 },
      { id: 'd4', name: 'Document Pickup', icon: 'description', count: 12 },
    ],
  };

  // Sample providers data
  const sampleProviders = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      service: 'Electrician',
      subService: 'Wiring & Installation',
      experience: '5 years',
      rating: 4.8,
      reviews: 127,
      price: '₹499/hr',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      available: true,
      distance: '1.2 km',
      verified: true,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      service: 'Electrician',
      subService: 'Repair & Maintenance',
      experience: '3 years',
      rating: 4.6,
      reviews: 89,
      price: '₹399/hr',
      image: 'https://randomuser.me/api/portraits/women/1.jpg',
      available: true,
      distance: '2.5 km',
      verified: true,
    },
    {
      id: '3',
      name: 'Suresh Patel',
      service: 'Electrician',
      subService: 'Emergency Service',
      experience: '8 years',
      rating: 4.9,
      reviews: 256,
      price: '₹599/hr',
      image: 'https://randomuser.me/api/portraits/men/2.jpg',
      available: true,
      distance: '0.8 km',
      verified: true,
    },
    {
      id: '4',
      name: 'Amit Verma',
      service: 'Electrician',
      subService: 'Appliance Repair',
      experience: '4 years',
      rating: 4.5,
      reviews: 67,
      price: '₹449/hr',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      available: false,
      distance: '3.1 km',
      verified: false,
    },
  ];

  useEffect(() => {
    // Check if a category was passed from home screen
    if (route.params?.category) {
      handleCategorySelect(route.params.category);
    }
  }, [route.params?.category]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowSubCategories(true);
    // Load providers for this category
    setProviders(sampleProviders.filter(p => p.service === category.name));
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowSubCategories(false);
    setSearchText('');
  };

  const handleSubCategorySelect = (subCategory) => {
    // Navigate to provider list with selected category and subcategory
    navigation.navigate('ProviderList', { 
      category: selectedCategory,
      subCategory: subCategory,
    });
  };

  const handleViewAllProviders = () => {
    navigation.navigate('ProviderList', { 
      category: selectedCategory,
    });
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('ProviderDetails', { providerId: provider.id });
  };

  const handleBookNow = (provider) => {
    navigation.navigate('Booking', { provider: provider });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleCategorySelect(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.serviceIcon, { backgroundColor: item.color + '15' }]}>
        <Icon name={item.icon} size={32} color={item.color} />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDesc}>
          {item.description || 'Professional local services at your doorstep'}
        </Text>
        <View style={styles.serviceMeta}>
          <Text style={styles.serviceCount}>
            {item.providers || Math.floor(Math.random() * 50) + 20}+ providers
          </Text>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
          </View>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderSubCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.subCategoryCard}
      onPress={() => handleSubCategorySelect(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.subCategoryIcon, { backgroundColor: selectedCategory?.color + '15' }]}>
        <Icon name={item.icon} size={24} color={selectedCategory?.color} />
      </View>
      <View style={styles.subCategoryInfo}>
        <Text style={styles.subCategoryName}>{item.name}</Text>
        <Text style={styles.subCategoryCount}>{item.count} providers available</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderProviderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => handleProviderPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.providerImage} />
      <View style={styles.providerInfo}>
        <View style={styles.providerHeader}>
          <Text style={styles.providerName}>{item.name}</Text>
          {item.verified && (
            <Icon name="verified" size={16} color="#007AFF" />
          )}
        </View>
        
        <Text style={styles.providerService}>{item.subService}</Text>
        
        <View style={styles.providerDetails}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingValue}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>
          
          <View style={styles.experienceContainer}>
            <Icon name="work" size={14} color="#666" />
            <Text style={styles.experienceText}>{item.experience}</Text>
          </View>
        </View>

        <View style={styles.providerFooter}>
          <View style={styles.distanceContainer}>
            <Icon name="location-on" size={14} color="#666" />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.bookButton, !item.available && styles.bookButtonDisabled]}
          onPress={() => handleBookNow(item)}
          disabled={!item.available}
        >
          <Text style={styles.bookButtonText}>
            {item.available ? 'Book Now' : 'Currently Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredCategories = searchText
    ? serviceCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : serviceCategories;

  const filteredProviders = searchText
    ? providers.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.subService.toLowerCase().includes(searchText.toLowerCase())
      )
    : providers;

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#f8f9fa" 
        translucent={Platform.OS === 'android'} 
      />
      
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          {showSubCategories ? (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToCategories}
            >
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {showSubCategories ? selectedCategory?.name : 'Services'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {showSubCategories 
                ? 'Choose a specific service type'
                : 'Find the perfect service for your needs'
              }
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Icon name="search" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={showSubCategories ? "Search in this category..." : "Search services..."}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Content based on selection */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!showSubCategories ? (
            // Show all service categories
            <View style={styles.categoriesContainer}>
              <FlatList
                data={filteredCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id?.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.list}
              />
            </View>
          ) : (
            // Show subcategories and providers
            <View>
              {/* Subcategories Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Types</Text>
                <FlatList
                  data={subCategoriesData[selectedCategory?.name] || []}
                  renderItem={renderSubCategoryItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.subCategoryList}
                />
              </View>

              {/* Featured Providers Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Featured Providers</Text>
                  <TouchableOpacity onPress={handleViewAllProviders}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>

                {filteredProviders.length > 0 ? (
                  <FlatList
                    data={filteredProviders.slice(0, 3)}
                    renderItem={renderProviderItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.providersList}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Icon name="error-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyStateText}>No providers found</Text>
                    <Text style={styles.emptyStateSubText}>Try adjusting your search</Text>
                  </View>
                )}
              </View>

              {/* Quick Stats Section */}
              <View style={styles.statsSection}>
                <View style={styles.statCard}>
                  <Icon name="people" size={24} color="#007AFF" />
                  <Text style={styles.statNumber}>50+</Text>
                  <Text style={styles.statLabel}>Active Providers</Text>
                </View>
                <View style={styles.statCard}>
                  <Icon name="verified" size={24} color="#007AFF" />
                  <Text style={styles.statNumber}>100%</Text>
                  <Text style={styles.statLabel}>Verified</Text>
                </View>
                <View style={styles.statCard}>
                  <Icon name="support-agent" size={24} color="#007AFF" />
                  <Text style={styles.statNumber}>24/7</Text>
                  <Text style={styles.statLabel}>Support</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    padding: 20, 
    paddingBottom: 15,
    paddingTop: Platform.OS === 'android' ? 45 : 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#1a1a1a' 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4 
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    margin: 15, 
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    borderRadius: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
  list: { 
    paddingBottom: 10,
  },
  serviceCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceIcon: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  serviceInfo: { 
    flex: 1, 
    marginLeft: 16 
  },
  serviceName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1a1a1a',
    marginBottom: 4,
  },
  serviceDesc: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 6,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceCount: { 
    fontSize: 12, 
    color: '#007AFF', 
    fontWeight: '500' 
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  subCategoryList: {
    paddingBottom: 5,
  },
  subCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
  },
  subCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCategoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subCategoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  subCategoryCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  providersList: {
    paddingBottom: 10,
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  providerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  providerService: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  providerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  providerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  priceContainer: {
    backgroundColor: '#e8f2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flex: 0.3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 10,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
});

export default ServicesScreen; 