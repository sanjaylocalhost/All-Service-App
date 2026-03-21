import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';

const LoginScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Attempting login to:', `${API_BASE_URL}/auth/login`);
      console.log('📱 Mobile:', mobileNumber);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        mobile: mobileNumber,
        password: password,
      });

      console.log('✅ Login response:', response.data);

      if (response.data.success) {
        // Save user data and token
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainApp' }],
        });
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('❌ Login error details:', {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD THIS MISSING FUNCTION - Handle Send OTP
  const handleSendOTP = async () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Please enter mobile number');
      return;
    }

    if (mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter valid 10-digit mobile number');
      return;
    }

    setOtpLoading(true);
    try {
      console.log('📱 Sending OTP to:', mobileNumber);
      
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        mobile: mobileNumber,
      });

      console.log('✅ OTP sent response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'OTP Sent',
          `OTP has been sent to ${mobileNumber}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('OtpVerification', { 
                mobile: mobileNumber,
                // In development, you might want to pass the OTP for testing
                // otp: response.data.otp 
              })
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ ADD THIS MISSING FUNCTION - Handle Forgot Password
  const handleForgotPassword = () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    
    Alert.alert(
      'Forgot Password',
      'Would you like to reset your password via OTP?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send OTP', 
          onPress: () => {
            // This will use the same OTP flow
            handleSendOTP();
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Icon name="build-circle" size={80} color="#007AFF" />
        <Text style={styles.appName}>Service</Text>
        <Text style={styles.tagline}>Your Local Service Partner</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
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

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={handleForgotPassword}  // ✅ Now this works
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.otpButton}
          onPress={handleSendOTP}  // ✅ Now this works
          disabled={otpLoading}
        >
          {otpLoading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.otpButtonText}>Login with OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  tagline: {
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
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  otpButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  otpButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 16,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;