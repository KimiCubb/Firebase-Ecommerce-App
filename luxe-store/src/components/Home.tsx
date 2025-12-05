import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

import ProductCard from "./ProductCard";
import CategoryFilter from "./CategoryFilter";
import type { Product } from "../types/product";

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let productsQuery;

        if (selectedCategory) {
          productsQuery = query(
            collection(db, "products"),
            where("category", "==", selectedCategory)
          );
        } else {
          productsQuery = collection(db, "products");
        }

        const querySnapshot = await getDocs(productsQuery);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="container my-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary mb-4" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="fs-5 text-muted">
            {selectedCategory
              ? `Loading ${selectedCategory} products...`
              : "Loading products..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center p-5"
          style={{ minHeight: "400px" }}
        >
          <h2 className="display-5 text-danger mb-4">
            Oops! Something went wrong
          </h2>
          <p className="fs-6 text-muted mb-4">
            {error}. Please try again later.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Store Name Header */}
      <div className="text-center mb-5">
        <h1 className="display-1 fw-bold text-brand-primary mb-3">
          LuxeStore ✨
        </h1>
        <p className="fs-4 text-muted">Premium Shopping Experience</p>
      </div>

      {/* Hero Banner */}
      <div className="text-center mb-5 bg-brand-primary text-white rounded-3 py-5 px-4 shadow-lg">
        <h2 className="display-4 fw-bold mb-3">Discover Amazing Products</h2>
        <p className="fs-5 opacity-75">Quality items at unbeatable prices</p>
      </div>

      <main>
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between mb-4">
          <h2 className="display-5 fw-bold text-brand-primary mb-3 mb-lg-0">
            {selectedCategory
              ? `${
                  selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)
                } Products`
              : "Featured Products"}
          </h2>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {products && products.length > 0 ? (
          <div className="row g-4 mb-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="display-1 text-primary mb-4 animate-float">✨</div>
            <p className="fs-4 text-muted mb-2">No products found</p>
            <p className="text-muted">
              {selectedCategory
                ? `No products available in the "${selectedCategory}" category.`
                : "No products available at the moment."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
