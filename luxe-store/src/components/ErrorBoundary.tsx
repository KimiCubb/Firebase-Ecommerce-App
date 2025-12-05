import React, { ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and display errors gracefully
 * Prevents the entire app from crashing on component errors
 */
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="alert alert-danger" role="alert">
                <h2 className="alert-heading">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Oops! Something went wrong
                </h2>
                <p>
                  We're sorry, but something unexpected happened. The error has
                  been logged and our team will be notified.
                </p>
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="mt-3 p-3 bg-dark text-light rounded">
                    <strong>Error Details (Development Only):</strong>
                    <pre className="mb-0" style={{ fontSize: "0.85rem" }}>
                      {this.state.error.toString()}
                    </pre>
                  </div>
                )}
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
