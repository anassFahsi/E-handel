import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Cart = ({ sessionId }) => {
  const [items, setItems] = useState([]);

  // ⭐ Hämta cart från backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/cart/${sessionId}`);
        setItems(res.data.items || []);
        console.log(res.data.items )
      } catch (err) {
        console.error("Could not fetch cart", err);
      }
    };

    fetchCart();
  }, [sessionId]);

  // ⭐ Ta bort item från backend
  const removeItem = async (itemId) => {
    try {
      const res=await axios.delete(`http://localhost:3000/cart/items/${itemId}`);
      alert(res.data.message)
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Could not remove item", err);
    }
  };

  // ⭐ Räkna total från backend-cart
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h1>Cart</h1>

      {items.length === 0 && <p>Your cart is empty.</p>}

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.quantity} x {item.name} - {item.price} kr
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h2>Total: {total} kr</h2>

      <Link to="/checkout">
        <button>Go to checkout</button>
      </Link>

      <Link to="/">
        <button>Back to products</button>
      </Link>
    </div>
  );
};

export default Cart;

