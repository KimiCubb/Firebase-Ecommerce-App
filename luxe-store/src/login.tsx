import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "./firebaseConfig";
import { useAuth } from "./contexts/AuthContext";
import { useToast } from "./contexts/ToastContext";

interface LoginProps {
  onNavigateToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const getErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      "auth/user-not-found": "Email not found. Please register first.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-email": "Invalid email format",
      "auth/user-disabled": "This account has been disabled",
      "auth/too-many-requests": "Too many login attempts. Please try later.",
    };
    return messages[code] || "Login failed. Please try again.";
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      addToast("Login successful!", "success");
      setEmail("");
      setPassword("");
      // Navigation handled by App.tsx auth check
    } catch (err) {
      const firebaseError = err as FirebaseError;
      const errorMessage = getErrorMessage(firebaseError.code);
      setError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Logged out successfully", "success");
    } catch (err) {
      const firebaseError = err as FirebaseError;
      addToast("Logout failed", "error");
      console.error("Logout error:", firebaseError.message);
    }
  };

  // Only show if user is NOT logged in
  if (user) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <p className="mb-3">Welcome, {user.email}</p>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Login form for unauthenticated users
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Login</h3>
              <form onSubmit={handleLogin}>
                <div className="form-group mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        color: "#666",
                        opacity: loading ? 0.5 : 1,
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                  {error.includes("Email not found") && (
                    <>
                      <br />
                      <small>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={onNavigateToRegister}
                          className="btn btn-link p-0"
                          style={{ textDecoration: "underline" }}
                        >
                          Create one here
                        </button>
                      </small>
                    </>
                  )}
                </div>
              )}
              <div className="text-center mt-3">
                <p className="text-muted">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="btn btn-link p-0"
                    style={{ textDecoration: "underline" }}
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
