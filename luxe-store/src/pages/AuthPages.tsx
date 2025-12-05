import { useNavigate } from "react-router-dom";
import { Suspense, lazy } from "react";

const Login = lazy(() => import("../login"));
const Register = lazy(() => import("../FirebaseAuth/register"));

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Login onNavigateToRegister={() => navigate("/register")} />
    </Suspense>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Register onNavigateToLogin={() => navigate("/login")} />
    </Suspense>
  );
}
