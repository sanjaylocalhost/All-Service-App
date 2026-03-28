import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Linking, StatusBar, Platform, Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HelpSupportScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const faqCategories = [
    {
      id: 'bookings',
      title: 'Bookings & Services',
      icon: 'calendar-today',
      questions: [
        {
          q: 'How do I book a service?',
          a: 'Browse services on the home screen, select a provider, choose your preferred time slot, and confirm your booking. You\'ll receive a confirmation notification.',
        },
        {
          q: 'Can I reschedule or cancel my booking?',
          a: 'Yes! Go to Booking History, select your upcoming booking, and tap "Reschedule" or "Cancel". Free cancellation up to 2 hours before the scheduled time.',
        },
        {
          q: 'How do I contact my service provider?',
          a: 'After booking, you can contact your provider directly through the app via the "Contact" button in your booking details.',
        },
      ],
    },
    {
      id: 'payments',
      title: 'Payments & Pricing',
      icon: 'payment',
      questions: [
        {
          q: 'What payment methods are accepted?',
          a: 'We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), and cash on delivery for select services.',
        },
        {
          q: 'Is my payment information secure?',
          a: 'Absolutely! We use bank-level encryption and never store your full card details. All transactions are PCI-DSS compliant.',
        },
        {
          q: 'How are prices determined?',
          a: 'Prices are set by service providers based on service type, duration, and location. You\'ll see the final price before confirming your booking.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: 'person',
      questions: [
        {
          q: 'How do I update my profile information?',
          a: 'Go to Profile > Edit Profile to update your name, email, phone number, or profile picture.',
        },
        {
          q: 'How do I add or change my address?',
          a: 'Navigate to Profile > My Addresses to add, edit, or set a default address for your bookings.',
        },
        {
          q: 'How do I delete my account?',
          a: 'Please contact our support team through the chat option below, and we\'ll help you with account deletion.',
        },
      ],
    },
  ];

  const contactOptions = [
    {
      icon: 'chat',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      action: () => Alert.alert('Live Chat', 'Connecting you to support...\n\n(This would open a chat interface)'),
      color: '#4CAF50',
    },
    {
      icon: 'phone',
      title: 'Call Us',
      subtitle: '+91 8073665236',
      action: () => Linking.openURL('tel:+918073665236'),
      color: '#2196F3',
    },
    {
      icon: 'email',
      title: 'Email Support',
      subtitle: 'support@serviceapp.com',
      action: () => Linking.openURL('mailto:support@serviceapp.com'),
      color: '#FF9800',
    },
    {
      icon: 'bug-report',
      title: 'Report an Issue',
      subtitle: 'Help us improve the app',
      action: () => navigation.navigate('ReportIssue'),
      color: '#F44336',
    },
  ];

  const filteredFAQs = searchQuery
    ? faqCategories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q => 
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.questions.length > 0)
    : faqCategories;

  const toggleCategory = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Support</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={[styles.contactIcon, { backgroundColor: option.color + '15' }]}>
                  <Icon name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((category) => (
              <View key={category.id} style={styles.faqCategory}>
                <TouchableOpacity 
                  style={styles.faqHeader}
                  onPress={() => toggleCategory(category.id)}
                >
                  <View style={styles.faqHeaderLeft}>
                    <Icon name={category.icon} size={20} color="#FF6B6B" />
                    <Text style={styles.faqCategoryTitle}>{category.title}</Text>
                  </View>
                  <Icon 
                    name={selectedCategory === category.id ? 'expand-less' : 'expand-more'} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>
                
                {selectedCategory === category.id && (
                  <View style={styles.faqList}>
                    {category.questions.map((faq, index) => (
                      <View key={index} style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>{faq.q}</Text>
                        <Text style={styles.faqAnswer}>{faq.a}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No results found</Text>
              <Text style={styles.emptyStateSubText}>Try different keywords</Text>
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>January 2026</Text>
          </View>
          <TouchableOpacity 
            style={styles.termsLink}
            onPress={() => Alert.alert('Terms & Privacy', 'View full terms and privacy policy')}
          >
            <Text style={styles.termsText}>Terms of Service • Privacy Policy</Text>
            <Icon name="open-in-new" size={14} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 25,
    borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 20, gap: 10,
  },
  searchInput: {
    flex: 1, fontSize: 15, color: '#333', paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 16,
  },
  
  contactGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  contactCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    alignItems: 'center', marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  contactIcon: {
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center',
    alignItems: 'center', marginBottom: 10,
  },
  contactTitle: {
    fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 11, color: '#999', textAlign: 'center', marginTop: 4,
  },
  
  faqCategory: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  faqHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqCategoryTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  faqList: { paddingHorizontal: 16, paddingBottom: 16 },
  faqItem: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  faqQuestion: {
    fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6,
  },
  faqAnswer: { fontSize: 13, color: '#666', lineHeight: 18 },
  
  emptyState: {
    alignItems: 'center', padding: 30, backgroundColor: '#fff',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 15, fontWeight: '600', color: '#333', marginTop: 10,
  },
  emptyStateSubText: { fontSize: 12, color: '#999', marginTop: 4 },
  
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoLabel: { fontSize: 13, color: '#666' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#333' },
  termsLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, gap: 4,
  },
  termsText: { fontSize: 13, color: '#FF6B6B', fontWeight: '500' },
});

export default HelpSupportScreen;