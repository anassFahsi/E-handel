import { useState } from "react";
import axios from "axios";

export default function AddProduct({ onProductAdded }) {
  const [formData, setFormData] = useState({ name: "", price: "",description:'',category_id:'Basics'});
  const[imageFile,setImageFile]=useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const handleSubmit = async (e) => {
    console.log('skickat data')
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data=new FormData();
    data.append('name',formData.name)
    data.append('price',formData.price)
    data.append('description',formData.description)
    data.append('category_id',formData.category_id)
    data.append('image',imageFile)

    try {
      const res=await axios.post("http://localhost:3000/products", 
        data,{
        headers:{"Content-Type": "multipart/form-data"
                    }
                }
      );
      console.log(res.data)
      setFormData({ name: "", price: "",description:'',image_url:'',category_id:''});
      if (onProductAdded) onProductAdded(); 
    } 
      catch (err) {
      console.error("Error adding product:", err);
      setError(err.message);
    }
     finally {
      setLoading(false);
      }
    };

  return (
    <div>
      <h2>Lägg till produkt</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Produktnamn"
          onChange={(e)=>setFormData({...formData,name:e.target.value})}
          required
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          placeholder="Pris"
          onChange={(e)=>setFormData({...formData,price:e.target.value})}
        />

        <input 
        type='text'
        name='description'
        value={formData.description}
        placeholder='Description'
        onChange={(e)=>setFormData({...formData,description:e.target.value})}>
        </input>

        <select  
            value={formData.category_id} 
            name='category_id'
            onChange={(e)=>setFormData({...formData,category_id:e.target.value})}
            >
              <option value='Basics' >
                Basics
              </option>

              <option value='T-Shirts'>
                T-Shirts
              </option>
             
              <option  value='Casual'>
                Casual
              </option>

              <option  value='Men'>
                Men
              </option>

              <option value='Clothing'>
                Clothing
              </option>

              <option value='Women'>
                Women
              </option>

             
        </select>

        <input 
             type='file'
             name='image'
             accept='image/*'
             onChange={(e) => setImageFile(e.target.files[0])
                     }
        >
        </input>
      
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Fel: {error}</p>}
    </div>
  );
}

