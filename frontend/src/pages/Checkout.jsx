import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/checkout.css'
import { useCurrency } from "../context/CurrencyContext";

export default function Checkout({ sessionId, fetchCartCount }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });
  const {currency, convert}=useCurrency();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const [grandTotal, setGrandTotal] = useState(0);
  const navigate = useNavigate();

  
  
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`/api/cart/${sessionId}`);
        setItems(res.data.items || []);
        setSubtotal(res.data.total || 0);
      } catch (err) {
        console.error("Could not fetch cart", err);
        setCheckoutError("Kunde inte hämta kundvagnen");
        setTimeout(() => setCheckoutError(null), 2500);
      }
    };

    fetchCart();
  }, [sessionId]);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await axios.get("/api/shipping");
        setShippingMethods(res.data);
        setSelectedShipping(res.data[0]); 
      } catch (err) {
        console.error("Could not fetch shipping methods", err);
        setCheckoutError("Kunde inte hämta fraktalternativ");
        setTimeout(() => setCheckoutError(null), 2500);
      }
    };

    fetchShipping();
  }, []);

  useEffect(() => {
    if (selectedShipping) {
      setGrandTotal(subtotal + Number(selectedShipping.price));
    }
  }, [subtotal, selectedShipping]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateCheckout = (form, items, selectedShipping) => {
    if (!form.name.trim()) return "Namn är obligatoriskt";
    if (!validateEmail(form.email)) return "Ogiltig e-postadress";
    if (!form.address.trim()) return "Adress är obligatorisk";
    if (items.length === 0) return "Kundvagnen är tom";
    if (!selectedShipping) return "Välj ett fraktalternativ";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateCheckout(form, items, selectedShipping);

    if (error) {
      setCheckoutError(error);
      setTimeout(() => setCheckoutError(null), 2500);
      return;
    }

    const order = {
      customer: form,
      cart: items,
      shipping_method_id: selectedShipping.id,
      shipping_price: selectedShipping.price,
      total: grandTotal,
      sessionId: sessionId,
    };
    console.log(order)

    try {
      const res = await axios.post("/api/orders", order);
      

      if (res.data.success) {
        setItems([]);
        setSubtotal(0);
        await fetchCartCount();

      navigate(`/thankyou/${res.data.orderId}`);
      
      }
    } catch (err) {
      console.error("Could not submit order", err);
      setCheckoutError("Kunde inte skicka order");
      setTimeout(() => setCheckoutError(null), 2500);
    }
  };

  return (
    <div className="checkout-page">

   
      {checkoutError && (
        <div className="error-popup">{checkoutError}</div>
      )}

    
      <div className="checkout-steps">
        <span className="checkout-step">1. Kundvagn</span>
        <span className="checkout-step active">2. Kassa</span>
        <span className="checkout-step">3. Bekräftelse</span>
      </div>

      <div className="checkout-grid">

       
        <div className="checkout-summary">
          <h2 className="summary-title">Orderöversikt</h2>

          <div className="summary-item">
            <span>Delsumma:</span>
            <span>{convert(subtotal).toFixed(2)} {currency}</span>
          </div>

          {selectedShipping && (
            <div className="summary-item">
              <span>Frakt:</span>
              <span>{convert(Number(selectedShipping.price)).toFixed(2)} {currency} ({selectedShipping.delivery_days} dagar)</span>
            </div>
          )}

          <div className="summary-total">
            Totalt: {convert(grandTotal).toFixed(2)} {currency}
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <label className="form-label">Namn</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} />

          <label className="form-label">E-post</label>
          <input className="form-input" name="email" value={form.email} onChange={handleChange} />

          <label className="form-label">Adress</label>
          <input className="form-input" name="address" value={form.address} onChange={handleChange} />

          <label className="form-label">Fraktalternativ</label>
          <select
            className="form-select"
            value={selectedShipping?.id}
            onChange={(e) => {
              const method = shippingMethods.find(m => m.id === Number(e.target.value));
              setSelectedShipping(method);
            }}
          >
            {shippingMethods.map(method => (
              <option key={method.id} value={method.id}>
                {method.name} - {convert(Number(method.price)).toFixed(2)} {currency} ({method.delivery_days} dagar)
              </option>
            ))}
          </select>

          <button className="checkout-button" type="submit">
            Bekräfta order
          </button>
        </form>

      </div>
    </div>
  );
}



