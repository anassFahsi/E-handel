import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
const Products = ({addToCart}) => {
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
                   <button onClick={()=>addToCart(p)}>Add to cart</button>
                </li>
                ))}
        </ul>
      <Link to={'/cart'}>Go to cart.</Link>
    </div>
  )
}

export default Products
