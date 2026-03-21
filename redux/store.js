import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// import bookingReducer from './slices/bookingSlice';
// import providerReducer from './slices/providerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // booking: bookingReducer,
    // provider: providerReducer,
  },
});