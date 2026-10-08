import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";

const Cart = ({ sessionId, handleCartCount }) => {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const {currency, convert}=useCurrency();
  // POPUPS
  const [cartSuccess, setCartSuccess] = useState(null);
  const [cartError, setCartError] = useState(null);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`/api/cart/${sessionId}`);
      setItems(res.data.items || []);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Could not fetch cart", err);
      setCartError("Kunde inte hämta kundvagnen");
      setTimeout(() => setCartError(null), 2500);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

  const removeItem = async (itemId) => {

    try {
      await axios.delete(`/api/cart/items/${itemId}`);

      setCartSuccess("Produkten har tagits bort");
      setTimeout(() => setCartSuccess(null), 2500);

      await fetchCart();
      await handleCartCount();
    } catch (err) {
      console.error("Could not remove item", err);
      setCartError("Kunde inte ta bort produkten");
      setTimeout(() => setCartError(null), 2500);
    }
  };

  const increaseQuantity = async (itemId) => {
    try {
      await axios.put(`/api/cart/items/${itemId}/increase`);

      setCartSuccess("Antalet ökades");
      setTimeout(() => setCartSuccess(null), 2500);

      await fetchCart();
      await handleCartCount();
    } catch (error) {
      const msg = error.response?.data?.message || "Kunde inte öka antal";
      setCartError(msg);
      setTimeout(() => setCartError(null), 2500);
    }
  };

  const decreaseQuantity = async (itemId) => {
    try {
       await axios.put(`/api/cart/items/${itemId}/decrease`);

      setCartSuccess("Antalet minskades");
      setTimeout(() => setCartSuccess(null), 2500);

      await fetchCart();
      await handleCartCount();
    } catch (error) {
      console.error("Kunde inte minska antal", error);
      setCartError("Kunde inte minska antal");
      setTimeout(() => setCartError(null), 2500);
    }
  };

  return (
    <div className="cart-page">

   
      {cartSuccess && (
        <div className="success-popup">
          {cartSuccess}
        </div>
      )}

    
      {cartError && (
        <div className="error-popup">
          {cartError}
        </div>
      )}

      <h1 className="page-title">Kundvagn</h1>

      {items.length === 0 && <p className="empty-cart">Din kundvagn är tom.</p>}

      <ul className="cart-items">
        {items.map(item => (
          <li key={item.id} className="cart-item">
            <span className="cart-item-text">
              {item.quantity} x {item.name} - {convert(Number(item.price)).toFixed(2)} {currency}
            </span>

            <div className="cart-item-actions">
              <button className="btn btn-secondary" onClick={() => decreaseQuantity(item.id)}>-</button>
              <button className="btn btn-secondary" onClick={() => increaseQuantity(item.id)}>+</button>
              <button className="btn btn-danger" onClick={() => removeItem(item.id)}>Ta bort</button>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="cart-total">Totalt: {convert(total).toFixed(2)} {currency}</h2>

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

