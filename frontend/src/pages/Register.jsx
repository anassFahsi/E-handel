import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:3000/users/register", {
        email,
        password,
        username
      });

      alert("Registrering lyckades"); 
      navigate("/users/login");
    } catch (err) {
      console.error(err);
      alert("Registrering misslyckades");
    }
  };

  return (
    <div>
      <h2>Registrera dig</h2>

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

      <input
        type="text"
        placeholder="Användarnamn (valfritt)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button onClick={handleRegister}>Registrera</button>
    </div>
  );
};

export default Register;
