import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
  });

  const [latestOrders, setLatestOrders] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

     
      const statsRes = await axios.get("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(statsRes.data);

     
      const ordersRes = await axios.get("/api/admin/orders/latest", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLatestOrders(ordersRes.data);

    } catch (err) {
      console.error("Could not load dashboard", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="admin-dashboard-page">
  <h1 className="page-title">Admin Dashboard</h1>

  <div className="dashboard-stats">
    <div className="stat-card">
      <h3>Produkter</h3>
      <p>{stats.products}</p>
    </div>

    <div className="stat-card">
      <h3>Ordrar</h3>
      <p>{stats.orders}</p>
    </div>

    <div className="stat-card">
      <h3>Användare</h3>
      <p>{stats.users}</p>
    </div>
  </div>

  <hr className="divider" />

  <h2 className="section-title">Senaste ordrar</h2>

  <table className="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Kund</th>
        <th>Totalt</th>
        <th>Datum</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      {latestOrders.map(order => (
        <tr key={order.id}>
          <td>{order.id}</td>
          <td>{order.customer_name}</td>
          <td>{order.total} kr</td>
          <td>{new Date(order.created_at).toLocaleString()}</td>
          <td>
            <Link to={`/admin/orders/${order.id}`}>
              <button className="btn btn-primary">Visa</button>
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <hr className="divider" />

  <h3 className="section-title">Snabblänkar</h3>

  <ul className="quick-links">
    <li><Link className="nav-link" to="/admin/products">Hantera produkter</Link></li>
    <li><Link className="nav-link" to="/admin/orders">Hantera ordrar</Link></li>
    <li><Link className="nav-link" to="/admin/profile">Adminprofil</Link></li>
  </ul>
</div>

  );
}
