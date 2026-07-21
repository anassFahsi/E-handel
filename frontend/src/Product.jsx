import axios from "axios"
import { useState } from "react";

const Product = ({products,fetchProducts}) => {
    const [error,setError]=useState(null);

    const handleDelete=async(id)=>{
        
        try{
           await axios.delete(`http://localhost:3000/products/${id}`)
           fetchProducts();
        }
        catch(err){
            console.error('Error deleting product:',err)
            setError(err.message)
        }
        
    }
  return (
    <ul>
         {products.map((p) => (
        <li key={p.id}>
            <strong>{p.name}</strong> – {p.price} kr
            <button onClick={()=>handleDelete(p.id)}>Delete</button>
        </li>
      
        ))}
          {error &&<p style={{color:'red'}}>Could not delete product: {error}</p> }
    </ul>
  )
  }



export default Product
