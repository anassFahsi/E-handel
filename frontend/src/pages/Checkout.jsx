import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Checkout({ sessionId, fetchCartCount }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  const [grandTotal, setGrandTotal] = useState(0);
  const navigate = useNavigate();

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/cart/${sessionId}`);
        setItems(res.data.items || []);
        setSubtotal(res.data.total || 0);
      } catch (err) {
        console.error("Could not fetch cart", err);
      }
    };

    fetchCart();
  }, [sessionId]);

  // Fetch shipping methods
  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await axios.get("http://localhost:3000/shipping");
        setShippingMethods(res.data);
        setSelectedShipping(res.data[0]); // default
      } catch (err) {
        console.error("Could not fetch shipping methods", err);
      }
    };

    fetchShipping();
  }, []);

  // Update grand total when shipping or subtotal changes
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const order = {
      customer: form,
      cart: items,
      shipping_method_id: selectedShipping.id,
      shipping_price: selectedShipping.price,
      total: grandTotal,
      sessionId: sessionId,
    };

    try {
      const res = await axios.post("http://localhost:3000/orders", order);
      if (res.data.success) {
        alert("Order skickad!"); 
        setItems([]);
        setSubtotal(0);
        await fetchCartCount();
        navigate(`/thankyou/${res.data.orderId}`);
      }
    } catch (err) {
      console.error("Could not submit order", err);
      alert("Kunde inte skicka order"); 
    }
  };

  return (
    <div>
      <h1>Kassa</h1> 

      <h2>Delsumma: {subtotal} kr</h2> 

      {selectedShipping && (
        <h3>
          Frakt: {selectedShipping.price} kr ( 
          {selectedShipping.delivery_days}{" "}
          {selectedShipping.delivery_days === 1 ? "dag" : "dagar"} 
          )
        </h3>
      )}

      <h2>Totalt: {grandTotal} kr</h2> 

      <form onSubmit={handleSubmit}>
        <label>
          Namn: {/* ⭐ ÄNDRAT */}
          <input name="name" value={form.name} onChange={handleChange} />
        </label>

        <label>
          E-post: 
          <input name="email" value={form.email} onChange={handleChange} />
        </label>

        <label>
          Adress: 
          <input name="address" value={form.address} onChange={handleChange} />
        </label>

        <label>
          Fraktalternativ: 
          <select
            value={selectedShipping?.id}
            onChange={(e) => {
              const method = shippingMethods.find(
                (m) => m.id === Number(e.target.value)
              );
              setSelectedShipping(method);
            }}
          >
            {shippingMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name} - {method.price} kr ( 
                {method.delivery_days}{" "}
                {method.delivery_days === 1 ? "dag" : "dagar"} 
                )
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Bekräfta order</button> 
      </form>
    </div>
  );
}


