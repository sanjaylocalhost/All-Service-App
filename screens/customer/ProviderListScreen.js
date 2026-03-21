import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const ProviderListScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    sortBy: 'recommended',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, filters, providers]);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/providers?service=${category.name}`
      );
      setProviders(response.data.providers);
      setFilteredProviders(response.data.providers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...providers];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchText.toLowerCase()) ||
        provider.service.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Price filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(
        provider => provider.price >= min && provider.price <= max
      );
    }

    // Rating filter
    if (filters.rating !== 'all') {
      filtered = filtered.filter(
        provider => provider.rating >= parseInt(filters.rating)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // recommended - keep as is
        break;
    }

    setFilteredProviders(filtered);
  };

  const renderProviderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.providerCard}
      onPress={() => navigation.navigate('ProviderDetails', { providerId: item._id })}
    >
      <Image 
        source={{ uri: item.profileImage || 'https://via.placeholder.com/100' }} 
        style={styles.providerImage}
      />
      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{item.name}</Text>
        <Text style={styles.providerService}>{item.service}</Text>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.reviews}>({item.reviews} reviews)</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="work" size={14} color="#666" />
            <Text style={styles.detailText}>{item.experience} years</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="location-on" size={14} color="#666" />
            <Text style={styles.detailText}>{item.distance} km</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.priceUnit}>/hour</Text>
        </View>

        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', { provider: item })}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${category.name}...`}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Icon name="filter-list" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <Icon name={category.icon} size={30} color={category.color} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.providerCount}>{filteredProviders.length} providers available</Text>
      </View>

      {/* Provider List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredProviders}
          renderItem={renderProviderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="error-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No providers found</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Providers</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.filterOptions}>
                {['recommended', 'price_low', 'price_high', 'rating'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterOption,
                      filters.sortBy === option && styles.filterOptionActive
                    ]}
                    onPress={() => setFilters({...filters, sortBy: option})}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.sortBy === option && styles.filterOptionTextActive
                    ]}>
                      {option.replace('_', ' ').charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.filterOptions}>
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Under ₹500', value: '0-500' },
                  { label: '₹500 - ₹1000', value: '500-1000' },
                  { label: 'Above ₹1000', value: '1000-10000' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.priceRange === option.value && styles.filterOptionActive
                    ]}
                    onPress={() => setFilters({...filters, priceRange: option.value})}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.priceRange === option.value && styles.filterOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.filterOptions}>
                {[
                  { label: 'All', value: 'all' },
                  { label: '4+ ⭐', value: '4' },
                  { label: '3+ ⭐', value: '3' },
                  { label: '2+ ⭐', value: '2' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.rating === option.value && styles.filterOptionActive
                    ]}
                    onPress={() => setFilters({...filters, rating: option.value})}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.rating === option.value && styles.filterOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  categoryInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  providerCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  providerService: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },
  reviews: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceUnit: {
    fontSize: 12,
    color: '#999',
    marginLeft: 2,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
  },
  filterOptionText: {
    color: '#666',
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProviderListScreen;