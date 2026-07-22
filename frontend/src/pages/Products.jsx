import { useState, useEffect } from "react";
import axios from "axios";

const Products = () => {
    const [products, setProducts]=useState([])

    const fetchProducts=async()=>{
        const res=await axios.get('http://localhost:3000/products');
        setProducts(res.data)
    }

    useEffect(()=>{
      fetchProducts();
    },[]);

  return (
    <div>
        <h1>Products</h1>
        <ul>
            {products.map((p)=>(
                <li key={p.id}><strong>{p.name}
                   </strong>- {p.price}
                </li>
                ))}
        </ul>
      
    </div>
  )
}

export default Products
