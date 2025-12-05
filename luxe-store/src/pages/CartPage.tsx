import { useNavigate } from "react-router-dom";
import ShoppingCart from "../components/ShoppingCart";

export default function CartPage() {
  const navigate = useNavigate();

  return (
    <ShoppingCart
      onCheckout={() => navigate("/checkout")}
      onContinueShopping={() => navigate("/")}
    />
  );
}
