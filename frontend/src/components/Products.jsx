

import { useEffect, useState } from "react";
import axios from "axios";
import AddProduct from "./AddProduct";
import Product from "./Product";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <p>Laddar produkter...</p>; 
  if (error) return <p>Kunde inte hämta produkter: {error}</p>;

  return (
    <div>
      <h1>Produkter</h1> 

      {products.length === 0 ? (
        <p>Inga produkter hittades.</p>
      ) : (
        <Product products={products} fetchProducts={fetchProducts} />
      )}

      <AddProduct onProductAdded={fetchProducts} />
    </div>
  );
}
