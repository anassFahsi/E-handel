import { useEffect, useState,useContext } from "react";
import axios from "axios";
import {Navigate, Link,useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);

  if (isAdmin) {
    return <Navigate to="/admin/profile" />;
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/users/login";
        return;
      }

      try {
        const res = await axios.get("http://localhost:3000/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(res.data.user);
      
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/users/login");
        }
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Laddar...</p>; 

 return (
  <div>
    <h2>Min profil</h2>

    <p><strong>E-post:</strong> {user.email}</p>
    <p><strong>Användarnamn:</strong> {user.name || "Inget användarnamn"}</p>

      <p><strong>Medlem sedan:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
    

    <hr />

    <Link to={`/users/orders`}>Mina ordrar</Link>
    <br />
    <Link to="/users/change-password">Byt lösenord</Link>
  </div>
);

}

