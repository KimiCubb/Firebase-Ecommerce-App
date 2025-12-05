import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import ProductCard from "../components/ProductCard";
import { store } from "../store";
import { ToastProvider } from "../contexts/ToastContext";
import type { Product } from "../types/product";

/**
 * ProductCard Component Tests
 * Tests the flip card functionality, product data rendering, and user interactions
 */
describe("ProductCard Component", () => {
  const mockProduct: Product = {
    id: "1",
    title: "Test Product",
    price: 99.99,
    description: "This is a test product description",
    category: "electronics",
    image: "https://example.com/image.jpg",
    rating: {
      rate: 4.5,
      count: 100,
    },
  };

  const renderProductCard = (product: Product = mockProduct) => {
    return render(
      <Provider store={store}>
        <ToastProvider>
          <ProductCard product={product} />
        </ToastProvider>
      </Provider>
    );
  };

  test("renders product card with correct title and price", () => {
    renderProductCard();

    const titleElements = screen.getAllByText("Test Product");
    expect(titleElements[0]).toBeInTheDocument();

    const priceElements = screen.getAllByText(/\$99\.99/);
    expect(priceElements[0]).toBeInTheDocument();

    const categoryElements = screen.getAllByText("electronics");
    expect(categoryElements[0]).toBeInTheDocument();
  });

  test("displays product description on flip card back", () => {
    renderProductCard();
    expect(
      screen.getByText("This is a test product description")
    ).toBeInTheDocument();
  });

  test("renders rating stars based on product rating", () => {
    renderProductCard();

    const fullStars = screen.getAllByText("★");
    expect(fullStars.length).toBeGreaterThanOrEqual(4);

    const emptyStars = screen.getAllByText("☆");
    expect(emptyStars.length).toBeGreaterThanOrEqual(1);
  });

  test("renders Add to Cart button", () => {
    renderProductCard();

    const buttons = screen.getAllByRole("button", { name: /add to cart/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(buttons[0]).toBeInTheDocument();
  });

  test("renders More Details button", () => {
    renderProductCard();
    const moreDetailsButton = screen.getByRole("button", {
      name: /more details/i,
    });
    expect(moreDetailsButton).toBeInTheDocument();
  });

  test("toggles flip card when More Details button is clicked", async () => {
    const user = userEvent.setup();
    renderProductCard();

    const flipButton = screen.getByRole("button", { name: /more details/i });
    await user.click(flipButton);

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  test("handles products with zero rating", () => {
    const noRatingProduct: Product = {
      ...mockProduct,
      id: "4",
      rating: { rate: 0, count: 0 },
    };

    renderProductCard(noRatingProduct);

    const titleElements = screen.getAllByText("Test Product");
    expect(titleElements[0]).toBeInTheDocument();
  });

  test("handles products with maximum rating", () => {
    const highRatedProduct: Product = {
      ...mockProduct,
      id: "5",
      rating: { rate: 5.0, count: 500 },
    };

    renderProductCard(highRatedProduct);

    // Rating displays as "5" (not "5.0") and appears in "5/5" format
    const ratingElements = screen.getAllByText(/5\/5/);
    expect(ratingElements[0]).toBeInTheDocument();
  });

  test("handles multiple clicks on Add to Cart button", async () => {
    const user = userEvent.setup();
    renderProductCard();

    const addButtons = screen.getAllByRole("button", { name: /add to cart/i });
    const addButton = addButtons[0];

    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(addButton).toBeInTheDocument();
  });

  test("handles products with very long titles", () => {
    const longTitleProduct: Product = {
      ...mockProduct,
      id: "6",
      title:
        "This is an extremely long product title that should still render correctly in the card without breaking the layout",
    };

    renderProductCard(longTitleProduct);

    const titleElements = screen.getAllByText(longTitleProduct.title);
    expect(titleElements.length).toBeGreaterThan(0);
  });
});
