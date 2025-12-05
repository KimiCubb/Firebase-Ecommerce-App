import { useNavigate } from "react-router-dom";
import CheckoutSuccess from "../components/CheckoutSuccess";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  return <CheckoutSuccess onContinueShopping={() => navigate("/")} />;
}
