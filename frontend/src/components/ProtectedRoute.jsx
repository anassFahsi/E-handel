import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { authenticated } = useContext(AuthContext);

  if (!authenticated) {
    return <Navigate to="/users/login" replace />;
  }

  return children;
}