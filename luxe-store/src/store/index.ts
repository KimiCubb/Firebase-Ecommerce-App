import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

// Factory function to create a fresh store instance (useful for tests)
export function createAppStore(preloadedState = {}) {
  const storeInstance = configureStore({
    reducer: {
      cart: cartReducer,
    },
    preloadedState,
  });

  // Persist cart state to localStorage on every change
  storeInstance.subscribe(() => {
    const state = storeInstance.getState();
    localStorage.setItem("shopping-cart", JSON.stringify(state.cart));
  });

  return storeInstance;
}

// Default singleton export for app
export const store = createAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof createAppStore>;
