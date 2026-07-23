import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Products from "./pages/Products";
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import { useState } from 'react';
import Header from './pages/Header';
import Checkout from './pages/Checkout';
import ThankYou from './pages/thankyou';

const App = () => {
  const [cart,setCart]=useState([])
  
  const addToCart = (product) => {
  setCart(prev=>([...prev, product]))
   
  };

  const removeFromCart=(id)=>{
       setCart(prev=>prev.filter(item=>item.id!==id) );
  }
   
  const clearCart=()=>setCart([])

  return (
    <BrowserRouter>
     <Header cartCount={cart.length} />
      <Routes>
        <Route
          path='/' 
          element={<Products  addToCart={addToCart}/>} 
        />

        <Route
          path='/cart' 
          element ={<Cart  cart={cart} removeFromCart={removeFromCart}/>} 
         />

        <Route 
          path='/admin/  products'     element={<AdminProducts />}
         />

        <Route 
          path='/checkout'
          element={<Checkout cart={cart} total={cart.reduce((sum,item)=>sum+item.price,0)} clearCart={clearCart} />}
        />

        <Route path='/thankyou/:id'
          element={<ThankYou />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
