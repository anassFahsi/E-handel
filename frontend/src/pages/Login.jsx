import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/users/login", {
        email,
        password
      });

      // Spara token
      localStorage.setItem("token", res.data.token);

      // Redirect efter login
      navigate("/users/profile") ; // eller /admin
    } catch (err) {
      console.error(err)
      alert("Fel email eller lösenord");
    }
  };

  return (
    <div>
      <h2>Logga in</h2>

      <input
        type="email"
        placeholder="Email"
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
