import { Routes, Route } from 'react-router-dom';
import Products from "./pages/Products";
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import Header from './components/Header';
import Checkout from './pages/Checkout';
import ThankYou from './pages/thankyou';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';
import sessionId from '../../backend/session';
import ProductPage from './pages/ProductPage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AdminProductDetailsPage from './pages/AdminProductDetailsPage';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import UserOrders from './pages/UserOrders';
import ChangePassword from './pages/ChangePassword';
import AdminProfile from './pages/AdminProfile';
import AdminDashboard from './pages/AdminDashBoard';


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
        productId: item.productId,
        variantId:item.variantId,
        quantity: 1
      });

      await fetchCartCount();
     

    } catch (err) {
      console.log('Could not add to cart', err);
    }
  };

  return (
    <>
      <Header cartCount={cartCount} />

      <Routes>
        <Route
          path="/"
          element={<Products />}
        />

        <Route
          path="/products"
          element={<Products />}
        />


      <Route 
        path='/products/:id'
        element={<ProductPage addToCart={addToCart}/>}
        />

        <Route
        path='/admin/products/:id'
        element={<AdminRoute><AdminProductDetailsPage /> </AdminRoute>}
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
          element={<AdminRoute> <AdminProducts /> </AdminRoute>}
        />

        <Route
          path="/admin/orders"
          element={<AdminRoute> <AdminOrders /> </AdminRoute>}
        />

        <Route
          path="/admin/orders/:id"
          element={<AdminRoute> <AdminOrderDetails /> </AdminRoute>}
        />

        <Route
          path='/users/login'
          element={<Login />}
        />

        <Route
          path='/users/register'
          element={<Register />}
        />

        <Route
          path='/users/profile'
          element={<ProtectedRoute> <Profile /> </ProtectedRoute>}
        />
        <Route 
          path="/admin/profile" 
          element={<AdminProfile />} />


        <Route
          path='/users/orders'
          element={<UserOrders />}
         />

        <Route
          path='/users/change-password'
          element={<ChangePassword />}
        />

        <Route
         path="/admin/dashboard" 
         element={<AdminDashboard />}
        />

      </Routes>

      
      <Footer />
    </>
  );
};

export default App;

