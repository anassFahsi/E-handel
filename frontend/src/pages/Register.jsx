import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Lösenordet måste vara minst 8 tecken långt";
    }
    if (!/[A-Z]/.test(password)) {
      return "Lösenordet måste innehålla minst en stor bokstav (A-Z)";
    }
    if (!/[0-9]/.test(password)) {
      return "Lösenordet måste innehålla minst en siffra (0-9)";
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return "Lösenordet måste innehålla minst ett specialtecken (!@#$%^&*)";
    }
    return null;
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      alert("Ogiltig e-postadress");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    try {
      await axios.post("http://localhost:3000/users/register", {
        email,
        password,
        name
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
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleRegister}>Registrera</button>
    </div>
  );
};

export default Register;

