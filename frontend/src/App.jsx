import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Products from "./pages/Products";
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import { useState } from 'react';
import Header from './pages/Header';


const App = () => {
  const [cart,setCart]=useState([])
  
  const addToCart = (product) => {
  setCart(prev=>([...prev, product]))
   
  };

  const removeFromCart=(id)=>{
       setCart(prev=>prev.filter(item=>item.id!==id) );
  }

  


  return (
    <BrowserRouter>
     <Header cartCount={cart.length} />
      <Routes>
        <Route
         path='/' 
         element={<Products  addToCart={addToCart}/>} />

        <Route
         path='/cart' 
         element ={<Cart  cart={cart} removeFromCart={removeFromCart}/>} />

        <Route path='/admin/products' element={<AdminProducts />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
