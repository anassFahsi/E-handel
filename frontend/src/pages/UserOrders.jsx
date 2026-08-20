import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/userOrders.css';

const UserOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/users/login");

      try {
        const res = await axios.get(
          "http://localhost:3000/orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Kunde inte hämta ordrar");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Laddar dina ordrar...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="user-orders-page">
       <h1 className="page-title">Mina ordrar</h1>

       {orders.length === 0 && (
       <p className="no-orders-text">Du har inga ordrar ännu.</p>
       )}

      <ul className="orders-list">
       {orders.map(order => (
         <li key={order.id} className="order-card">
           <strong className="order-title">Order #{order.id}</strong>
           <p className="order-date">
             Datum: {new Date(order.created_at).toLocaleDateString()}
           </p>
           <p className="order-status">Status: {order.status}</p>
           <p className="order-total">Total: {order.total} kr</p>

           <h4 className="order-products-title">Produkter:</h4>

           <ul className="order-items-list">
             {order.items.map(item => (
              <li key={item.id} className="order-item">
                <span className="order-item-text">
                  {item.quantity} x {item.product_name}
                  {item.variant_size && item.variant_color &&
                   ` (${item.variant_size}, ${item.variant_color})`
                  }
                  - {item.price_at_purchase} kr
                </span>

                <img
                className="order-item-image"
                src={
                  item.image_url.startsWith("http")
                    ? item.image_url
                    : "http://localhost:3000" + item.image_url
                }
                alt={item.product_name}
              />
            </li>
          ))}
        </ul>
      </li>
    ))}
  </ul>
</div>

  );
};

export default UserOrders;



