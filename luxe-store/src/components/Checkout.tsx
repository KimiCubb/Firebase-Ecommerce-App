import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext"; // Add this
import { clearCart } from "../store/cartSlice";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Add this
import { db } from "../firebaseConfig"; // Add this
import type { RootState } from "../store";
import ProductImage from "./ProductImage";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

interface CheckoutProps {
  onSuccess: () => void;
  onCancel: () => void; // Changed from onBack to onCancel to match App.tsx
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useAuth(); // Add this
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    if (!user) {
      addToast("You must be logged in to place an order", "error");
      return;
    }

    setIsProcessing(true);
    addToast("Processing your order...", "info", 3000);

    try {
      const orderData = {
        userId: user.uid,
        items: cartItems.map((item) => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
        })),
        subtotal,
        tax,
        total,
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        status: "processing",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      dispatch(clearCart());
      setIsProcessing(false);
      addToast("Order placed successfully! 🎉", "success", 4000);
      onSuccess();
    } catch (error) {
      console.error("Error placing order:", error);
      setIsProcessing(false);
      addToast("Failed to place order. Please try again.", "error");
    }
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container my-5">
      <div className="row g-4">
        {/* Checkout Form */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-dark mb-4">
                <i className="bi bi-credit-card me-2"></i>
                Checkout Information
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label
                      htmlFor="firstName"
                      className="form-label text-dark fw-bold"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.firstName ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName}</div>
                    )}
                  </div>

                  <div className="col-sm-6">
                    <label
                      htmlFor="lastName"
                      className="form-label text-dark fw-bold"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.lastName ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName}</div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="form-label text-dark fw-bold"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label
                    htmlFor="address"
                    className="form-label text-dark fw-bold"
                  >
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`form-control ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your street address"
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>

                {/* City and ZIP */}
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <label
                      htmlFor="city"
                      className="form-label text-dark fw-bold"
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.city ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your city"
                    />
                    {errors.city && (
                      <div className="invalid-feedback">{errors.city}</div>
                    )}
                  </div>

                  <div className="col-sm-6">
                    <label
                      htmlFor="zipCode"
                      className="form-label text-dark fw-bold"
                    >
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`form-control ${
                        errors.zipCode ? "is-invalid" : ""
                      }`}
                      placeholder="Enter ZIP code"
                    />
                    {errors.zipCode && (
                      <div className="invalid-feedback">{errors.zipCode}</div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline-secondary"
                    disabled={isProcessing}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn btn-success flex-fill"
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Complete Purchase - ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-5">
          <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Order Summary
              </h5>
            </div>
            <div className="card-body">
              <div
                className="mb-3"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex align-items-center gap-3 py-2 border-bottom"
                  >
                    <div
                      className="bg-light rounded d-flex align-items-center justify-content-center p-2"
                      style={{ minWidth: "60px", height: "60px" }}
                    >
                      <ProductImage
                        src={item.image}
                        alt={item.title}
                        category={item.category}
                        className="img-fluid"
                        width={60}
                        height={60}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div className="flex-fill">
                      <h6 className="small fw-medium text-dark mb-1">
                        {item.title.substring(0, 40)}...
                      </h6>
                      <p className="text-muted small mb-0">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-dark fw-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-dark">
                    Subtotal ({itemCount} items):
                  </span>
                  <span className="text-dark fw-bold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-dark">Tax (8%):</span>
                  <span className="text-dark fw-bold">${tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-dark">Shipping:</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>
                <div className="d-flex justify-content-between fs-5 fw-bold text-dark pt-2 border-top">
                  <span>Total:</span>
                  <span className="text-success">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-dark d-block mb-2">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  <strong>Secure Checkout</strong>
                </small>
                <small className="text-muted">
                  This is a demo checkout. No real payment will be processed.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
