import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const [searchParams]=useSearchParams();
  const { login } = useContext(AuthContext);

  useEffect(() => {

  const error =
    searchParams.get("error");

  if (!error) return;

  if (error === "cancelled") {
    setLoginError(
      "Google-inloggningen avbröts."
    );
  }

  if (error === "google") {
    setLoginError(
      "Kunde inte logga in med Google."
    );
  }

  if (error === "state" || error==="pkce") {
    setLoginError(
      "Inloggningen kunde inte verifieras."
    );
  }

  if (error === "not-verified") {
    setLoginError(
      "Google-kontot har ingen verifierad e-postadress."
    );
  }

}, [searchParams]);

  const handleLogin = async () => {
    try {
      await axios.post("/api/users/login", {
        email,
        password
      },{
        withCredentials:true
      });

     await  login();
      navigate("/users/profile");
      

    } catch (err) {
      console.error(err);
      setLoginError("Fel e-post eller lösenord");
      setTimeout(() => setLoginError(null), 2500);
    }
  };

  const loginWithGoogle = () => {
  window.location.href = "/api/auth/google";
};

  return (
    <div className="login-page">


      {loginError && (
        <div className="error-popup">{loginError}</div>
      )}

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
        <div className="login-alt">

        
          <button className="btn btn-primary" onClick={handleLogin}>
            Logga in
          </button>
          <p>Eller</p>
          <button className="btn btn-primary" onClick={loginWithGoogle}>Fortsätt med Google</button>
        </div> 
      </div>
    </div>
  );
}



