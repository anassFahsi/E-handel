import { useState } from "react";
import axios from "axios";

const AddVariant = ({ productId, onVariantAdded }) => {
  const [formData, setFormData] = useState({
    size: "",
    color: "",
    stock: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    await axios.post(
      `http://localhost:3000/admin/products/${productId}/variants`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setFormData({ size: "", color: "", stock: "" });

    if (onVariantAdded) onVariantAdded();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="size"
        value={formData.size}
        placeholder="Storlek" 
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="color"
        value={formData.color}
        placeholder="Färg"
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="stock"
        value={formData.stock}
        placeholder="Lagerantal" 
        onChange={handleChange}
        required
      />

      <button type="submit">Lägg till variant</button> 
    </form>
  );
};

export default AddVariant;
