import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const  AdminOrders=() =>{
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search,setSearch]=useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/orders",{params:{search}});
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  

  return (
    <div>
      <h1>Admin - Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
        <input
            type="text" 
            value={search}
            placeholder="Search order by id, customer name or email"
            onChange={(e)=>setSearch(e.target.value)}>
        </input>
         { (loading) &&<p>Loading orders...</p>}
         {(error) &&<p>{error}</p>}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer_name}</td>
                <td>{order.total} kr</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <Link to={`/admin/orders/${order.id}`}>
                    <button>View</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      )}
    </div>
  );
}

export default AdminOrders