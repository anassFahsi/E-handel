import { useState,useEffect } from "react";
import axios from "axios";
import AddProduct from "../components/AddProduct";
import Product from "../components/Product";

const AdminProducts = () => {
    const[products,setProducts]=useState([])
  
     const fetchProducts = async () => {
    const res = await axios.get("http://localhost:3000/products");
    console.log(res)
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Admin - Products</h1>

      <AddProduct onProductAdded={fetchProducts} />

      <Product products={products} fetchProducts={fetchProducts} />
    </div>
  );
}

export default AdminProducts
