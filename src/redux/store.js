// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { counterReducer } from './slices/slice';

export const store = configureStore({
  reducer: {
    counter: counterReducer, // Add your slices here
  },
});

export default store;
