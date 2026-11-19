import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { authenticated, isAdmin } = useContext(AuthContext);

  if (!authenticated) {
    return <Navigate to="/users/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

