import { useState } from "react";
import axios from "axios";

export default function AddProduct({ onProductAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "Basics"
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("category_id", formData.category_id);
    data.append("image", imageFile);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/admin/products",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Produkten lades till')
      setFormData({
        name: "",
        price: "",
        description: "",
        image_url: "",
        category_id: ""
      });

      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error("Error adding product:", err);
      setError(err.message);
    } finally {
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
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          placeholder="Pris" 
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />

        <input
          type="text"
          name="description"
          value={formData.description}
          placeholder="Beskrivning" 
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <select
          value={formData.category_id}
          name="category_id"
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
        >
          <option value="Basics">Basics</option>
          <option value="T-Shirts">T-Shirts</option>
          <option value="Casual">Casual</option>
          <option value="Men">Herr</option> 
          <option value="Clothing">Kläder</option> 
          <option value="Women">Dam</option> 
        </select>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Lägger till..." : "Lägg till"} 
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Fel: {error}</p>}
    </div>
  );
}


