import { useState, useEffect } from "react";
import axios from "axios";
import AddProduct from "../components/AddProduct";
import AdminProduct from "../components/AdminProduct";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:3000/admin/products", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res);
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="admin-products-page">
  <h1 className="page-title">Admin - Produkter</h1>

  <AddProduct onProductAdded={fetchProducts} />

  <AdminProduct products={products} fetchProducts={fetchProducts} />
</div>

  );
};

export default AdminProducts;

