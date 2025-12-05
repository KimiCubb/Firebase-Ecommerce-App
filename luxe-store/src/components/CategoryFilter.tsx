import React from "react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory = "",
  onCategoryChange = () => {},
}) => {
  const categories = [
    "All",
    "Electronics",
    "Jewelery",
    "Men's clothing",
    "Women's clothing",
  ];

  return (
    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4">
      <label
        className="fs-6 fw-medium text-brand-primary text-nowrap"
        htmlFor="category-select"
      >
        Filter by Category:
      </label>
      <select
        id="category-select"
        className="form-select shadow-sm"
        style={{ minWidth: "200px" }}
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {categories.map((category) => (
          <option
            key={category}
            value={category === "All" ? "" : category.toLowerCase()}
          >
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
