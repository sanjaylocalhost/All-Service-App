import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { serviceCategories } from '../../constants/data';

const { width, height } = Dimensions.get('window');

const ServicesScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonCategory, setComingSoonCategory] = useState(null);
  
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: '',
    minPrice: '',
    distance: 'any',
    availableNow: false,
    verifiedOnly: false,
    minExperience: 'any',
    sortBy: 'rating',
  });

  // Animation values - ONLY ONCE!
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const searchScale = useRef(new Animated.Value(1)).current;

  // Extended service categories
  const extendedServiceCategories = [
    ...serviceCategories.map(cat => ({ ...cat, isAvailable: true, availableSubCategories: true })),
    {
      id: 'rental_house',
      name: 'Rental House',
      icon: 'home',
      color: '#9C27B0',
      description: 'Find perfect rental properties for your needs',
      providers: 45,
      rating: 4.7,
      isAvailable: true,
      availableSubCategories: true,
    },
    {
      id: 'car_wash',
      name: 'Car Wash',
      icon: 'local-car-wash',
      color: '#00BCD4',
      description: 'Professional car cleaning and detailing',
      providers: 0,
      rating: 0,
      isAvailable: false,
      availableSubCategories: false,
      comingSoon: true,
    },
    {
      id: 'appliance_repair',
      name: 'Appliance Repair',
      icon: 'electrical-services',
      color: '#FF9800',
      description: 'Repair all home appliances',
      providers: 0,
      rating: 0,
      isAvailable: false,
      availableSubCategories: false,
      comingSoon: true,
    },
    {
      id: 'gardening',
      name: 'Gardening',
      icon: 'grass',
      color: '#4CAF50',
      description: 'Garden maintenance and landscaping',
      providers: 0,
      rating: 0,
      isAvailable: false,
      availableSubCategories: false,
      comingSoon: true,
    },
    {
      id: 'pet_care',
      name: 'Pet Care',
      icon: 'pets',
      color: '#E91E63',
      description: 'Pet grooming and care services',
      providers: 0,
      rating: 0,
      isAvailable: false,
      availableSubCategories: false,
      comingSoon: true,
    },
  ];

  // Subcategories data
  const subCategoriesData = {
    'Electrician': [
      { id: 'e1', name: 'Wiring & Installation', icon: 'bolt', count: 15, color: '#FF9800' },
      { id: 'e2', name: 'Repair & Maintenance', icon: 'build', count: 23, color: '#FF9800' },
      { id: 'e3', name: 'Emergency Service', icon: 'warning', count: 8, color: '#FF9800' },
      { id: 'e4', name: 'Appliance Repair', icon: 'electrical-services', count: 12, color: '#FF9800' },
    ],
    'Plumber': [
      { id: 'p1', name: 'Pipe Repair', icon: 'plumbing', count: 18, color: '#2196F3' },
      { id: 'p2', name: 'Leakage Fix', icon: 'water-damage', count: 22, color: '#2196F3' },
      { id: 'p3', name: 'Installation', icon: 'install', count: 14, color: '#2196F3' },
      { id: 'p4', name: 'Drain Cleaning', icon: 'clean-hands', count: 10, color: '#2196F3' },
    ],
    'AC Repair': [
      { id: 'ac1', name: 'AC Service', icon: 'ac-unit', count: 16, color: '#00BCD4' },
      { id: 'ac2', name: 'Gas Refill', icon: 'propane', count: 12, color: '#00BCD4' },
      { id: 'ac3', name: 'Installation', icon: 'install', count: 9, color: '#00BCD4' },
      { id: 'ac4', name: 'Repair', icon: 'build', count: 20, color: '#00BCD4' },
    ],
    'House Cleaning': [
      { id: 'h1', name: 'Deep Cleaning', icon: 'cleaning-services', count: 25, color: '#4CAF50' },
      { id: 'h2', name: 'Regular Cleaning', icon: 'cleaning', count: 30, color: '#4CAF50' },
      { id: 'h3', name: 'Kitchen Cleaning', icon: 'kitchen', count: 18, color: '#4CAF50' },
      { id: 'h4', name: 'Bathroom Cleaning', icon: 'bathroom', count: 15, color: '#4CAF50' },
    ],
    'Tutor': [
      { id: 't1', name: 'Mathematics', icon: 'calculate', count: 12, color: '#9C27B0' },
      { id: 't2', name: 'Science', icon: 'science', count: 10, color: '#9C27B0' },
      { id: 't3', name: 'English', icon: 'language', count: 14, color: '#9C27B0' },
      { id: 't4', name: 'Computer', icon: 'computer', count: 8, color: '#9C27B0' },
    ],
    'Delivery Helper': [
      { id: 'd1', name: 'Parcel Delivery', icon: 'delivery-dining', count: 20, color: '#FF5722' },
      { id: 'd2', name: 'Food Delivery', icon: 'fastfood', count: 25, color: '#FF5722' },
      { id: 'd3', name: 'Grocery', icon: 'shopping-cart', count: 18, color: '#FF5722' },
      { id: 'd4', name: 'Document Pickup', icon: 'description', count: 12, color: '#FF5722' },
    ],
    'Carpenter': [
      { id: 'c1', name: 'Furniture Making', icon: 'chair', count: 18, color: '#8D6E63' },
      { id: 'c2', name: 'Cabinet Installation', icon: 'kitchen', count: 22, color: '#8D6E63' },
      { id: 'c3', name: 'Door & Window Repair', icon: 'door-front', count: 15, color: '#8D6E63' },
      { id: 'c4', name: 'Wood Polishing', icon: 'format-paint', count: 12, color: '#8D6E63' },
    ],
    'Painter': [
      { id: 'pa1', name: 'Wall Painting', icon: 'wallpaper', count: 25, color: '#FF6B6B' },
      { id: 'pa2', name: 'Texture Painting', icon: 'texture', count: 15, color: '#FF6B6B' },
      { id: 'pa3', name: 'Waterproofing', icon: 'water', count: 12, color: '#FF6B6B' },
      { id: 'pa4', name: 'Exterior Painting', icon: 'home', count: 18, color: '#FF6B6B' },
    ],
    'Mechanic': [
      { id: 'm1', name: 'Car Repair', icon: 'car-repair', count: 20, color: '#607D8B' },
      { id: 'm2', name: 'Bike Repair', icon: 'motorcycle', count: 18, color: '#607D8B' },
      { id: 'm3', name: 'Oil Change', icon: 'oil-barrel', count: 15, color: '#607D8B' },
      { id: 'm4', name: 'Tire Service', icon: 'tire-repair', count: 12, color: '#607D8B' },
    ],
    'Beauty': [
      { id: 'b1', name: 'Hair Styling', icon: 'cut', count: 30, color: '#E91E63' },
      { id: 'b2', name: 'Makeup', icon: 'makeup', count: 25, color: '#E91E63' },
      { id: 'b3', name: 'Facial & Skin Care', icon: 'face', count: 22, color: '#E91E63' },
      { id: 'b4', name: 'Manicure/Pedicure', icon: 'spa', count: 18, color: '#E91E63' },
    ],
    'Pest Control': [
      { id: 'pc1', name: 'Cockroach Control', icon: 'bug-report', count: 20, color: '#795548' },
      { id: 'pc2', name: 'Termite Control', icon: 'bug-report', count: 15, color: '#795548' },
      { id: 'pc3', name: 'Mosquito Control', icon: 'mosquito', count: 18, color: '#795548' },
      { id: 'pc4', name: 'Rodent Control', icon: 'mouse', count: 12, color: '#795548' },
    ],
    'Moving': [
      { id: 'mv1', name: 'House Shifting', icon: 'home', count: 25, color: '#FF9800' },
      { id: 'mv2', name: 'Office Shifting', icon: 'business', count: 15, color: '#FF9800' },
      { id: 'mv3', name: 'Packing Services', icon: 'inventory', count: 20, color: '#FF9800' },
      { id: 'mv4', name: 'Vehicle Transport', icon: 'local-shipping', count: 12, color: '#FF9800' },
    ],
    'Rental House': [
      { id: 'rh1', name: 'Residential Rent', icon: 'apartment', count: 28, color: '#9C27B0' },
      { id: 'rh2', name: 'Commercial Rent', icon: 'business', count: 15, color: '#9C27B0' },
      { id: 'rh3', name: 'PG & Hostels', icon: 'hotel', count: 32, color: '#9C27B0' },
      { id: 'rh4', name: 'Vacation Rentals', icon: 'beach-access', count: 12, color: '#9C27B0' },
      { id: 'rh5', name: 'Furnished Houses', icon: 'room', count: 18, color: '#9C27B0' },
    ],
  };

  // Sample providers data
  const sampleProviders = {
    'Electrician': [
      {
        id: 'e1',
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
        id: 'e2',
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
    ],
    'Plumber': [
      {
        id: 'p1',
        name: 'Suresh Patel',
        service: 'Plumber',
        subService: 'Pipe Repair',
        experience: '7 years',
        rating: 4.9,
        reviews: 234,
        price: '₹450/hr',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        available: true,
        distance: '1.5 km',
        verified: true,
      },
      {
        id: 'p2',
        name: 'Anita Verma',
        service: 'Plumber',
        subService: 'Leakage Fix',
        experience: '4 years',
        rating: 4.7,
        reviews: 156,
        price: '₹380/hr',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        available: true,
        distance: '2.1 km',
        verified: true,
      },
    ],
    'AC Repair': [
      {
        id: 'ac1',
        name: 'Amit Sharma',
        service: 'AC Repair',
        subService: 'AC Service',
        experience: '6 years',
        rating: 4.8,
        reviews: 189,
        price: '₹550/hr',
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
        available: true,
        distance: '1.8 km',
        verified: true,
      },
      {
        id: 'ac2',
        name: 'Neha Gupta',
        service: 'AC Repair',
        subService: 'Gas Refill',
        experience: '3 years',
        rating: 4.5,
        reviews: 67,
        price: '₹420/hr',
        image: 'https://randomuser.me/api/portraits/women/3.jpg',
        available: true,
        distance: '2.3 km',
        verified: true,
      },
    ],
    'House Cleaning': [
      {
        id: 'hc1',
        name: 'Meera Singh',
        service: 'House Cleaning',
        subService: 'Deep Cleaning',
        experience: '5 years',
        rating: 4.9,
        reviews: 278,
        price: '₹350/hr',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
        available: true,
        distance: '1.2 km',
        verified: true,
      },
      {
        id: 'hc2',
        name: 'Raj Malhotra',
        service: 'House Cleaning',
        subService: 'Regular Cleaning',
        experience: '4 years',
        rating: 4.6,
        reviews: 145,
        price: '₹280/hr',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
        available: true,
        distance: '2.8 km',
        verified: true,
      },
    ],
    'Tutor': [
      {
        id: 't1',
        name: 'Dr. Kavita Reddy',
        service: 'Tutor',
        subService: 'Mathematics',
        experience: '10 years',
        rating: 4.9,
        reviews: 456,
        price: '₹800/hr',
        image: 'https://randomuser.me/api/portraits/women/5.jpg',
        available: true,
        distance: '1.5 km',
        verified: true,
      },
      {
        id: 't2',
        name: 'Prof. Ramesh Iyer',
        service: 'Tutor',
        subService: 'Science',
        experience: '8 years',
        rating: 4.8,
        reviews: 324,
        price: '₹700/hr',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
        available: true,
        distance: '2.2 km',
        verified: true,
      },
    ],
    'Delivery Helper': [
      {
        id: 'd1',
        name: 'Vikram Singh',
        service: 'Delivery Helper',
        subService: 'Parcel Delivery',
        experience: '3 years',
        rating: 4.7,
        reviews: 98,
        price: '₹200/hr',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        available: true,
        distance: '1.0 km',
        verified: true,
      },
      {
        id: 'd2',
        name: 'Sunita Devi',
        service: 'Delivery Helper',
        subService: 'Food Delivery',
        experience: '2 years',
        rating: 4.5,
        reviews: 76,
        price: '₹180/hr',
        image: 'https://randomuser.me/api/portraits/women/6.jpg',
        available: true,
        distance: '1.7 km',
        verified: true,
      },
    ],
    'Carpenter': [
      {
        id: 'c1',
        name: 'Rakesh Yadav',
        service: 'Carpenter',
        subService: 'Furniture Making',
        experience: '8 years',
        rating: 4.9,
        reviews: 234,
        price: '₹450/hr',
        image: 'https://randomuser.me/api/portraits/men/7.jpg',
        available: true,
        distance: '1.5 km',
        verified: true,
      },
      {
        id: 'c2',
        name: 'Mohan Kumar',
        service: 'Carpenter',
        subService: 'Cabinet Installation',
        experience: '6 years',
        rating: 4.7,
        reviews: 156,
        price: '₹400/hr',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
        available: true,
        distance: '2.1 km',
        verified: true,
      },
    ],
    'Painter': [
      {
        id: 'pa1',
        name: 'Vikram Singh',
        service: 'Painter',
        subService: 'Wall Painting',
        experience: '7 years',
        rating: 4.8,
        reviews: 189,
        price: '₹350/hr',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        available: true,
        distance: '1.8 km',
        verified: true,
      },
      {
        id: 'pa2',
        name: 'Arun Sharma',
        service: 'Painter',
        subService: 'Texture Painting',
        experience: '5 years',
        rating: 4.6,
        reviews: 123,
        price: '₹420/hr',
        image: 'https://randomuser.me/api/portraits/men/10.jpg',
        available: true,
        distance: '2.3 km',
        verified: true,
      },
    ],
    'Mechanic': [
      {
        id: 'm1',
        name: 'Ravi Verma',
        service: 'Mechanic',
        subService: 'Car Repair',
        experience: '10 years',
        rating: 4.9,
        reviews: 342,
        price: '₹600/hr',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
        available: true,
        distance: '2.3 km',
        verified: true,
      },
      {
        id: 'm2',
        name: 'Sanjay Mehta',
        service: 'Mechanic',
        subService: 'Bike Repair',
        experience: '6 years',
        rating: 4.7,
        reviews: 198,
        price: '₹350/hr',
        image: 'https://randomuser.me/api/portraits/men/12.jpg',
        available: true,
        distance: '1.8 km',
        verified: true,
      },
    ],
    'Beauty': [
      {
        id: 'b1',
        name: 'Neha Sharma',
        service: 'Beauty',
        subService: 'Hair Styling',
        experience: '5 years',
        rating: 4.8,
        reviews: 267,
        price: '₹500/hr',
        image: 'https://randomuser.me/api/portraits/women/7.jpg',
        available: true,
        distance: '1.2 km',
        verified: true,
      },
      {
        id: 'b2',
        name: 'Priyanka Kapoor',
        service: 'Beauty',
        subService: 'Makeup',
        experience: '4 years',
        rating: 4.9,
        reviews: 312,
        price: '₹600/hr',
        image: 'https://randomuser.me/api/portraits/women/8.jpg',
        available: true,
        distance: '2.0 km',
        verified: true,
      },
    ],
    'Pest Control': [
      {
        id: 'pc1',
        name: 'Amit Pest Solutions',
        service: 'Pest Control',
        subService: 'Cockroach Control',
        experience: '6 years',
        rating: 4.7,
        reviews: 145,
        price: '₹800/session',
        image: 'https://randomuser.me/api/portraits/men/13.jpg',
        available: true,
        distance: '3.1 km',
        verified: true,
      },
      {
        id: 'pc2',
        name: 'Green Pest Control',
        service: 'Pest Control',
        subService: 'Termite Control',
        experience: '5 years',
        rating: 4.6,
        reviews: 98,
        price: '₹1000/session',
        image: 'https://randomuser.me/api/portraits/men/14.jpg',
        available: true,
        distance: '2.5 km',
        verified: true,
      },
    ],
    'Moving': [
      {
        id: 'mv1',
        name: 'SafeMove Packers',
        service: 'Moving',
        subService: 'House Shifting',
        experience: '8 years',
        rating: 4.8,
        reviews: 289,
        price: '₹2000/truck',
        image: 'https://randomuser.me/api/portraits/men/15.jpg',
        available: true,
        distance: '2.5 km',
        verified: true,
      },
      {
        id: 'mv2',
        name: 'Reliable Movers',
        service: 'Moving',
        subService: 'Office Shifting',
        experience: '6 years',
        rating: 4.7,
        reviews: 156,
        price: '₹2500/truck',
        image: 'https://randomuser.me/api/portraits/men/16.jpg',
        available: true,
        distance: '3.0 km',
        verified: true,
      },
    ],
    'Rental House': [
      {
        id: 'rh1',
        name: 'Sunset Villa',
        type: 'Residential Rent',
        subService: '3 BHK Furnished House',
        bedrooms: 3,
        bathrooms: 2,
        area: '1500 sq.ft',
        rating: 4.9,
        reviews: 45,
        price: '₹25,000/month',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
        available: true,
        location: 'Indiranagar',
        distance: '1.5 km',
        verified: true,
        amenities: ['Parking', 'Garden', 'Security'],
      },
      {
        id: 'rh2',
        name: 'Green Valley Apartment',
        type: 'Residential Rent',
        subService: '2 BHK Semi-Furnished',
        bedrooms: 2,
        bathrooms: 2,
        area: '1100 sq.ft',
        rating: 4.7,
        reviews: 32,
        price: '₹18,000/month',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
        available: true,
        location: 'Koramangala',
        distance: '2.3 km',
        verified: true,
        amenities: ['Gym', 'Swimming Pool', 'Parking'],
      },
    ],
  };

  // Initial animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle route params
  useEffect(() => {
    if (route.params?.category) {
      handleCategorySelect(route.params.category);
    }
  }, [route.params?.category]);

  const animateSearch = () => {
    Animated.sequence([
      Animated.timing(searchScale, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(searchScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCategorySelect = (category) => {
    if (!category.isAvailable) {
      setComingSoonCategory(category);
      setShowComingSoonModal(false);
      return;
    }

    setIsLoading(true);
    setSelectedCategory(category);
    setShowSubCategories(true);
    
    setTimeout(() => {
      setProviders(sampleProviders[category.name] || []);
      setIsLoading(false);
    }, 500);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowSubCategories(false);
    setSearchText('');
  };

  const handleSubCategorySelect = (subCategory) => {
    if (selectedCategory?.name === 'Rental House') {
      navigation.navigate('RentalProperties', { 
        category: selectedCategory,
        subCategory: subCategory,
      });
    } else {
      navigation.navigate('ProviderList', { 
        category: selectedCategory,
        subCategory: subCategory,
      });
    }
  };

  const handleViewAllProviders = () => {
    if (selectedCategory?.name === 'Rental House') {
      navigation.navigate('RentalProperties', { category: selectedCategory });
    } else {
      navigation.navigate('ProviderList', { category: selectedCategory });
    }
  };

const handleBookNow = (provider) => {
  if (selectedCategory?.name === 'Rental House') {
    navigation.navigate('RentalDetails', { property: provider });
  } else {
    // This will navigate from the tab screen to the stack screen
    navigation.navigate('Booking', { provider: provider });
  }
};

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = [...providers];
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.minRating);
    }
    if (filters.minPrice) {
      const min = parseInt(filters.minPrice.replace(/\D/g, ''));
      filtered = filtered.filter(p => {
        const price = parseInt(p.price.replace(/\D/g, ''));
        return price >= min;
      });
    }
    if (filters.maxPrice) {
      const max = parseInt(filters.maxPrice.replace(/\D/g, ''));
      filtered = filtered.filter(p => {
        const price = parseInt(p.price.replace(/\D/g, ''));
        return price <= max;
      });
    }
    if (filters.distance !== 'any') {
      const maxDist = parseInt(filters.distance);
      filtered = filtered.filter(p => {
        const dist = parseFloat(p.distance);
        return dist <= maxDist;
      });
    }
    if (filters.availableNow) {
      filtered = filtered.filter(p => p.available);
    }
    if (filters.verifiedOnly) {
      filtered = filtered.filter(p => p.verified);
    }
    
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'price_low') {
      filtered.sort((a, b) => {
        const aPrice = parseInt(a.price.replace(/\D/g, ''));
        const bPrice = parseInt(b.price.replace(/\D/g, ''));
        return aPrice - bPrice;
      });
    } else if (filters.sortBy === 'price_high') {
      filtered.sort((a, b) => {
        const aPrice = parseInt(a.price.replace(/\D/g, ''));
        const bPrice = parseInt(b.price.replace(/\D/g, ''));
        return bPrice - aPrice;
      });
    }
    
    setProviders(filtered);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      minRating: 0,
      maxPrice: '',
      minPrice: '',
      distance: 'any',
      availableNow: false,
      verifiedOnly: false,
      minExperience: 'any',
      sortBy: 'rating',
    });
    setProviders(sampleProviders[selectedCategory?.name] || []);
    setShowFilterModal(false);
  };

  // Coming Soon Modal Component
  const ComingSoonModal = () => (
    <Modal
      visible={showComingSoonModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowComingSoonModal(false)}
    >
      <View style={styles.comingSoonOverlay}>
        <View style={styles.comingSoonModal}>
          <View style={styles.comingSoonIconContainer}>
            <Ionicons name="construct-outline" size={60} color="#FF6B6B" />
          </View>
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            We're working hard to bring you the best {comingSoonCategory?.name} services.
          </Text>
          <Text style={styles.comingSoonSubtext}>
            This service will be available in the next update. Stay tuned!
          </Text>
          <TouchableOpacity 
            style={styles.comingSoonButton}
            onPress={() => setShowComingSoonModal(false)}
          >
            <Text style={styles.comingSoonButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render functions
  const renderCategoryItem = ({ item, index }) => {
    const inputRange = [-1, 0, index * 100, (index + 1) * 100];
    const translateY = fadeAnim.interpolate({
      inputRange,
      outputRange: [50, 0, 0, 0],
    });

    return (
      <Animated.View style={{ transform: [{ translateY }] }}>
        <TouchableOpacity 
          style={[styles.serviceCard, !item.isAvailable && styles.serviceCardDisabled]}
          onPress={() => handleCategorySelect(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.serviceIcon, { backgroundColor: item.color + '10' }]}>
            <Icon name={item.icon} size={32} color={item.color} />
          </View>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceNameContainer}>
              <Text style={styles.serviceName}>{item.name}</Text>
              {!item.isAvailable && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonBadgeText}>Soon</Text>
                </View>
              )}
            </View>
            <Text style={styles.serviceDesc} numberOfLines={1}>
              {item.description || 'Professional services at your doorstep'}
            </Text>
            {item.isAvailable ? (
              <View style={styles.serviceMeta}>
                <View style={styles.serviceCountBadge}>
                  <Icon name="people" size={12} color={item.color} />
                  <Text style={[styles.serviceCount, { color: item.color }]}>
                    {item.providers || Math.floor(Math.random() * 50) + 20}+ providers
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.comingSoonTextSmall}>Launching soon</Text>
            )}
          </View>
          <Icon name="chevron-right" size={24} color={item.isAvailable ? "#ccc" : "#ddd"} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSubCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.subCategoryCard}
      onPress={() => handleSubCategorySelect(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.subCategoryIcon, { backgroundColor: item.color + '15' }]}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.subCategoryInfo}>
        <Text style={styles.subCategoryName}>{item.name}</Text>
        <Text style={styles.subCategoryCount}>{item.count} professionals available</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderProviderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.providerCard, selectedCategory?.name === 'Rental House' && styles.rentalCard]}
      onPress={() => navigation.navigate('ProviderDetails', { providerId: item.id })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.providerImage} />
      <View style={styles.providerInfo}>
        <View style={styles.providerHeader}>
          <Text style={styles.providerName}>{item.name}</Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          )}
        </View>
        
        <Text style={styles.providerService}>{item.subService}</Text>
        
        {selectedCategory?.name === 'Rental House' ? (
          <>
            <View style={styles.rentalDetails}>
              <View style={styles.detailChip}>
                <Icon name="king-bed" size={12} color="#666" />
                <Text style={styles.detailText}>{item.bedrooms} BHK</Text>
              </View>
              <View style={styles.detailChip}>
                <Icon name="bathtub" size={12} color="#666" />
                <Text style={styles.detailText}>{item.bathrooms} Bath</Text>
              </View>
            </View>
            
            <View style={styles.amenitiesContainer}>
              {item.amenities?.slice(0, 2).map((amenity, index) => (
                <View key={index} style={styles.amenityChip}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.providerDetails}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingValue}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviews})</Text>
            </View>
            <View style={styles.experienceContainer}>
              <Icon name="work" size={12} color="#666" />
              <Text style={styles.experienceText}>{item.experience}</Text>
            </View>
          </View>
        )}

        <View style={styles.providerFooter}>
          <View style={styles.distanceContainer}>
            <Icon name="location-on" size={12} color="#666" />
            <Text style={styles.distanceText}>{item.location || item.distance}</Text>
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
            {selectedCategory?.name === 'Rental House' ? 'View Details' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  { label: 'Rating', value: 'rating', icon: 'star' },
                  { label: 'Price: Low', value: 'price_low', icon: 'trending-down' },
                  { label: 'Price: High', value: 'price_high', icon: 'trending-up' },
                  { label: 'Distance', value: 'distance', icon: 'location-on' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      filters.sortBy === option.value && styles.sortOptionActive,
                    ]}
                    onPress={() => handleFilterChange('sortBy', option.value)}
                  >
                    <Icon 
                      name={option.icon} 
                      size={16} 
                      color={filters.sortBy === option.value ? '#fff' : '#666'} 
                    />
                    <Text 
                      style={[
                        styles.sortOptionText,
                        filters.sortBy === option.value && styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingOptions}>
                {[0, 3, 4, 4.5, 4.8].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingChip,
                      filters.minRating === rating && styles.ratingChipActive,
                    ]}
                    onPress={() => handleFilterChange('minRating', rating)}
                  >
                    {rating === 0 ? (
                      <Text style={styles.ratingChipText}>Any</Text>
                    ) : (
                      <>
                        <Icon name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingChipText}>{rating}+</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range (₹/hr)</Text>
              <View style={styles.priceInputs}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={filters.minPrice}
                  onChangeText={(val) => handleFilterChange('minPrice', val)}
                />
                <Text style={styles.priceSeparator}>to</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={filters.maxPrice}
                  onChangeText={(val) => handleFilterChange('maxPrice', val)}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Distance</Text>
              <View style={styles.distanceOptions}>
                {[
                  { label: 'Any', value: 'any' },
                  { label: '1 km', value: '1km' },
                  { label: '5 km', value: '5km' },
                  { label: '10 km', value: '10km' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.distanceChip,
                      filters.distance === option.value && styles.distanceChipActive,
                    ]}
                    onPress={() => handleFilterChange('distance', option.value)}
                  >
                    <Text 
                      style={[
                        styles.distanceChipText,
                        filters.distance === option.value && styles.distanceChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.toggleOption}
                onPress={() => handleFilterChange('availableNow', !filters.availableNow)}
              >
                <View style={styles.toggleRow}>
                  <Icon name="access-time" size={20} color="#666" />
                  <Text style={styles.toggleLabel}>Available Now</Text>
                </View>
                <View style={[styles.toggleSwitch, filters.availableNow && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleKnob, filters.availableNow && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.toggleOption}
                onPress={() => handleFilterChange('verifiedOnly', !filters.verifiedOnly)}
              >
                <View style={styles.toggleRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.toggleLabel}>Verified Providers Only</Text>
                </View>
                <View style={[styles.toggleSwitch, filters.verifiedOnly && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleKnob, filters.verifiedOnly && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const filteredCategories = searchText
    ? extendedServiceCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : extendedServiceCategories;

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
        {/* Header */}
        <View style={styles.header}>
          {showSubCategories ? (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToCategories}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {showSubCategories ? selectedCategory?.name : 'Explore Services'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {showSubCategories 
                ? 'Choose a specific service type'
                : 'Find trusted professionals near you'
              }
            </Text>
          </View>
          {!showSubCategories && (
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={toggleFilterModal}
            >
              <Ionicons name="options-outline" size={22} color="#FF6B6B" />
              {(filters.minRating > 0 || filters.verifiedOnly || filters.availableNow) && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>•</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <Animated.View style={[styles.searchWrapper, { transform: [{ scale: searchScale }] }]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={22} color="#FF6B6B" />
            <TextInput
              style={styles.searchInput}
              placeholder={showSubCategories ? "Search in this category..." : "Search services..."}
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              onFocus={animateSearch}
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={{ opacity: fadeAnim }}
        >
          {!showSubCategories ? (
            // Categories Grid
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
            // Subcategories and Providers
            <View>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF6B6B" />
                  <Text style={styles.loadingText}>Loading services...</Text>
                </View>
              ) : (
                <>
                  {/* Subcategories Section */}
                  {subCategoriesData[selectedCategory?.name] && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Service Types</Text>
                      <FlatList
                        data={subCategoriesData[selectedCategory?.name]}
                        renderItem={renderSubCategoryItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.subCategoryList}
                      />
                    </View>
                  )}

                  {/* Featured Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        {selectedCategory?.name === 'Rental House' ? 'Featured Properties' : 'Top Professionals'}
                      </Text>
                      {providers.length > 0 && (
                        <TouchableOpacity onPress={handleViewAllProviders}>
                          <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {filteredProviders.length > 0 ? (
                      <View style={styles.providersGrid}>
                        {filteredProviders.slice(0, 2).map((item) => (
                          <View key={item.id} style={styles.providerGridItem}>
                            {renderProviderItem({ item })}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No results found</Text>
                        <Text style={styles.emptyStateSubText}>Try different keywords</Text>
                      </View>
                    )}
                  </View>

                  {/* Stats Section */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statsCard}>
                      <Ionicons name="people" size={24} color="#FF6B6B" />
                      <Text style={styles.statsNumber}>{providers.length}+</Text>
                      <Text style={styles.statsLabel}>Active Providers</Text>
                    </View>
                    <View style={styles.statsCard}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <Text style={styles.statsNumber}>100%</Text>
                      <Text style={styles.statsLabel}>Verified</Text>
                    </View>
                    <View style={styles.statsCard}>
                      <Ionicons name="time" size={24} color="#FF9800" />
                      <Text style={styles.statsNumber}>24/7</Text>
                      <Text style={styles.statsLabel}>Support</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </Animated.ScrollView>
      </View>
      
      {renderFilterModal()}
      <ComingSoonModal />
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4,
    fontWeight: '400',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    paddingVertical: Platform.OS === 'ios' ? 8 : 0,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  list: { 
    paddingBottom: 10,
  },
  serviceCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontWeight: '700', 
    color: '#1a1a1a',
    marginBottom: 4,
  },
  serviceDesc: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceCount: { 
    fontSize: 11, 
    fontWeight: '500',
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  viewAllText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  subCategoryList: {
    paddingBottom: 5,
  },
  subCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  subCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCategoryInfo: {
    flex: 1,
    marginLeft: 14,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  subCategoryCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  providerGridItem: {
    width: '48%',
  },
  providerCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rentalCard: {
    backgroundColor: '#fff',
  },
  providerImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  providerInfo: {
    flex: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  providerService: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  providerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 10,
    color: '#999',
    marginLeft: 2,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  rentalDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 9,
    color: '#666',
    marginLeft: 3,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  amenityChip: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 9,
    color: '#FF6B6B',
  },
  providerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 3,
  },
  priceContainer: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  bookButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginTop: 6,
  },
  statsLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  filterSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    gap: 6,
  },
  sortOptionActive: {
    backgroundColor: '#FF6B6B',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#fff',
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    gap: 4,
  },
  ratingChipActive: {
    backgroundColor: '#FF6B6B',
  },
  ratingChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  priceSeparator: {
    color: '#999',
    fontSize: 14,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  distanceChipActive: {
    backgroundColor: '#FF6B6B',
  },
  distanceChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  distanceChipTextActive: {
    color: '#fff',
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#4CAF50',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  toggleKnobActive: {
    marginLeft: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Coming Soon Styles
  serviceCardDisabled: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },
  serviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  comingSoonBadge: {
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  comingSoonBadgeText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  comingSoonTextSmall: {
    fontSize: 11,
    color: '#FF6B6B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  comingSoonOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  comingSoonIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  comingSoonSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  comingSoonButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  comingSoonButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default ServicesScreen;