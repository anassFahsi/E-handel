import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function AdminProfile() {
  const { token, logout } = useContext(AuthContext);

  if (!token) {
    return <p>Du måste vara inloggad som admin.</p>;
  }

  return (
    <div className="admin-profile-page">
  <h1 className="page-title">Adminprofil</h1>

  <p className="admin-info">Du är inloggad som administratör.</p>

  <hr className="divider" />

  <h3 className="section-title">Adminpanel</h3>

  <ul className="admin-links">
    <li><Link className="nav-link" to="/admin/products">Hantera produkter</Link></li>
    <li><Link className="nav-link" to="/admin/orders">Hantera ordrar</Link></li>
  </ul>

  <button className="btn btn-danger" onClick={logout}>Logga ut</button>
</div>

  );
}
