import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // 

  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        setIsAdmin(false);
        setLoading(false); 
        return;
      }

      try {
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsAdmin(res.data.user.role === "admin");
        const admin=res.data.user.role === "admin";
        if (admin) {
            navigate("/admin/profile");
        } else {
            navigate("/users/profile");
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false); 
      }
    };

    checkAdmin();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAdmin(false);
    navigate("/users/login", { replace: true });
  };

 
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAdmin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

