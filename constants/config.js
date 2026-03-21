import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
  android: 'http://192.168.1.47:4000/api',  // Use your computer's IP
  ios: 'http://localhost:4000/api',           // iOS simulator
  default: 'http://localhost:4000/api',       // Fallback
});


export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

export const RAZORPAY_KEY = 'YOUR_RAZORPAY_KEY';

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5856D6',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
};