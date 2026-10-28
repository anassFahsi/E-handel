import { Link,useSearchParams } from "react-router-dom";
import "../styles/thankyou.css";
import axios from "axios";
import { useState, useEffect } from "react";


const ThankYou = () => {
  const [params]=useSearchParams();
  const sessionId=params.get('session_id');
  const [order, setOrder]=useState(null);

  
  useEffect(()=>{
    const getOrder=async()=>{
      try{
        const res= await axios.get(`/api/orders/checkout/session/${sessionId}`)
          console.log(res.data);
          setOrder(res.data.order);
      }
      catch(error){
        console.error('Kunde inte hämta order ',error);
      }
     
    };getOrder()
   },[sessionId]);
  

  return (
    <>
    {order && 
      <div className="thankyou-page">

      <div className="thankyou-box">
        <div className="thankyou-icon">🎉</div>

        <h1 className="thankyou-title">Tack för din order!</h1>

        <p className="thankyou-order-id">
          Ditt ordernummer: <strong>{order.id}</strong>
        </p>
        <p>Status :<strong>{order.status}</strong></p>
        <p>Total :<strong>{order.total} SEK</strong></p>
        <p>Namn :<strong>{order.customer_name}</strong></p>
        <p>E-post :<strong>{order.customer_email}</strong></p>
        <p>Beställd :<strong>{new Date(order.created_at).toLocaleString    ("sv-SE", {
             dateStyle: "long",
            timeStyle: "short",
           })}</strong></p>


        <Link to="/">
          <button className="btn btn-primary thankyou-button">
            Tillbaka till produkter
          </button>
        </Link>
      </div>

    </div>

    }
  </>
  );
};

export default ThankYou;
