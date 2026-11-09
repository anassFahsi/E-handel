import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // 

  useEffect(() => {
   const checkAdmin = async () => {
  try {
    const res = await axios.get(
      "/api/users/profile",
      {
        withCredentials: true
      }
    );

    setAuthenticated(true);

    const admin = res.data.user.role === "admin";

    setIsAdmin(admin);

  } catch {
    setAuthenticated(false);
    setIsAdmin(false);
  } finally {
    setLoading(false);
  }
 };

    checkAdmin();
  }, []);

 const login = async () => {
  const res = await axios.get(
    "/api/users/profile",
    {
      withCredentials: true
    }
  );

  setAuthenticated(true);
  setIsAdmin(res.data.user.role === "admin");
};

 const logout = async () => {
  try {
    await axios.post(
      "/api/users/logout",
      {},
      {
        withCredentials: true
      }
    );
  } catch (error) {
    console.error(error);
  }

  setAuthenticated(false);
  setIsAdmin(false);

  navigate("/users/login", {
    replace: true
  });
};

 
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ isAdmin, authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

