import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      <p>ID: {user.id}</p>
      <p>Roll: {user.role}</p>
    </div>
  );
}

