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
  const [importReport, setImportReport] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

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

  const importProducts = async (format) => {
  try {
    setImportLoading(true);

    const token = localStorage.getItem("token");

    const res = await axios.post(
      `/api/admin/products/import/${format}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setImportReport(res.data);
    console.log(res.data)

    fetchDashboardData();
  } catch (err) {
    console.error("Import failed", err);
  } finally {
    setImportLoading(false);
  }
};

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="admin-dashboard-page">
  <h1 className="page-title">Admin Panel</h1>

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
  <div className="stat-card">
       <h2>Importera produkter</h2>
       <button type="button" className="btn btn-primary"
        onClick={() => importProducts("csv")}
        disabled={importLoading}>
          importera CSV
       </button>
       <button type="button" className="btn btn-primary"
        onClick={() => importProducts("xml")}
        disabled={importLoading}>
          importera XML
       </button>
      {importReport&&
      <>
        <p>Nya produkter: {importReport.newProducts}</p>
        <p>Uppdaterade produkter: {importReport.updatedProducts}</p>
        <p>Överhoppade produkter: {importReport.skippedCount}</p>
        <ul>
          {importReport.skippedProducts.map(p=>(<>
           <li key={p.sku}>Produkt: {p.sku}
            - Orsak: {p.reason[0]?.message}</li>
          </>
          ))}
        </ul>
        </>
        }
       
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
