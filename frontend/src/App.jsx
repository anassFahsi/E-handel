import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Products from "./pages/Products";
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import { useState } from 'react';


const App = () => {
  const [cart,setCart]=useState([])
  const addToCart = (product) => {
  setCart([...cart, product])
   
  };


  return (
    <BrowserRouter>
      <Routes>
        <Route
         path='/' 
         element={<Products  addToCart={addToCart}/>} />

        <Route
         path='/cart' 
         element ={<Cart  cart={cart}/>} />

        <Route path='/admin/products' element={<AdminProducts />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
