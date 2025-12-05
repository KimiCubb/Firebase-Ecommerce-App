import React from "react";

interface CheckoutSuccessProps {
  onContinueShopping: () => void;
}

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  onContinueShopping,
}) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              {/* Success Icon */}
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success display-1"></i>
              </div>

              {/* Success Message */}
              <h1 className="text-dark mb-3">Order Placed Successfully! 🎉</h1>
              <p className="text-muted mb-4 fs-5">
                Thank you for your purchase. Your order has been confirmed and
                will be processed shortly.
              </p>

              {/* Order Details */}
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                <strong>What's Next?</strong>
                <p className="mb-0 mt-2 small">
                  You'll receive an email confirmation shortly with your order
                  details. You can track your order status in the Order History
                  section.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <button
                  className="btn btn-primary btn-lg px-4"
                  onClick={onContinueShopping}
                >
                  <i className="bi bi-shop me-2"></i>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
