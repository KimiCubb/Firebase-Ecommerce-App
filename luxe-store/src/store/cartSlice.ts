import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product } from "../types/product";

interface CartState {
  items: CartItem[];
  total: number;
}

// Load initial state from localStorage if available
const loadInitialState = (): CartState => {
  try {
    const savedCart = localStorage.getItem("shopping-cart");
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
  }
  return {
    items: [],
    total: 0,
  };
};

const initialState: CartState = loadInitialState();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(
        (item: CartItem) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1,
        });
      }

      state.total = state.items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item: CartItem) => item.id !== action.payload
      );

      state.total = state.items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item: CartItem) => item.id === action.payload.id
      );

      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i: CartItem) => i.id !== action.payload.id
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }

      state.total = state.items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
