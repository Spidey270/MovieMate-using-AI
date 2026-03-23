import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/home" />;
  }

  return children;
}
