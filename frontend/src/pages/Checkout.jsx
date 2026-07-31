import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout = ({ sessionId }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: ""
  });

  // ⭐ 1. Hämta cart från backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/cart/${sessionId}`);
        setItems(res.data.items || []);
      } catch (err) {
        console.error("Could not fetch cart", err);
      }
    };

    fetchCart();
  }, []);

  // ⭐ 2. Räkna total från backend-cart
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ⭐ 3. Hantera formulär
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ⭐ 4. Skicka order till backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    const order = {
      customer: form,
      cart: items,
      total
    };

    try {
      const res = await axios.post("http://localhost:3000/orders", order);
      const data = res.data;

      if (data.success) {
        navigate(`/thankyou/${data.orderId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Order failed");
    }
  };

  return (
    <div>
      <h1>Checkout</h1>

      <h2>Total: {total} kr</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Confirm order</button>
      </form>
    </div>
  );
};

export default Checkout;
