import { useState } from "react";
import axios from "axios";

export default function AddProduct({ onProductAdded }) {
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post("http://localhost:3000/products", formData);
      setFormData({ name: "", price: "" });
      if (onProductAdded) onProductAdded(); // uppdaterar listan i Products.jsx
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
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          placeholder="Pris"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Lägger till..." : "Lägg till"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Fel: {error}</p>}
    </div>
  );
}

