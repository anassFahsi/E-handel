import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Products from "./pages/Products";
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import Header from './pages/Header';
import Checkout from './pages/Checkout';
import ThankYou from './pages/thankyou';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';
import sessionId from '../../backend/session';
import axios from 'axios';
import { useEffect, useState } from 'react';

const App = () => {
  const [cartCount, setCartCount] = useState(0);

  // ⭐ fetch cartCount from backend
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/cart/${sessionId}`);
        const items = res.data.items || [];
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } catch (err) {
        console.log("Could not fetch cart count", err);
      }
    };

    fetchCartCount();
  }, []);

  // ⭐ AddToCart — backend only
  const addToCart = async (product) => {
    try {
      
      const sessionRes = await axios.post('http://localhost:3000/cart', { sessionId });
      const cartId = sessionRes.data.cartId;

      
      await axios.post('http://localhost:3000/cart/items', {
        cartId,
        productId: product.id,
        quantity: 1
      });

      
      setCartCount(prev => prev + 1);

    } catch (err) {
      console.log('Could not add to cart', err);
    }
  };

  return (
    <BrowserRouter>
      <Header cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={<Products addToCart={addToCart} />}
        />

        <Route
          path="/cart"
          element={<Cart sessionId={sessionId} />}
        />

        <Route
          path="/checkout"
          element={<Checkout sessionId={sessionId} />}
        />

        <Route
          path="/thankyou/:id"
          element={<ThankYou />}
        />

        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        <Route
          path="/admin/orders/:id"
          element={<AdminOrderDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

