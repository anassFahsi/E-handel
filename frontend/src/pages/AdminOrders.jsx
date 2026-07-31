import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


const  AdminOrders=() =>{
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const [limit,setLimit]=useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/orders",{params:{search,page,limit}});

      setOrders(res.data.orders);
     
      setTotalPages(res.data.pages);

    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, page,limit]);

  useEffect(()=>{
    setPage(1);},[limit,search]
  )

  

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
        <select value={limit} 
            onChange={(e)=>{setLimit(Number(e.target.value));setPage(1)}}>
          <option value='5'>
              5 per page
          </option>
          <option value='10'>
              10 per page
          </option>
          <option value='20'>
              20 per page
          </option>

        </select>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
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
                <td>{order.status}</td>
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
      <div>
        <button disabled={page===1}
        onClick={()=>setPage(page-1)}
        >Previous</button>
        <span>Page {page}of {totalPages}</span>
        <button disabled={page===totalPages}
        onClick={()=>setPage(page+1)}
        >Next</button>
      </div>
    </div>
  );
}

export default AdminOrders