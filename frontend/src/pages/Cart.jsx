import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Cart = ({ sessionId,handleCartCount}) => {
  const[total,setTotal]=useState(0)
  const [items, setItems] = useState([]);
  
    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/cart/${sessionId}`);
        setItems(res.data.items || []);
        setTotal(res.data.total)
      
      } catch (err) {
        console.error("Could not fetch cart", err);
      }
    };

  useEffect(() => {
  

    fetchCart();
  }, [sessionId]);

  
  const removeItem = async (itemId) => {
    if( !confirm('Are you sure you want to remove item?'))
      return

    try {
     await axios.delete(`http://localhost:3000/cart/items/${itemId}`);
      alert('Item removed')
     // setItems(prev => prev.filter(item => item.id !== itemId));
      await fetchCart();
      await handleCartCount();

    } catch (err) {
      console.error("Could not remove item", err);
    }
  };


  return (
    <div>
      <h1>Cart</h1>

      {items.length === 0 && <p>Your cart is empty.</p>}

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.quantity} x {item.name} - {item.price} kr
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h2>Total: {total} kr</h2>

      <Link to="/checkout">
        <button>Go to checkout</button>
      </Link>

      <Link to="/">
        <button>Back to products</button>
      </Link>
    </div>
  );
};

export default Cart;

