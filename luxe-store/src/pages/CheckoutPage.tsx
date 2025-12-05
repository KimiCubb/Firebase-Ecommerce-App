import { useNavigate } from "react-router-dom";
import Checkout from "../components/Checkout";

export default function CheckoutPage() {
  const navigate = useNavigate();

  return (
    <Checkout
      onSuccess={() => navigate("/checkout-success")}
      onCancel={() => navigate("/cart")}
    />
  );
}
