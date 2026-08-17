import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
          "http://localhost:3000/users/orders",
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
    <div>
      <h1>Mina ordrar</h1>

      {orders.length === 0 && <p>Du har inga ordrar ännu.</p>}

      <ul>
        {orders.map(order => (
          <li key={order.id} style={{ marginBottom: "20px" }}>
            <strong>Order #{order.id}</strong><br />
            Datum: {new Date(order.created_at).toLocaleDateString()}<br />
            Status: {order.status}<br />
            Total: {order.total} kr

            <h4>Produkter:</h4>
            <ul>
              {order.items.map(item => (
                <li key={item.id}>
                  {item.quantity} x {item.product_name}
                  {item.variant_size && item.variant_color &&
                    ` (${item.variant_size}, ${item.variant_color})`
                  }
                  – {item.price_at_purchase} kr
                  <br />

                  <img
                    src={
                      item.image_url.startsWith("http")
                        ? item.image_url
                        : "http://localhost:3000" + item.image_url
                    }
                    alt={item.product_name}
                    width="120"
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



