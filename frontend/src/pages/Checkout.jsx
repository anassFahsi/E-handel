import { useState, useEffect } from "react";
import axios from "axios";
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
  const [postalCode, setPostalCode] = useState("");
  const [servicePoints, setServicePoints] = useState([]);
  const [selectedServicePoint, setSelectedServicePoint] = useState('');

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);
  const [grandTotal, setGrandTotal] = useState(0);

   
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
  if (postalCode.length !== 5) {
    
    setServicePoints([]);
    setDeliveryTime(null);
    return;
  }
  const fetchShippingData = async () => {
    try {
      const [servicePointsRes, deliveryTimeRes] =
        await Promise.all([

          axios.get(
            "/api/shipping/service-points",
            {
              params: { postalCode }
            }
          ),

          axios.get(
            "/api/shipping/delivery-time",
            {
              params: { postalCode }
            }
          )

        ]);

      setServicePoints(
        servicePointsRes.data
      );

      setDeliveryTime(
        new Date(deliveryTimeRes.data)
          .toLocaleDateString(
            "sv-SE",
            {
              weekday: "long",
              day: "numeric",
              month: "numeric"
            }
          )
      );

    } catch (err) {

      console.error(err);

      setServicePoints([]);
      setDeliveryTime(null);

    }
  };

  fetchShippingData();

}, [postalCode]);

  

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
      subtotal<500? setGrandTotal(subtotal + Number(selectedShipping.price)):setGrandTotal(subtotal);
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
    if (selectedShipping?.name === "PostNord Ombud" &&
      !selectedServicePoint
    ) {
    return "Välj ett ombud";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    console.log('selectedServicePoint',selectedServicePoint)
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
      sessionId: sessionId,
      postalCode,
      servicePointId:selectedServicePoint
   
    };
    console.log(order)

    try {
      const res = await axios.post("/api/orders/checkout", order);
      window.location.href=res.data.url;

      if (res.data.success) {
        setItems([]);
        setSubtotal(0);
        await fetchCartCount();
        setSelectedServicePoint([]);
        setDeliveryTime(null)
      
      }
    } catch (err) {
      console.error("Could not submit order", err);
  
      setCheckoutError(
        err.response?.data?.error ||
        "Kunde inte skicka order"
      );

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
              <span>{subtotal>=500?'0,00':convert(Number(selectedShipping.price)).toFixed(2)} {currency}</span>
            </div>
          )}
          {deliveryTime &&
          <div className="summary-item">
          <span>Beräknad leveranstid:</span>
          <span>{deliveryTime}</span>
          </div>}

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
                {method.name} - {convert(Number(method.price)).toFixed(2)} {currency}
              </option>
            ))}
          </select>

          <label className="form-label">Postnummer</label>
          <input className="form-input" name='postalcode'  value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value);
            }}/>

            {selectedShipping?.name ==="PostNord Ombud"&&
            <select value={selectedServicePoint} onChange={(e)=>setSelectedServicePoint(e.target.value)}>
              <option value="">Valj ombud</option>
              {servicePoints.map(point=><option key={point.id} value={point.id}>{point.name}</option>)}
              </select>
              }

          <button className="checkout-button" type="submit">
            Bekräfta order
          </button>
        </form>

      </div>
    </div>
  );
}



