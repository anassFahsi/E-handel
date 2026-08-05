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
import ProductPage from './pages/ProductPage';
import axios from 'axios';
import { useEffect, useState } from 'react';

const App = () => {
  const [cartCount, setCartCount] = useState(0);
 
   const fetchCartCount = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/cart/${sessionId}`);
      
        setCartCount(res.data.cartCount);
      } catch (err) {
        console.log("Could not fetch cart count", err);
      }
    };
  useEffect(() => {
   

    fetchCartCount();
  }, [sessionId]);

 
  const addToCart = async (item) => {
    try {
      
      const sessionRes = await axios.post('http://localhost:3000/cart', { sessionId });
      const cartId = sessionRes.data.cartId;

      
      await axios.post('http://localhost:3000/cart/items', {
        cartId,
        productId: item.product.id,
        variantId:item.variantId,
        quantity: 1
      });

      await fetchCartCount();
     

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
          element={<Products />}
        />

      <Route 
        path='/products/:id'
        element={<ProductPage addToCart={addToCart}/>}
        />

        <Route
          path="/cart"
          element={<Cart sessionId={sessionId} handleCartCount={fetchCartCount} />}
        />

        <Route
          path="/checkout"
          element={<Checkout sessionId={sessionId} fetchCartCount={fetchCartCount}/>}
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

