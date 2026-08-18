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

      // Hämta statistik
      const statsRes = await axios.get("http://localhost:3000/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(statsRes.data);

      // Hämta senaste ordrar
      const ordersRes = await axios.get("http://localhost:3000/admin/orders/latest", {
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
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", background: "#eee", borderRadius: "8px" }}>
          <h3>Produkter</h3>
          <p>{stats.products}</p>
        </div>

        <div style={{ padding: "20px", background: "#eee", borderRadius: "8px" }}>
          <h3>Ordrar</h3>
          <p>{stats.orders}</p>
        </div>

        <div style={{ padding: "20px", background: "#eee", borderRadius: "8px" }}>
          <h3>Användare</h3>
          <p>{stats.users}</p>
        </div>
      </div>

      <hr />

      <h2>Senaste ordrar</h2>

      {latestOrders.length === 0 ? (
        <p>Inga ordrar hittades.</p>
      ) : (
        <table>
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
                    <button>Visa</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <h3>Snabblänkar</h3>
      <ul>
        <li><Link to="/admin/products">Hantera produkter</Link></li>
        <li><Link to="/admin/orders">Hantera ordrar</Link></li>
        <li><Link to="/admin/profile">Adminprofil</Link></li>
      </ul>
    </div>
  );
}
