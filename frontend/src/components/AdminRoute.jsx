// AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:3000/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data.user.role === "admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
      }

      setLoading(false);
    };

    checkAdmin();
  }, [token]);

  if (loading) return <p>Loading...</p>;

  if (!token) return <Navigate to="/users/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
