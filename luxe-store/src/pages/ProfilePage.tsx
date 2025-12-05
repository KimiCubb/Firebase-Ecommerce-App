import { useNavigate } from "react-router-dom";
import UserProfile from "../AdminDashboard/UserProfile";

export default function ProfilePage() {
  const navigate = useNavigate();

  return <UserProfile onGoHome={() => navigate("/")} />;
}
