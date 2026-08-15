import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const AdminOrderDetails=()=> {
  const { id } = useParams();

  const [order, setOrder] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderStatus,setOrderStatus]=useState(order.status);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token= localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/orders/${id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      setOrder(res.data.order);
      setItems(res.data.items);
      setOrderStatus(res.data.order.status);
      
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Kunde inte ladda orderdetaljer"); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Är du säker på att du vill ta bort denna order?")) return; 

    try {
      const token=localStorage.getItem('token')
      const res=await axios.delete(`http://localhost:3000/orders/${id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      });

      alert(res.data.message);
      window.location.href = "/admin/orders";
    } catch (err) {
      console.error(err);
      alert("Kunde inte ta bort order"); 
    }
  };

  const updateStatus = async () => {
    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:3000/orders/${order.id}/status`,
      { status: orderStatus }, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Orderstatus uppdaterad"); 
  };

  if (loading) return <p>Laddar orderdetaljer...</p>; 
  if (error) return <p>{error}</p>;
  if (!order) return <p>Ingen order hittades.</p>; 

  return (
    <div>
      <h1>Order #{order.id}</h1>

      <h2>Kund</h2> 
      <p><strong>Namn:</strong> {order.customer_name}</p> 
      <p><strong>Email:</strong> {order.customer_email}</p>
      <p><strong>Adress:</strong> {order.customer_address}</p> 
      <p><strong>Status:</strong> {order.status}</p>

      <h2>Orderrader</h2> 
      {items.length === 0 ? (
        <p>Inga produkter hittades.</p> 
      ) : (
        <table>
          <thead>
            <tr>
              <th>Produkt</th> 
              <th>Antal</th> 
              <th>Pris vid köp</th> 
              <th>Delsumma</th> 
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.product_id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.price_at_purchase} kr</td>
                <td>{item.subtotal} kr</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Totalt</h2> 
      <p>{order.total} kr</p>

      <p><strong>Skapad:</strong> {new Date(order.created_at).toLocaleString()}</p> 

      <div>
        <p><strong>Status:</strong> {orderStatus}</p>

        <select 
          value={orderStatus} 
          onChange={(e)=>setOrderStatus(e.target.value)}
        >
          <option value={'Ordered'}>Beställd</option> 
          <option value={'Processing'}>Behandlas</option> 
          <option value={'Delivered'}>Levererad</option> 
          <option value={'Refunded'}>Återbetald</option> 
        </select>

        <button onClick={updateStatus}>Uppdatera status</button> 
      </div>

      <Link to="/admin/orders">
        <button>Tillbaka till ordrar</button> 
      </Link>

      <button onClick={handleDelete}>Ta bort order</button> 
    </div>
  );
}

export default AdminOrderDetails;
