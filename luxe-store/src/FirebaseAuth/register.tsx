import React, { useState, FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "../firebaseConfig";
import { useToast } from "../contexts/ToastContext";
import "../login.css"; // Reuse the same styles

interface RegisterProps {
  onNavigateToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { addToast } = useToast();

  const validateForm = (): boolean => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const getErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered",
      "auth/invalid-email": "Invalid email format",
      "auth/weak-password": "Password is too weak",
    };
    return messages[code] || "Registration failed. Please try again.";
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Show success message
      addToast("Account created successfully! Please login.", "success");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorMessage = getErrorMessage(firebaseError.code);
      setError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container bg-brand-primary text-white d-flex justify-content-center align-items-center min-vh-100"
      style={{ width: "100vw" }}
    >
      <form
        onSubmit={handleRegister}
        className="login-form d-flex flex-column gap-3"
        style={{
          maxWidth: 400,
          width: "100%",
          padding: 32,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h2 className="text-center mb-3">Create Account</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label text-white">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="form-control text-dark bg-white"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label text-white">
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-control text-dark bg-white"
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#666",
              }}
              tabIndex={-1}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label text-white">
            Confirm Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="form-control text-dark bg-white"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#666",
              }}
              tabIndex={-1}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-light w-100 text-brand-primary fw-bold"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Creating Account...
            </>
          ) : (
            "Register"
          )}
        </button>

        <div className="text-center text-white mt-3">
          <p className="mb-2">Already have an account?</p>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="btn btn-sm btn-outline-light"
            style={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            Go to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
