import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addressService } from '../../services/addressService';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '',
    addressName: '',
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'home',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        const response = await addressService.getAddresses();
        if (response.success) {
          setAddresses(response.data);
        }
      } else {
        // Mock data for testing
        setAddresses([
          {
            _id: '1',
            addressName: 'Home',
            fullName: 'John Doe',
            phoneNumber: '9876543210',
            streetAddress: '#51, 5th Cross, Venkatapp Layout',
            landmark: 'Near City Park',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            addressType: 'home',
            isDefault: true,
            formattedAddress: '#51, 5th Cross, Venkatapp Layout, Bangalore - 560001',
          },
          {
            _id: '2',
            addressName: 'Office',
            fullName: 'John Doe',
            phoneNumber: '9876543210',
            streetAddress: '123 Tech Park, Whitefield',
            landmark: 'Near Metro Station',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560002',
            addressType: 'work',
            isDefault: false,
            formattedAddress: '123 Tech Park, Whitefield, Bangalore - 560002',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  }, []);

  const handleAddAddress = () => {
    setFormData({
      id: '',
      addressName: '',
      fullName: '',
      phoneNumber: '',
      streetAddress: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      addressType: 'home',
      isDefault: false,
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setFormData({
      id: address._id,
      addressName: address.addressName,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      streetAddress: address.streetAddress,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType,
      isDefault: address.isDefault,
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteAddress = (address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.addressName}" address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (token) {
                await addressService.deleteAddress(address._id);
              } else {
                // Mock delete
                setAddresses(addresses.filter(a => a._id !== address._id));
              }
              await loadAddresses();
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (address) => {
    if (address.isDefault) return;
    
    Alert.alert(
      'Set as Default',
      `Set "${address.addressName}" as your default address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Default',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (token) {
                await addressService.setDefaultAddress(address._id);
              } else {
                // Mock set default
                setAddresses(addresses.map(a => ({
                  ...a,
                  isDefault: a._id === address._id,
                })));
              }
              await loadAddresses();
              Alert.alert('Success', 'Default address updated');
            } catch (error) {
              Alert.alert('Error', 'Failed to set default address');
            }
          },
        },
      ],
    );
  };

  const validateForm = () => {
    if (!formData.addressName) {
      Alert.alert('Error', 'Please enter address name');
      return false;
    }
    if (!formData.fullName) {
      Alert.alert('Error', 'Please enter full name');
      return false;
    }
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter valid 10-digit phone number');
      return false;
    }
    if (!formData.streetAddress) {
      Alert.alert('Error', 'Please enter street address');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!formData.pincode || formData.pincode.length !== 6) {
      Alert.alert('Error', 'Please enter valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const saveAddress = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('userToken');
      const addressData = {
        ...formData,
        coordinates: currentLocation ? [currentLocation.longitude, currentLocation.latitude] : [77.5946, 12.9716],
      };

      if (token) {
        if (isEditing) {
          await addressService.updateAddress(formData.id, addressData);
          Alert.alert('Success', 'Address updated successfully');
        } else {
          await addressService.createAddress(addressData);
          Alert.alert('Success', 'Address added successfully');
        }
      } else {
        // Mock save for testing
        const newAddress = {
          _id: isEditing ? formData.id : Date.now().toString(),
          ...addressData,
          formattedAddress: `${addressData.streetAddress}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`,
        };
        
        if (isEditing) {
          setAddresses(addresses.map(a => a._id === formData.id ? newAddress : a));
        } else {
          setAddresses([...addresses, newAddress]);
        }
        
        if (addressData.isDefault) {
          setAddresses(addresses.map(a => ({ ...a, isDefault: false })));
        }
        
        Alert.alert('Success', isEditing ? 'Address updated' : 'Address added');
      }

      await loadAddresses();
      setModalVisible(false);
    } catch (error) {
      console.error('Save address error:', error);
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'work':
        return 'work';
      default:
        return 'location-on';
    }
  };

  const renderAddressCard = (address) => (
    <View key={address._id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <Icon name={getAddressIcon(address.addressType)} size={20} color="#FF6B6B" />
          <Text style={styles.addressName}>{address.addressName}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>DEFAULT</Text>
            </View>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleEditAddress(address)} style={styles.actionButton}>
            <Icon name="edit" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteAddress(address)} style={styles.actionButton}>
            <Icon name="delete-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.addressFullName}>{address.fullName}</Text>
      <Text style={styles.addressPhone}>📞 {address.phoneNumber}</Text>
      <Text style={styles.addressDetail}>{address.streetAddress}</Text>
      {address.landmark && (
        <Text style={styles.addressDetail}>📍 {address.landmark}</Text>
      )}
      <Text style={styles.addressDetail}>
        {address.city}, {address.state} - {address.pincode}
      </Text>

      {!address.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(address)}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAddressModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Home, Office"
                value={formData.addressName}
                onChangeText={(text) => setFormData({ ...formData, addressName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.typeContainer}>
                {['home', 'work', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.addressType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, addressType: type })}
                  >
                    <Icon
                      name={type === 'home' ? 'home' : type === 'work' ? 'work' : 'location-on'}
                      size={20}
                      color={formData.addressType === type ? '#fff' : '#666'}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        formData.addressType === type && styles.typeTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="House number, street name"
                value={formData.streetAddress}
                onChangeText={(text) => setFormData({ ...formData, streetAddress: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Landmark</Text>
              <TextInput
                style={styles.input}
                placeholder="Nearby landmark"
                value={formData.landmark}
                onChangeText={(text) => setFormData({ ...formData, landmark: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pincode"
                  keyboardType="numeric"
                  value={formData.pincode}
                  onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => setFormData({ ...formData, state: text })}
              />
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
              >
                {formData.isDefault ? (
                  <Ionicons name="checkbox" size={24} color="#FF6B6B" />
                ) : (
                  <Ionicons name="square-outline" size={24} color="#999" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveAddress}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update' : 'Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={handleAddAddress} style={styles.addButton}>
          <Icon name="add" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="location-off" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Addresses Found</Text>
            <Text style={styles.emptyText}>
              Add your first address to get started
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddAddress}>
              <Text style={styles.emptyButtonText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {addresses.map(renderAddressCard)}
            <TouchableOpacity style={styles.addNewCard} onPress={handleAddAddress}>
              <Icon name="add-location" size={24} color="#FF6B6B" />
              <Text style={styles.addNewText}>Add New Address</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {renderAddressModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  addressFullName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  addressDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  addNewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFE0E0',
    borderStyle: 'dashed',
  },
  addNewText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  row: {
    flexDirection: 'row',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  typeButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
  },
  typeTextActive: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default AddressesScreen;