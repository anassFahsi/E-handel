import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function AdminProfile() {
  const { token, logout } = useContext(AuthContext);

  if (!token) {
    return <p>Du måste vara inloggad som admin.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Adminprofil</h1>

      <p>Du är inloggad som administratör.</p>

      <hr />

      <h3>Adminpanel</h3>
      <ul>
        <li><Link to="/admin/products">Hantera produkter</Link></li>
        <li><Link to="/admin/orders">Hantera ordrar</Link></li>
      </ul>

      <button onClick={logout}>Logga ut</button>
    </div>
  );
}
