import { useEffect, useState,useContext } from "react";
import axios from "axios";
import {Navigate, Link,useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import  '../styles/profile.css';

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
        const res = await axios.get("/api/users/profile", {
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
  <div className="profile-page">
  <h2 className="page-title">Min profil</h2>

  <p className="profile-field">
    <strong>E-post:</strong> {user.email}
  </p>

  <p className="profile-field">
    <strong>Användarnamn:</strong> {user.name || "Inget användarnamn"}
  </p>

  <p className="profile-field">
    <strong>Medlem sedan:</strong> {new Date(user.created_at).toLocaleDateString()}
  </p>

  <hr className="divider" />

  <Link className="profile-link" to="/orders">Mina ordrar</Link>
  <br />
  <Link className="profile-link" to="/users/change-password">Byt lösenord</Link>
</div>

);

}

