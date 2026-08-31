import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/redux/api/apiSlice';
import authReducer from '@/redux/slice/authSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
