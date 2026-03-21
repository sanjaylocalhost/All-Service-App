import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.mobile.length !== 10) {
      Alert.alert('Error', 'Please enter valid mobile number');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        address: formData.address || '',
        role: 'customer',
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        // Save user data and token to AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Show success message
        Alert.alert(
          'Success',
          'Registration successful!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to MainApp (which will show the home screen)
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainApp' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.log('Registration error:', error.response?.data || error.message);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = error.response.data.errors.map(e => e.msg).join('\n');
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="person-add" size={60} color="#007AFF" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Service to book local services</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number *"
              value={formData.mobile}
              onChangeText={(text) => setFormData({...formData, mobile: text})}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon 
                name={showPassword ? 'visibility' : 'visibility-off'} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon 
                name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="location-on" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;