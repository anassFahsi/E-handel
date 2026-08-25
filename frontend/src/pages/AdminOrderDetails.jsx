import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");


  const [successPopup, setSuccessPopup] = useState(null);
  const [errorPopup, setErrorPopup] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `/api/admin/orders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrder(res.data.order);
      setItems(res.data.items);
      setOrderStatus(res.data.order.status);

    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Kunde inte ladda orderdetaljer");
      setTimeout(() => setErrorPopup(null), 2500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Är du säker på att du vill ta bort denna order?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `/api/admin/orders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessPopup(res.data.message || "Order borttagen");
      setTimeout(() => setSuccessPopup(null), 2000);

      setTimeout(() => {
        navigate("/admin/orders");
      }, 2000);

    } catch (err) {
      console.error(err);
      setErrorPopup("Kunde inte ta bort order");
      setTimeout(() => setErrorPopup(null), 2500);
    }
  };

  const updateStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `/api/admin/orders/${order.id}/status`,
        { status: orderStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessPopup("Orderstatus uppdaterad");
      setTimeout(() => setSuccessPopup(null), 2500);

      fetchOrderDetails();

    } catch (err) {
      console.error(err);
      setErrorPopup("Kunde inte uppdatera status");
      setTimeout(() => setErrorPopup(null), 2500);
    }
  };

  if (loading) return <p>Laddar orderdetaljer...</p>;
  if (error) return <p>{error}</p>;
  if (!order) return <p>Ingen order hittades.</p>;

  return (
    <div className="admin-order-details-page">

     
      {successPopup && (
        <div className="success-popup">{successPopup}</div>
      )}

      {errorPopup && (
        <div className="error-popup">{errorPopup}</div>
      )}

      <h1 className="page-title">Order #{order.id}</h1>

      <h2 className="section-title">Kund</h2>
      <p><strong>Namn:</strong> {order.customer_name}</p>
      <p><strong>Email:</strong> {order.customer_email}</p>
      <p><strong>Adress:</strong> {order.customer_address}</p>
      <p><strong>Status:</strong> {order.status}</p>

      <h2 className="section-title">Orderrader</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Produkt</th>
            <th>Antal</th>
            <th>Pris vid köp</th>
            <th>Delsumma</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.product_id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price_at_purchase} kr</td>
              <td>{item.subtotal} kr</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section-title">Totalt</h2>
      <p className="order-total">{order.total} kr</p>

      <div className="order-status-update">
        <p><strong>Status:</strong> {orderStatus}</p>

        <select
          className="form-select"
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
        >
          <option value="Beställd">Beställd</option>
          <option value="Behandlas">Behandlas</option>
          <option value="Levererad">Levererad</option>
          <option value="Återbetald">Återbetald</option>
        </select>
      </div>

      <button className="btn btn-primary" onClick={updateStatus}>
        Uppdatera status
      </button>

      <Link to="/admin/orders">
        <button className="btn btn-secondary">Tillbaka till ordrar</button>
      </Link>

      <button className="btn btn-danger" onClick={handleDelete}>
        Ta bort order
      </button>
    </div>
  );
};

export default AdminOrderDetails;

