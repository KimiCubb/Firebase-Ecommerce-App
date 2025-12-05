import { useState } from "react";
import { useDispatch } from "react-redux";
import ProductImage from "./ProductImage";
import { addToCart } from "../store/cartSlice";
import { useToast } from "../contexts/ToastContext";
import { renderStars } from "../utils/renderStars";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const ratingCount = product.rating?.count || 0;

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    addToast("Item added to cart!", "success", 2000);
  };

  const rating = product.rating?.rate || 0;
  const hasRating = rating > 0;

  return (
    <div
      className={`flip-card ${isFlipped ? "flipped" : ""}`}
      style={{ height: "450px" }}
    >
      <div className="flip-card-inner">
        {/* Front Side */}
        <div className="flip-card-front">
          <div className="card h-100 shadow-sm border-0 hover-shadow">
            <div
              className="card-img-top bg-light product-image-container p-3"
              style={{ height: "200px" }}
            >
              <ProductImage
                src={product.image}
                alt={product.title}
                category={product.category}
                className="img-fluid"
                style={{
                  maxHeight: "170px",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
                width={300}
                height={300}
              />
            </div>

            <div className="card-body d-flex flex-column">
              <div className="text-brand-primary text-uppercase fw-bold small mb-2">
                {product.category}
              </div>

              <h5
                className="card-title"
                style={{
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  minHeight: "auto",
                }}
              >
                {product.title}
              </h5>

              {hasRating ? (
                <div className="mb-2">
                  <div className="d-flex align-items-center mb-1">
                    {renderStars(rating)}
                  </div>
                  <small className="text-muted">
                    {rating} ({ratingCount} reviews)
                  </small>
                </div>
              ) : (
                <small className="text-muted mb-2">No ratings yet</small>
              )}

              <div className="mt-auto">
                <div className="h5 text-success fw-bold mb-2">
                  ${product.price.toFixed(2)}
                </div>
                <div className="d-grid gap-1">
                  <button
                    data-testid={`product-${product.id}-add-to-cart`}
                    className="btn btn-brand-primary btn-sm"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                  <button
                    data-testid={`product-${product.id}-more-details`}
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    More Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back">
          <div className="card h-100 shadow-sm border-0 d-flex flex-column">
            <div className="card-header bg-brand-primary text-white py-2">
              <h6
                className="card-title mb-0 fw-semibold small"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  overflow: "hidden",
                }}
              >
                {product.title}
              </h6>
              <small
                className="opacity-75 text-uppercase"
                style={{ fontSize: "0.7rem" }}
              >
                {product.category}
              </small>
            </div>

            <div className="card-body d-flex flex-column p-3 flex-fill">
              <div className="mb-2 flex-fill">
                <h6 className="fw-bold text-brand-primary mb-1 small">
                  Description:
                </h6>
                <p
                  className="small text-muted lh-sm mb-2"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 6,
                    overflow: "hidden",
                    fontSize: "0.8rem",
                  }}
                >
                  {product.description}
                </p>
              </div>

              <div className="mb-2">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div className="d-flex align-items-center">
                    {hasRating ? renderStars(rating) : <span>No ratings</span>}
                  </div>
                  <div className="h5 text-success fw-bold mb-0">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                {hasRating && (
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {rating}/5 ({ratingCount} reviews)
                  </small>
                )}
              </div>

              <div className="mt-auto">
                <div className="d-grid gap-1">
                  <button
                    data-testid={`product-${product.id}-add-to-cart-back`}
                    className="btn btn-brand-primary btn-sm"
                    onClick={handleAddToCart}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    data-testid={`product-${product.id}-back`}
                    className="btn btn-outline-secondary btn-sm py-1"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
