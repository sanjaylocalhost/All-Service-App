import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Alert, StatusBar, Platform, Modal, TextInput 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PaymentMethodsScreen = ({ navigation }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    isDefault: false,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const stored = await AsyncStorage.getItem('paymentMethods');
      if (stored) {
        setPaymentMethods(JSON.parse(stored));
      } else {
        // Sample data for demo
        setPaymentMethods([
          {
            id: '1',
            type: 'card',
            cardNumber: '**** **** **** 4242',
            cardHolder: 'John Doe',
            expiry: '12/25',
            isDefault: true,
            brand: 'visa',
          },
          {
            id: '2',
            type: 'card',
            cardNumber: '**** **** **** 8888',
            cardHolder: 'John Doe',
            expiry: '08/26',
            isDefault: false,
            brand: 'mastercard',
          },
          {
            id: '3',
            type: 'upi',
            upiId: 'john@oksbi',
            isDefault: false,
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const savePaymentMethods = async (methods) => {
    try {
      await AsyncStorage.setItem('paymentMethods', JSON.stringify(methods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
    }
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiry) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const maskedNumber = `**** **** **** ${newCard.cardNumber.slice(-4)}`;
    const newMethod = {
      id: Date.now().toString(),
      type: 'card',
      cardNumber: maskedNumber,
      cardHolder: newCard.cardHolder,
      expiry: newCard.expiry,
      isDefault: newCard.isDefault,
      brand: 'visa',
    };

    // If setting as default, unset others
    let updatedMethods = [...paymentMethods];
    if (newCard.isDefault) {
      updatedMethods = updatedMethods.map(m => ({ ...m, isDefault: false }));
    }

    updatedMethods.push(newMethod);
    setPaymentMethods(updatedMethods);
    savePaymentMethods(updatedMethods);
    
    // Reset form
    setNewCard({ cardNumber: '', cardHolder: '', expiry: '', cvv: '', isDefault: false });
    setShowAddModal(false);
    Alert.alert('Success', 'Card added successfully!');
  };

  const handleSetDefault = (id) => {
    const updatedMethods = paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id,
    }));
    setPaymentMethods(updatedMethods);
    savePaymentMethods(updatedMethods);
  };

  const handleRemove = (id) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedMethods = paymentMethods.filter(m => m.id !== id);
            setPaymentMethods(updatedMethods);
            savePaymentMethods(updatedMethods);
          },
        },
      ]
    );
  };

  const getCardIcon = (brand) => {
    switch (brand) {
      case 'visa': return <Icon name="credit-card" size={32} color="#1A73E8" />;
      case 'mastercard': return <Icon name="credit-card" size={32} color="#EB001B" />;
      default: return <Icon name="credit-card" size={32} color="#666" />;
    }
  };

  const renderPaymentMethod = (item) => (
    <View key={item.id} style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIcon}>
          {item.type === 'card' ? getCardIcon(item.brand) : (
            <Icon name="account-balance-wallet" size={32} color="#4CAF50" />
          )}
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>
            {item.type === 'card' ? item.cardNumber : `UPI: ${item.upiId}`}
          </Text>
          <Text style={styles.paymentSubtitle}>
            {item.type === 'card' ? `${item.cardHolder} • Expires ${item.expiry}` : 'Unified Payments Interface'}
          </Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.paymentActions}>
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Icon name="star-border" size={18} color="#FF6B6B" />
            <Text style={styles.actionText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleRemove(item.id)}
        >
          <Icon name="delete-outline" size={18} color="#FF6B6B" />
          <Text style={styles.actionText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Add New Method Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>

        {/* Payment Methods List */}
        <View style={styles.methodsList}>
          {paymentMethods.length > 0 ? (
            paymentMethods.map(renderPaymentMethod)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="credit-card-off" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No payment methods added</Text>
              <Text style={styles.emptyStateSubText}>Add a card or UPI to make payments easier</Text>
            </View>
          )}
        </View>

        {/* Supported Methods Info */}
        <View style={styles.infoCard}>
          <Icon name="info-outline" size={20} color="#FF6B6B" />
          <Text style={styles.infoText}>
            We support all major credit/debit cards and UPI payments. 
            Your payment information is securely encrypted.
          </Text>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={19}
                value={newCard.cardNumber}
                onChangeText={(val) => setNewCard({ ...newCard, cardNumber: val.replace(/\s/g, '') })}
              />
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                placeholderTextColor="#999"
                value={newCard.cardHolder}
                onChangeText={(val) => setNewCard({ ...newCard, cardHolder: val })}
              />
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  maxLength={5}
                  value={newCard.expiry}
                  onChangeText={(val) => setNewCard({ ...newCard, expiry: val })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="CVV"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={newCard.cvv}
                  onChangeText={(val) => setNewCard({ ...newCard, cvv: val })}
                />
              </View>

              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => setNewCard({ ...newCard, isDefault: !newCard.isDefault })}
              >
                <View style={[styles.checkbox, newCard.isDefault && styles.checkboxChecked]}>
                  {newCard.isDefault && <Icon name="check" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
              <Text style={styles.saveButtonText}>Save Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    paddingTop: Platform.OS === 'android' ? 45 : 50,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FF6B6B', paddingVertical: 14, borderRadius: 12,
    marginBottom: 20, gap: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  methodsList: { gap: 12 },
  paymentCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  paymentIcon: {
    width: 50, height: 50, borderRadius: 10, backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  paymentSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  defaultBadge: {
    backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  
  paymentActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', marginRight: 20, gap: 4,
  },
  actionText: { fontSize: 12, color: '#FF6B6B', fontWeight: '500' },
  
  emptyState: {
    alignItems: 'center', padding: 40, backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16, fontWeight: '600', color: '#333', marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 13, color: '#999', marginTop: 4, textAlign: 'center',
  },
  
  infoCard: {
    flexDirection: 'row', backgroundColor: '#FFF5F5', padding: 14,
    borderRadius: 12, marginTop: 20, gap: 10, alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 18 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', padding: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: '#333', marginBottom: 14, backgroundColor: '#F9F9F9',
  },
  rowInputs: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  
  checkboxRow: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 8, gap: 10,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 5, borderWidth: 2,
    borderColor: '#FF6B6B', justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#FF6B6B' },
  checkboxLabel: { fontSize: 14, color: '#333', flex: 1 },
  
  saveButton: {
    backgroundColor: '#FF6B6B', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 10,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PaymentMethodsScreen;