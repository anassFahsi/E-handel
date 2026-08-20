import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Cart = ({ sessionId, handleCartCount }) => {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/cart/${sessionId}`);
      setItems(res.data.items || []);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Could not fetch cart", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

  const removeItem = async (itemId) => {
    if (!confirm("Är du säker på att du vill ta bort produkten?")) return; 

    try {
      await axios.delete(`http://localhost:3000/cart/items/${itemId}`);
      alert("Produkten har tagits bort"); 

      await fetchCart();
      await handleCartCount();
    } catch (err) {
      console.error("Could not remove item", err);
    }
  };

  const increaseQuantity = async (itemId) => {
    try {
      await axios.put(`http://localhost:3000/cart/items/${itemId}/increase`);

      await fetchCart();
      await handleCartCount();
    } catch (error) {
      const msg = error.response?.data?.message || "Kunde inte öka antal"; 
      alert(msg);
    }
  };

  const decreaseQuantity = async (itemId) => {
    try {
      const res = await axios.put(`http://localhost:3000/cart/items/${itemId}/decrease`);
      alert(res.data.message); 
      await fetchCart();
      await handleCartCount();
    } catch (error) {
      console.error("Kunde inte minska antal", error); 
    }
  };

  return (
    <div className="cart-page">
  <h1 className="page-title">Kundvagn</h1>

  {items.length === 0 && <p className="empty-cart">Din kundvagn är tom.</p>}

  <ul className="cart-items">
    {items.map(item => (
      <li key={item.id} className="cart-item">
        <span className="cart-item-text">
          {item.quantity} x {item.name} - {item.price} kr
        </span>

        <div className="cart-item-actions">
          <button className="btn btn-secondary" onClick={() => decreaseQuantity(item.id)}>-</button>
          <button className="btn btn-secondary" onClick={() => increaseQuantity(item.id)}>+</button>
          <button className="btn btn-danger" onClick={() => removeItem(item.id)}>Ta bort</button>
        </div>
      </li>
    ))}
  </ul>

  <h2 className="cart-total">Totalt: {total} kr</h2>

  <Link to="/checkout">
    <button className="btn btn-primary" disabled={total === 0}>
      Gå till kassan
    </button>
  </Link>

  <button className="btn btn-secondary" onClick={() => navigate('/products')}>
    Tillbaka till produkter
  </button>
</div>

  );
};

export default Cart;
