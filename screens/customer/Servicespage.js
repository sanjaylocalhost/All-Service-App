import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// Data mapping for Sub-services based on Category
const subServiceData = {
  Electrician: [
    { id: 'e1', name: 'Wiring & Rewiring', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80' },
    { id: 'e2', name: 'Switch & Socket Repair', image: 'https://images.unsplash.com/photo-1544724107-6d5c4caaff30?w=500&q=80' },
    { id: 'e3', name: 'Fan & Light Installation', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80' },
    { id: 'e4', name: 'MCB & Fuse Repair', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80' },
  ],
  Plumber: [
    { id: 'p1', name: 'Leakage Fixing', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80' },
    { id: 'p2', name: 'Pipe Installation', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&q=80' },
    { id: 'p3', name: 'Bathroom Fitting', image: 'https://plus.unsplash.com/premium_photo-1664298168165-9f33842d3716?w=500&q=80' },
    { id: 'p4', name: 'Water Motor Repair', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80' },
  ],
  'AC Repair': [
    { id: 'a1', name: 'AC Service', image: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=500&q=80' },
    { id: 'a2', name: 'Gas Refill', image: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da5b?w=500&q=80' },
  ],
  Cleaning: [
    { id: 'c1', name: 'Home Cleaning', image: 'https://images.unsplash.com/photo-1581578731117-104f2a863a30?w=500&q=80' },
    { id: 'c2', name: 'Deep Cleaning', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&q=80' },
  ]
};

const Servicespage = ({ route, navigation }) => {
  const { category } = route.params || {}; // Category passed from Home
  
  // State for the Image Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubService, setSelectedSubService] = useState(null);

  // Get sub-services or fallback to defaults if category not found
  const services = subServiceData[category?.name] || [
    { id: '1', name: 'General Service', image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&q=80' },
    { id: '2', name: 'Repair & Maintenance', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80' },
  ];

  const handleSubServicePress = (item) => {
    setSelectedSubService(item);
    setModalVisible(true);
  };

  const handleProceed = () => {
    setModalVisible(false);
    // REDIRECT LOGIC: Navigate to a Provider List or Booking Screen
    // We pass the specific sub-service name and category
    navigation.navigate('SubServiceProviders', { 
      subService: item => item.name, // This is incorrect syntax, see fix below
      // Wait, let's fix the logic. We need to pass 'selectedSubService' data
      subServiceName: selectedSubService.name,
      categoryName: category.name 
    });
    
    // Correct logic in the actual code below:
    // navigation.navigate('SubServiceProviders', { ...selectedSubService, category: category.name });
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleSubServicePress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.overlay}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <View style={styles.iconContainer}>
          <Ionicons name="arrow-forward-circle" size={28} color="#FFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category?.name || 'Services'}</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Select a specific service type:</Text>
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </ScrollView>

      {/* IMAGE MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image 
              source={{ uri: selectedSubService?.image }} 
              style={styles.modalImage} 
            />
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{selectedSubService?.name}</Text>
              <Text style={styles.modalText}>Best professionals ready for {selectedSubService?.name}.</Text>
              
              <TouchableOpacity 
                style={styles.proceedBtn}
                onPress={() => {
                   setModalVisible(false);
                   // REDIRECT HAPPENS HERE
                   navigation.navigate('SubServiceProviders', { 
                     subService: selectedSubService,
                     category: category?.name 
                   });
                }}
              >
                <Text style={styles.proceedBtnText}>Find Providers</Text>
                <Icon name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    marginLeft: 5,
  },
  row: {
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    height: 150,
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    width: '80%',
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalInfo: {
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  proceedBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  proceedBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  cancelBtn: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
});

export default Servicespage;