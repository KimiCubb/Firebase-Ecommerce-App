import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import ProductCard from "../components/ProductCard";
import { createAppStore, type AppStore } from "../store";
import { ToastProvider } from "../contexts/ToastContext";
import type { Product } from "../types/product";

/**
 * Cart Integration Tests
 * Tests the complete flow of adding products to cart and verifying Redux state updates
 * Simulates realistic user interactions across multiple components
 */
describe("Cart Integration: Adding Products and Updating Cart", () => {
  let store: AppStore;

  const mockProduct1: Product = {
    id: "1",
    title: "Premium Headphones",
    price: 149.99,
    description: "High-quality wireless headphones",
    category: "electronics",
    image: "https://example.com/headphones.jpg",
    rating: {
      rate: 4.5,
      count: 250,
    },
  };

  const mockProduct2: Product = {
    id: "2",
    title: "USB-C Cable",
    price: 19.99,
    description: "Durable USB-C charging cable",
    category: "electronics",
    image: "https://example.com/cable.jpg",
    rating: {
      rate: 4.8,
      count: 1200,
    },
  };

  beforeEach(() => {
    // Create a fresh store for each test
    store = createAppStore();
    // Clear both storages
    sessionStorage.clear();
    localStorage.clear();
    jest.clearAllMocks();
  });

  /**
   * Test 1: Persists cart to localStorage after adding product
   */
  test("persists cart to localStorage after adding product", async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={mockProduct1} />
        </ToastProvider>
      </Provider>
    );

    // Use stable data-testid selector
    const addButton = screen.getByTestId("product-1-add-to-cart");
    await user.click(addButton);

    // Wait for localStorage to be updated
    await waitFor(() => {
      const cartData = localStorage.getItem("shopping-cart");
      expect(cartData).toBeTruthy();

      const parsedCart = JSON.parse(cartData!);
      expect(parsedCart.items).toHaveLength(1);
      expect(parsedCart.items[0].id).toBe("1");
      expect(parsedCart.items[0].quantity).toBe(1);
      expect(parsedCart.total).toBeCloseTo(149.99, 2);
    });
  });

  /**
   * Test 2: Updates quantity when adding same product multiple times
   */
  test("updates quantity when adding same product multiple times", async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={mockProduct1} />
        </ToastProvider>
      </Provider>
    );

    const addButton = screen.getByTestId("product-1-add-to-cart");

    // Add product 3 times
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    // Wait for quantity to be updated
    await waitFor(() => {
      const state = store.getState();
      expect(state.cart.items).toHaveLength(1);
      expect(state.cart.items[0].quantity).toBe(3);
      expect(state.cart.total).toBeCloseTo(449.97, 2);
    });
  });

  /**
   * Test 3: Handles multiple different products in cart
   */
  test("handles multiple different products in cart", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={mockProduct1} />
        </ToastProvider>
      </Provider>
    );

    const addButton1 = screen.getByTestId("product-1-add-to-cart");
    await user.click(addButton1);

    // Wait for first product to be added
    await waitFor(() => {
      const state = store.getState();
      expect(state.cart.items).toHaveLength(1);
    });

    // Render second product
    rerender(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={mockProduct2} />
        </ToastProvider>
      </Provider>
    );

    const addButton2 = screen.getByTestId("product-2-add-to-cart");
    await user.click(addButton2);

    // Wait for both products to be in cart
    await waitFor(() => {
      const state = store.getState();
      expect(state.cart.items).toHaveLength(2);
      expect(state.cart.total).toBeCloseTo(169.98, 2);
    });
  });

  /**
   * Test 4: Correctly calculates total price
   */
  test("correctly calculates total price for cart", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={mockProduct1} />
        </ToastProvider>
      </Provider>
    );

    await user.click(screen.getByTestId("product-1-add-to-cart"));

    await waitFor(() => {
      expect(store.getState().cart.total).toBeCloseTo(149.99, 2);
    });

    rerender(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={mockProduct2} />
        </ToastProvider>
      </Provider>
    );

    await user.click(screen.getByTestId("product-2-add-to-cart"));

    await waitFor(() => {
      expect(store.getState().cart.total).toBeCloseTo(169.98, 2);
    });
  });

  /**
   * Test 5: Persists cart to localStorage on each update
   */
  test("persists cart state to localStorage after each action", async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={mockProduct1} />
        </ToastProvider>
      </Provider>
    );

    await user.click(screen.getByTestId("product-1-add-to-cart"));

    await waitFor(() => {
      const saved = localStorage.getItem("shopping-cart");
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.items[0].quantity).toBe(1);
    });
  });
});
