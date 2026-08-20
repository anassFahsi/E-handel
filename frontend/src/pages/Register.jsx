import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // POPUPS
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [registerError, setRegisterError] = useState(null);

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
      setRegisterError("Ogiltig e-postadress");
      setTimeout(() => setRegisterError(null), 2500);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setRegisterError(passwordError);
      setTimeout(() => setRegisterError(null), 2500);
      return;
    }

    try {
      await axios.post("http://localhost:3000/users/register", {
        email,
        password,
        name
      });

      setRegisterSuccess("Registrering lyckades!");
      setTimeout(() => setRegisterSuccess(null), 2000);

      setTimeout(() => {
        navigate("/users/login");
      }, 2000);

    } catch (err) {
      console.error(err);
      setRegisterError("Registrering misslyckades");
      setTimeout(() => setRegisterError(null), 2500);
    }
  };

  return (
    <div className="register-page">

      {/* POPUPS */}
      {registerSuccess && (
        <div className="success-popup">{registerSuccess}</div>
      )}

      {registerError && (
        <div className="error-popup">{registerError}</div>
      )}

      <h2 className="page-title">Registrera dig</h2>

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

      <input
        className="form-input"
        type="text"
        placeholder="Användarnamn (valfritt)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleRegister}>
        Registrera
      </button>
    </div>
  );
};

export default Register;


