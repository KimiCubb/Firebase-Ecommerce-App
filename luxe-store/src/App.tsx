import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { useToast } from "./contexts/ToastContext";
import Header from "./components/Header";
import ToastContainer from "./components/ToastContainer";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";

// Import page components
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { toasts, removeToast } = useToast();

  if (loading) {
    return <LoadingFallback />;
  }

  // If not authenticated, show only auth routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated, show all routes
  return (
    <>
      <Header />
      <main>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path="/checkout-success"
                element={<CheckoutSuccessPage />}
              />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
