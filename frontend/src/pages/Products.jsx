import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Products = () => {
    const [products, setProducts]=useState([])

    const fetchProducts=async()=>{
        const res=await axios.get('http://localhost:3000/products');
        setProducts(res.data.map(p=>({...p,price:Number(p.price)})))
    }

    useEffect(()=>{
      fetchProducts();
    },[]);

  return (
    <div>
        <h1>Products</h1>
        <ul>
            {products.map((p)=>(
               <li key={p.id}>
                <Link to={`/products/${p.id}`}>
                   <strong>{p.name}</strong> - {p.price} kr
                   <img src={p.image_url.startsWith('http')?p.image_url:'http://localhost:3000'+p.image_url}
                      alt={p.name}
                      width='200'/>
               </Link>
              </li>

                ))}
        </ul>
      
    </div>
  )
}

export default Products
