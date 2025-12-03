// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { counterReducer } from './slices/slice';
import { createWrapper } from 'next-redux-wrapper';

export const store = configureStore({
  reducer: {
    counter: counterReducer, // Add your slices here
  },
});

// export default store;
export const wrapper = createWrapper(store); // for ssr if needed