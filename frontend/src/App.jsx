import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Products from "./pages/Products";
import AdminProducts from './pages/AdminProducts';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Products />} />
          
        <Route path='/admin/products' element={<AdminProducts />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
