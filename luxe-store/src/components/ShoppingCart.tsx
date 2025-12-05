import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "../contexts/ToastContext";
import { removeFromCart, updateQuantity, clearCart } from "../store/cartSlice";
import type { RootState } from "../store";

interface ShoppingCartProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  onCheckout,
  onContinueShopping,
}) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
    addToast("Item removed from cart", "info");
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(id);
      return;
    }
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      dispatch(clearCart());
      addToast("Cart cleared", "info");
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      addToast("Your cart is empty", "warning");
      return;
    }
    onCheckout(); // This should call the function passed from App.tsx
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5">
        <div className="text-center py-5">
          <i className="bi bi-cart-x display-1 text-muted"></i>
          <h2 className="text-dark mt-4">Your Cart is Empty</h2>
          <p className="text-muted mb-4">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={onContinueShopping}
          >
            <i className="bi bi-shop me-2"></i>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-dark mb-3">
            <i className="bi bi-cart3 me-2"></i>
            Shopping Cart
          </h2>
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-primary fs-6">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </span>
            {cartItems.length > 0 && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleClearCart}
              >
                <i className="bi bi-trash me-1"></i>
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border-bottom p-3 p-md-4 hover-bg-light"
                >
                  <div className="row align-items-center">
                    {/* Product Image */}
                    <div className="col-md-2 col-3 mb-3 mb-md-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="img-fluid rounded"
                        style={{
                          maxHeight: "100px",
                          objectFit: "contain",
                          backgroundColor: "#f8f9fa",
                          padding: "5px",
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="col-md-4 col-9 mb-3 mb-md-0">
                      <span className="badge bg-secondary mb-2">
                        {item.category}
                      </span>
                      <h6 className="mb-2 text-dark fw-bold">{item.title}</h6>
                      <p className="text-muted small mb-0 d-none d-md-block">
                        {item.description.substring(0, 80)}...
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-md-3 col-6 mb-3 mb-md-0">
                      <label className="form-label text-dark small fw-bold">
                        Quantity
                      </label>
                      <div className="input-group input-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <input
                          type="number"
                          className="form-control text-center fw-bold"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                          style={{ maxWidth: "60px" }}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="col-md-3 col-6 text-md-end">
                      <div className="mb-2">
                        <div className="text-muted small">Price</div>
                        <div className="fw-bold text-success fs-5">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <small className="text-muted">
                          ${item.price.toFixed(2)} each
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger mt-2"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: "20px" }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-receipt me-2"></i>
                Order Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span className="text-dark">Subtotal:</span>
                <span className="fw-bold text-dark">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-dark">Tax (8%):</span>
                <span className="fw-bold text-dark">${tax.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-dark">Shipping:</span>
                <span className="text-success fw-bold">FREE</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="text-dark fw-bold fs-5">Total:</span>
                <span className="text-success fw-bold fs-4">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleCheckout}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Proceed to Checkout
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={onContinueShopping}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 pt-3 border-top">
                <small className="text-muted d-block mb-2">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  Secure Checkout
                </small>
                <small className="text-muted d-block mb-2">
                  <i className="bi bi-truck text-primary me-2"></i>
                  Free Shipping on Orders Over $50
                </small>
                <small className="text-muted d-block">
                  <i className="bi bi-arrow-return-left text-info me-2"></i>
                  30-Day Return Policy
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
