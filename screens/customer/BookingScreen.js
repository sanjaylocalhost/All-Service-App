import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const BookingScreen = ({ route, navigation }) => {
  const { provider } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [duration, setDuration] = useState('1');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [description, setDescription] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [pricing, setPricing] = useState({
    basePrice: 0,
    totalAmount: 0,
    tax: 0,
    discount: 0,
    finalAmount: 0,
  });

  useEffect(() => {
    calculatePricing();
    loadSavedAddresses();
  }, [duration, selectedDate, selectedTime]);

  const calculatePricing = () => {
    const pricePerHour = parseInt(provider.price?.replace(/\D/g, '') || 399);
    const hours = parseInt(duration) || 1;
    const baseAmount = pricePerHour * hours;
    const tax = baseAmount * 0.18; // 18% GST
    const totalAmount = baseAmount + tax;
    const discount = 0; // Add discount logic if needed
    const finalAmount = totalAmount - discount;

    setPricing({
      basePrice: pricePerHour,
      totalAmount: baseAmount,
      tax: tax,
      discount: discount,
      finalAmount: finalAmount,
    });
  };

  const loadSavedAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSavedAddresses(response.data.addresses);
      }
    } catch (error) {
      console.log('Error loading addresses:', error);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const validateForm = () => {
    if (!address.street || !address.city || !address.pincode) {
      Alert.alert('Error', 'Please fill complete address');
      return false;
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);

      const bookingData = {
        providerId: provider.id,
        service: {
          name: provider.service,
          category: provider.service,
          subCategory: provider.subService,
        },
        bookingDetails: {
          date: selectedDate,
          time: formatTime(selectedTime),
          address: {
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
          duration: parseInt(duration),
          description: description,
        },
        pricing: {
          basePrice: pricing.basePrice,
          totalAmount: pricing.totalAmount,
          tax: pricing.tax,
          discount: pricing.discount,
          finalAmount: pricing.finalAmount,
        },
        specialRequests: specialRequests,
      };

      const response = await axios.post(
        `${API_BASE_URL}/bookings/create`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Alert.alert(
          'Booking Confirmed!',
          `Your booking has been created successfully.\nBooking ID: ${response.data.booking._id}`,
          [
            {
              text: 'View Bookings',
              onPress: () => navigation.navigate('MyBookings'),
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'Failed to create booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const AddressModal = () => (
    <Modal
      visible={showAddressModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddressModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {savedAddresses.map((addr, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.addressOption,
                  selectedAddress === addr && styles.addressOptionSelected,
                ]}
                onPress={() => {
                  setAddress({
                    street: addr.street,
                    city: addr.city,
                    state: addr.state,
                    pincode: addr.pincode,
                  });
                  setSelectedAddress(addr);
                  setShowAddressModal(false);
                }}
              >
                <Icon name="location-on" size={20} color="#FF6B6B" />
                <View style={styles.addressOptionText}>
                  <Text style={styles.addressStreet}>{addr.street}</Text>
                  <Text style={styles.addressCity}>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.addNewAddressButton}
            onPress={() => {
              setShowAddressModal(false);
              navigation.navigate('AddAddress');
            }}
          >
            <Text style={styles.addNewAddressText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Provider Info */}
        <View style={styles.providerCard}>
          <Image source={{ uri: provider.image }} style={styles.providerImage} />
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerService}>{provider.subService}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{provider.rating}</Text>
              <Text style={styles.reviewText}>({provider.reviews} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Date & Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Service</Text>
          
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="event" size={22} color="#FF6B6B" />
            <Text style={styles.dateTimeText}>
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="access-time" size={22} color="#FF6B6B" />
            <Text style={styles.dateTimeText}>
              {formatTime(selectedTime)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationContainer}>
            {['1', '2', '3', '4', '5'].map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.durationButton,
                  duration === hour && styles.durationButtonActive,
                ]}
                onPress={() => setDuration(hour)}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === hour && styles.durationTextActive,
                  ]}
                >
                  {hour} {hour === '1' ? 'Hour' : 'Hours'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <Icon name="location-on" size={20} color="#FF6B6B" />
            <View style={styles.addressDetails}>
              <TextInput
                style={styles.addressInput}
                placeholder="Street Address"
                value={address.street}
                onChangeText={(text) => setAddress({ ...address, street: text })}
              />
              <TextInput
                style={styles.addressInput}
                placeholder="City"
                value={address.city}
                onChangeText={(text) => setAddress({ ...address, city: text })}
              />
              <TextInput
                style={styles.addressInput}
                placeholder="State"
                value={address.state}
                onChangeText={(text) => setAddress({ ...address, state: text })}
              />
              <TextInput
                style={styles.addressInput}
                placeholder="Pincode"
                keyboardType="numeric"
                value={address.pincode}
                onChangeText={(text) => setAddress({ ...address, pincode: text })}
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe your requirements..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Any special instructions for the service provider..."
            multiline
            numberOfLines={3}
            value={specialRequests}
            onChangeText={setSpecialRequests}
          />
        </View>

        {/* Pricing Summary */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Price Summary</Text>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>
              Service Charge ({duration} hr × ₹{pricing.basePrice}/hr)
            </Text>
            <Text style={styles.pricingValue}>₹{pricing.totalAmount}</Text>
          </View>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>GST (18%)</Text>
            <Text style={styles.pricingValue}>₹{Math.round(pricing.tax)}</Text>
          </View>
          
          {pricing.discount > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Discount</Text>
              <Text style={[styles.pricingValue, styles.discountText]}>
                -₹{pricing.discount}
              </Text>
            </View>
          )}
          
          <View style={[styles.pricingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{Math.round(pricing.finalAmount)}</Text>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              Confirm Booking • ₹{Math.round(pricing.finalAmount)}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <AddressModal />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  providerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  providerService: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  dateTimeText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  durationTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  addressDetails: {
    flex: 1,
    marginLeft: 12,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  changeText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  pricingCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6B6B',
  },
  bookButton: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addressOption: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressOptionSelected: {
    backgroundColor: '#FFF5F5',
  },
  addressOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  addressStreet: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 12,
    color: '#999',
  },
  addNewAddressButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  addNewAddressText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingScreen;