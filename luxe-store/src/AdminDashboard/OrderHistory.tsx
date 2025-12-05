import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}

interface OrderHistoryProps {
  onGoHome?: () => void; // Add this prop
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onGoHome }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [indexBuilding, setIndexBuilding] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError("Please log in to view your orders");
        setLoading(false);
        return;
      }

      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        }) as Order[];

        setOrders(ordersData);
      } catch (error) {
        const err = error as any;

        // ✅ Handle different error types
        if (err.message?.includes("Permission denied")) {
          setError("You don't have permission to view these orders");
        } else if (err.message?.includes("index")) {
          setIndexBuilding(true);
          setError(
            "Database is building indexes. Please try again in 1-2 minutes."
          );
        } else if (err.message?.includes("CORS")) {
          setError("Connection error. Please check your internet connection.");
        } else {
          setError(err.message || "Failed to load orders");
        }

        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusBadgeClass = (status: Order["status"]) => {
    const classes = {
      pending: "bg-warning text-dark",
      processing: "bg-info text-white",
      shipped: "bg-primary text-white",
      delivered: "bg-success text-white",
      cancelled: "bg-danger text-white",
    };
    return classes[status] || "bg-secondary text-white";
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      // Fallback if no handler provided
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading your orders...</p>
      </div>
    );
  }

  if (indexBuilding) {
    return (
      <div className="alert alert-warning">
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>
            <h5 className="alert-heading mb-1">
              <i className="bi bi-info-circle me-2"></i>
              Database Index Building
            </h5>
            <p className="mb-2">
              Firebase is creating a database index for your orders. This is a
              one-time process that takes 1-2 minutes.
            </p>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-bag-x display-1 text-muted"></i>
        <h3 className="text-dark mt-3">No Orders Yet</h3>
        <p className="text-muted mb-4">
          You haven't placed any orders yet. Start shopping to see your orders
          here!
        </p>
        <button className="btn btn-primary" onClick={handleGoHome}>
          <i className="bi bi-shop me-2"></i>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Order Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-bag-check display-4 mb-2"></i>
              <h3 className="mb-0">{orders.length}</h3>
              <p className="mb-0 small">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-currency-dollar display-4 mb-2"></i>
              <h3 className="mb-0">
                $
                {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </h3>
              <p className="mb-0 small">Total Spent</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-warning text-dark">
            <div className="card-body text-center">
              <i className="bi bi-clock-history display-4 mb-2"></i>
              <h3 className="mb-0">
                {
                  orders.filter(
                    (o) => o.status === "processing" || o.status === "pending"
                  ).length
                }
              </h3>
              <p className="mb-0 small">Pending Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="row g-4">
        {orders.map((order) => (
          <div key={order.id} className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <div className="row align-items-center">
                  <div className="col-lg-3 col-6 mb-2 mb-lg-0">
                    <small className="text-muted d-block">Order ID</small>
                    <p className="mb-0 text-dark fw-bold">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="col-lg-3 col-6 mb-2 mb-lg-0">
                    <small className="text-muted d-block">Date</small>
                    <p className="mb-0 text-dark">
                      {order.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="col-lg-3 col-6">
                    <small className="text-muted d-block">Total</small>
                    <p className="mb-0 text-success fw-bold fs-5">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="col-lg-3 col-6 text-lg-end">
                    <small className="text-muted d-block">Status</small>
                    <span
                      className={`badge ${getStatusBadgeClass(order.status)}`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Order Items */}
                <h6 className="text-dark mb-3">
                  <i className="bi bi-box-seam me-2"></i>
                  Items ({order.items.length})
                </h6>
                <div className="mb-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center gap-3 mb-2 pb-2 border-bottom"
                    >
                      <div
                        className="bg-light rounded d-flex align-items-center justify-content-center"
                        style={{
                          minWidth: "60px",
                          height: "60px",
                          padding: "5px",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div className="flex-fill">
                        <p className="mb-1 text-dark fw-medium">{item.title}</p>
                        <small className="text-muted">
                          <span className="badge bg-secondary me-2">
                            {item.category}
                          </span>
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </small>
                      </div>
                      <div className="text-dark fw-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Info */}
                <div className="row mt-3 pt-3 border-top">
                  <div className="col-md-6">
                    <h6 className="text-dark mb-2">
                      <i className="bi bi-truck me-2"></i>
                      Shipping Address
                    </h6>
                    <p className="text-muted mb-0 small">
                      <strong className="text-dark">
                        {order.shippingInfo.firstName}{" "}
                        {order.shippingInfo.lastName}
                      </strong>
                      <br />
                      {order.shippingInfo.address}
                      <br />
                      {order.shippingInfo.city}, {order.shippingInfo.zipCode}
                      <br />
                      {order.shippingInfo.email}
                    </p>
                  </div>

                  <div className="col-md-6 mt-3 mt-md-0">
                    <h6 className="text-dark mb-2">
                      <i className="bi bi-receipt me-2"></i>
                      Order Summary
                    </h6>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Subtotal:</span>
                        <span className="text-dark fw-bold">
                          ${order.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Tax (8%):</span>
                        <span className="text-dark fw-bold">
                          ${order.tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Shipping:</span>
                        <span className="text-success fw-bold">FREE</span>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top">
                        <span className="text-dark fw-bold">Total:</span>
                        <span className="text-success fw-bold fs-5">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
