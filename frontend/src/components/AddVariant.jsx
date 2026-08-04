import { useState } from "react";
import axios from "axios";

const AddVariant=({ productId, onVariantAdded })=> {
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

    await axios.post(`http://localhost:3000/products/${productId}/variants`, formData);

    setFormData({ size: "", color: "", stock: "" });

    if (onVariantAdded) onVariantAdded();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="size"
        value={formData.size}
        placeholder="Size"
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="color"
        value={formData.color}
        placeholder="Color"
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="stock"
        value={formData.stock}
        placeholder="Stock"
        onChange={handleChange}
        required
      />

      <button type="submit">Add Variant</button>
    </form>
  );
}


export default AddVariant