import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import type { RootState } from "../store";

interface HeaderProps {
  currentView?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
      <div className="container">
        <button
          className="navbar-brand btn btn-link text-white text-decoration-none p-0 border-0"
          onClick={() => navigate("/")}
        >
          <i className="bi bi-gem me-2"></i>
          Luxe Store
        </button>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Home */}
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-white ${
                  isActive("/") ? "active" : ""
                }`}
                onClick={() => navigate("/")}
              >
                <i className="bi bi-house-door me-1"></i>
                Home
              </button>
            </li>

            {/* Products Management (Admin only) */}
            {user && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-white ${
                    isActive("/products") ? "active" : ""
                  }`}
                  onClick={() => navigate("/products")}
                >
                  <i className="bi bi-box-seam me-1"></i>
                  Products
                </button>
              </li>
            )}

            {/* Shopping Cart */}
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-white position-relative ${
                  isActive("/cart") ? "active" : ""
                }`}
                onClick={() => navigate("/cart")}
              >
                <i className="bi bi-cart3 me-1"></i>
                Cart
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalItems}
                  </span>
                )}
              </button>
            </li>

            {/* User Profile Dropdown */}
            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-white"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.email?.split("@")[0]}
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="navbarDropdown"
                >
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => navigate("/profile")}
                    >
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate("/profile");
                        // Switch to orders tab after a brief delay
                        setTimeout(() => {
                          const ordersTab = document.querySelector(
                            '[data-tab="orders"]'
                          ) as HTMLButtonElement;
                          ordersTab?.click();
                        }, 100);
                      }}
                    >
                      <i className="bi bi-bag-check me-2"></i>
                      Order History
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm">
                  <i className="bi bi-person-circle me-1"></i>
                  Login
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
