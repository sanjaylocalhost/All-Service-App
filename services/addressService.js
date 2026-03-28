// services/addressService.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../constants/config";

const API_URL = `${API_BASE_URL}/addresses`;

// Get auth token from AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Axios instance with auth header
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const addressService = {
  // Create new address
  createAddress: async (addressData) => {
    try {
      const response = await axiosInstance.post('/', addressData);
      return response.data;
    } catch (error) {
      console.error('Create address error:', error);
      throw error.response?.data || { message: error.message };
    }
  },

  // Get all addresses
  getAddresses: async () => {
    try {
      const response = await axiosInstance.get('/');
      return response.data;
    } catch (error) {
      console.error('Get addresses error:', error);
      throw error.response?.data || { message: error.message };
    }
  },

  // Get single address
  getAddressById: async (id) => {
    try {
      const response = await axiosInstance.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Update address
  updateAddress: async (id, addressData) => {
    try {
      const response = await axiosInstance.put(`/${id}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Delete address
  deleteAddress: async (id) => {
    try {
      const response = await axiosInstance.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Set default address
  setDefaultAddress: async (id) => {
    try {
      const response = await axiosInstance.put(`/${id}/default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  // Get nearby addresses
  getNearbyAddresses: async (lat, lng, radius = 5000) => {
    try {
      const response = await axiosInstance.get(`/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};