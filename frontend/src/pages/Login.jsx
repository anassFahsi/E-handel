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

      
      login(res.data.token);

     
      navigate("/users/profile");

    } catch (err) {
      console.error(err);
      alert("Fel e-post eller lösenord"); 
    }
  };

  return (
    <div className="login-page">
  <h2 className="page-title">Logga in</h2>

  <div className="login-form">
    <input
      className="form-input"
      type="email"
      placeholder="E-post"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      className="form-input"
      type="password"
      placeholder="Lösenord"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button className="btn btn-primary" onClick={handleLogin}>
      Logga in
    </button>
  </div>
</div>

  );
}


