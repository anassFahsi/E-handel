import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await axios.get("http://localhost:3000/admin/orders", {
        params: { search, page, limit },
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data.orders);
      setTotalPages(res.data.pages);

    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Kunde inte ladda ordrar"); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [limit, search]);

  return (
    <div className="admin-orders-page">
  <h1 className="page-title">Admin - Ordrar</h1>

  <input
    className="filter-input"
    type="text"
    value={search}
    placeholder="Sök order via ID, kundnamn eller e-post"
    onChange={(e) => setSearch(e.target.value)}
  />

  <select
    className="filter-select"
    value={limit}
    onChange={(e) => {
      setLimit(Number(e.target.value));
      setPage(1);
    }}
  >
    <option value="5">5 per sida</option>
    <option value="10">10 per sida</option>
  </select>

  <table className="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Kund</th>
        <th>Totalt</th>
        <th>Datum</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      {orders.map(order => (
        <tr key={order.id}>
          <td>{order.id}</td>
          <td>{order.customer_name}</td>
          <td>{order.total} kr</td>
          <td>{new Date(order.created_at).toLocaleString()}</td>
          <td>{order.status}</td>
          <td>
            <Link to={`/admin/orders/${order.id}`}>
              <button className="btn btn-primary">Visa</button>
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <div className="pagination">
    <button
      className="btn btn-secondary"
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
    >
      Föregående
    </button>

    <span className="pagination-info">
      Sida {page} av {totalPages}
    </span>

    <button
      className="btn btn-secondary"
      disabled={page === totalPages}
      onClick={() => setPage(page + 1)}
    >
      Nästa
    </button>
  </div>
</div>

  );
};

export default AdminOrders;
