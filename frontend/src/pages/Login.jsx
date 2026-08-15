import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/users/login", {
        email,
        password
      });

      // Uppdatera global auth-state
      login(res.data.token);

      // Redirect efter login
      navigate("/users/profile");

    } catch (err) {
      console.error(err);
      alert("Fel e-post eller lösenord"); 
    }
  };

  return (
    <div>
      <h2>Logga in</h2>

      <input
        type="email"
        placeholder="E-post" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Logga in</button>
    </div>
  );
}


