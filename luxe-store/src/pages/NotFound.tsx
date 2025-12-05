import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5 text-center">
      <h1>404 - Page Not Found</h1>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")} className="btn btn-primary">
        Go Home
      </button>
    </div>
  );
}
