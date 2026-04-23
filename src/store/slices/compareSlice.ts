import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';

interface CompareState {
  items: Product[];
}

const initialState: CompareState = {
  items: [],
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare(state, action: PayloadAction<Product>) {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists && state.items.length < 4) {
        state.items.push(action.payload);
      }
    },
    removeFromCompare(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCompare(state) {
      state.items = [];
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
