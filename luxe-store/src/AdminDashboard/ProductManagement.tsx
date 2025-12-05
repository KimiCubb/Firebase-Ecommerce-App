import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { isUserAdmin } from "../utils/adminHelpers";
import ProductImage from "../components/ProductImage";
import type { Product } from "../types/product";

// Placeholder image URL - using a generic product placeholder
const placeholderImage =
  "https://via.placeholder.com/300x300?text=Product+Image";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
  });

  const { addToast } = useToast();
  const { user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      addToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Adding product with data:", formData);
    setLoading(true);
    try {
      console.log("🔥 Firestore db object:", db);
      console.log("📦 Product data to save:", {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: placeholderImage,
        rating: {
          rate: 0,
          count: 0,
        },
      });

      const docRef = await addDoc(collection(db, "products"), {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: placeholderImage,
        rating: {
          rate: 0,
          count: 0,
        },
      });

      console.log("✅ Product added with ID:", docRef.id);
      addToast("Product added successfully!", "success");
      setFormData({ title: "", price: "", description: "", category: "" });
      setShowForm(false);
      await fetchProducts();
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error("❌ Error adding product:", error);
      console.error("❌ Error code:", err?.code);
      console.error("❌ Error message:", err?.message);
      console.error("❌ Full error:", JSON.stringify(error, null, 2));
      addToast(
        `Failed to add product: ${err?.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    console.log("📝 Updating product:", editingId, "with data:", formData);
    setLoading(true);
    try {
      await updateDoc(doc(db, "products", editingId), {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: placeholderImage,
      });

      console.log("✅ Product updated successfully");
      addToast("Product updated successfully!", "success");
      setEditingId(null);
      setFormData({ title: "", price: "", description: "", category: "" });
      setShowForm(false);

      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("❌ Error updating product:", error);
      addToast("Failed to update product", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);

      setProducts((prev) => prev.filter((product) => product.id !== id));
      addToast("Product deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast("Failed to delete product", "error");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      price: "",
      description: "",
      category: "",
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await handleUpdateProduct(e);
    } else {
      await handleAddProduct(e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const categories = [...new Set(products.map((product) => product.category))];

  if (checkingAdmin) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Access Denied</strong>
          <p className="mb-0 mt-2">
            Only administrators can access the product management panel. If you
            believe you should have access, please contact the site
            administrator.
          </p>
        </div>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-3 text-dark">
            <i className="bi bi-box-seam me-2"></i>
            Product Management
          </h2>

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New Product
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={fetchProducts}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>

              <select
                className="form-select"
                style={{ width: "auto" }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <span className="badge bg-primary fs-6">
              {filteredProducts.length} products
            </span>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseForm}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label
                          htmlFor="title"
                          className="form-label text-dark fw-bold"
                        >
                          Product Title *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="price"
                          className="form-label text-dark fw-bold"
                        >
                          Price *
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className="form-control"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleFormChange}
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="category"
                          className="form-label text-dark fw-bold"
                        >
                          Category *
                        </label>
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          required
                        >
                          <option value="">Select a category</option>
                          <option value="electronics">Electronics</option>
                          <option value="jewelery">Jewelery</option>
                          <option value="men's clothing">Men's Clothing</option>
                          <option value="women's clothing">
                            Women's Clothing
                          </option>
                        </select>
                      </div>

                      {/* Image Preview */}
                      {formData.category && (
                        <div className="mb-3">
                          <label className="form-label text-dark fw-bold">
                            Image Preview
                          </label>
                          <div
                            className="border rounded p-2 bg-light"
                            style={{ maxWidth: "200px" }}
                          >
                            <img
                              src={placeholderImage}
                              alt="Preview"
                              className="img-fluid"
                            />
                            <small className="text-muted d-block mt-2">
                              Product placeholder image
                            </small>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label
                          htmlFor="description"
                          className="form-label text-dark fw-bold"
                        >
                          Description *
                        </label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleFormChange}
                          rows={8}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      <i
                        className={`bi ${
                          editingId ? "bi-check-circle" : "bi-plus-circle"
                        } me-2`}
                      ></i>
                      {loading
                        ? "Saving..."
                        : editingId
                        ? "Update Product"
                        : "Create Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="row">
        {filteredProducts.map((product) => (
          <div key={product.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <ProductImage
                src={product.image}
                alt={product.title}
                category={product.category}
                className="card-img-top"
                style={{
                  height: "200px",
                  objectFit: "contain",
                  backgroundColor: "#f8f9fa",
                  padding: "10px",
                }}
              />
              <div className="card-body d-flex flex-column">
                <span className="badge bg-secondary mb-2 align-self-start">
                  {product.category}
                </span>
                <h5 className="card-title text-dark">{product.title}</h5>
                <p className="card-text text-muted small grow">
                  {product.description.substring(0, 100)}...
                </p>
                <div className="mt-auto">
                  <div className="mb-3">
                    <span className="fw-bold text-success fs-4">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary flex-fill"
                      onClick={() => handleEdit(product)}
                    >
                      <i className="bi bi-pencil me-1"></i> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteProduct(product.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-1 text-muted"></i>
          <h3 className="text-muted mt-3">No products found</h3>
          <p className="text-muted">
            {selectedCategory
              ? `No products in "${selectedCategory}" category`
              : "Start by adding your first product"}
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
