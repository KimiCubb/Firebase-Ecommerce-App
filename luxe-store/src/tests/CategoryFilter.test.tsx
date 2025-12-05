import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import CategoryFilter from "../components/CategoryFilter";
import { store } from "../store";

/**
 * CategoryFilter Component Tests
 * Tests component state management, filtering logic, and user interactions
 * Focuses on independent, deterministic, and focused tests
 */
describe("CategoryFilter Component", () => {
  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    mockOnCategoryChange.mockClear();
  });

  /**
   * Test 1: Component renders all categories correctly
   */
  test("renders all categories as options", () => {
    render(
      <Provider store={store}>
        <CategoryFilter
          selectedCategory=""
          onCategoryChange={mockOnCategoryChange}
        />
      </Provider>
    );

    const expectedCategories = [
      "All",
      "Electronics",
      "Jewelery",
      "Men's clothing",
      "Women's clothing",
    ];

    expectedCategories.forEach((category) => {
      expect(
        screen.getByRole("option", { name: category })
      ).toBeInTheDocument();
    });
  });

  /**
   * Test 2: Calls onCategoryChange when selection changes
   */
  test("calls onCategoryChange when category is selected", async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <CategoryFilter
          selectedCategory=""
          onCategoryChange={mockOnCategoryChange}
        />
      </Provider>
    );

    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toBeEnabled();

    // Test selecting a category
    const expectedCategories = [
      "All",
      "Electronics",
      "Jewelery",
      "Men's clothing",
      "Women's clothing",
    ];

    for (let i = 1; i < expectedCategories.length; i++) {
      const category = expectedCategories[i];
      await user.selectOptions(selectElement, category.toLowerCase());
      expect(mockOnCategoryChange).toHaveBeenCalled();
    }
  });

  /**
   * Test 3: Renders with correct default value
   */
  test("renders with correct default value", () => {
    render(
      <Provider store={store}>
        <CategoryFilter
          selectedCategory=""
          onCategoryChange={mockOnCategoryChange}
        />
      </Provider>
    );

    const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toBeEnabled();
    expect(selectElement.value).toBe("");
  });

  /**
   * Test 4: Component snapshot test
   */
  test("matches snapshot", () => {
    const { asFragment } = render(
      <Provider store={store}>
        <CategoryFilter
          selectedCategory=""
          onCategoryChange={mockOnCategoryChange}
        />
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
