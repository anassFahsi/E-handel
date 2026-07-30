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
      const res = await axios.get(`http://localhost:3000/orders/${id}`);
      setOrder(res.data.order);
      setItems(res.data.items);
      setOrderStatus(res.data.order.status);
      
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Could not load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this order?")) return;

  try {
    const res=await axios.delete(`http://localhost:3000/orders/${id}`);
    alert(res.data.message);
    window.location.href = "/admin/orders"; // redirect
  } catch (err) {
    console.error(err);
    alert("Could not delete order");
  }
};

const updateStatus = async () => {
 
  await axios.put(`http://localhost:3000/orders/${order.id}/status`, {status:orderStatus
  });

  alert("Order status updated");
};



  if (loading) return <p>Loading order details...</p>;
  if (error) return <p>{error}</p>;
  if (!order) return <p>No order found.</p>;

  return (
    <div>
      <h1>Order #{order.id}</h1>

      <h2>Customer</h2>
      <p><strong>Name:</strong> {order.customer_name}</p>
      <p><strong>Email:</strong> {order.customer_email}</p>
      <p><strong>Address:</strong> {order.customer_address}</p>
      <p><strong>Status:</strong> {order.status}</p>

      <h2>Order Items</h2>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product </th>
              <th>Quantity</th>
              <th>Price at purchase</th>
              <th>Subtotal</th>
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

      <h2>Total</h2>
      <p>{order.total} kr</p>

      <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
      <div><p><strong>Status:</strong>{orderStatus}</p>
      <select 
           value={orderStatus} 
           onChange={(e)=>setOrderStatus(e.target.value)}>
        <option value={'Ordered'}>Ordered</option>
        <option value={'Processing'}>Processing</option>
        <option value={'Delivered'}>Delivered</option>
        <option value={'Refunded'}>refunded</option>
      </select>
      <button onClick={updateStatus}>Update status</button>
      
      </div>

      <Link to="/admin/orders">
        <button>Back to orders</button>
      </Link>
      <button onClick={handleDelete}>Delete order</button>
    </div>
  );
}

export default AdminOrderDetails