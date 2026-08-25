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
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      return "Produktnamnet måste vara minst 2 tecken.";
    }
    if (!formData.price || Number(formData.price) <= 0) {
      return "Pris måste vara större än 0.";
    }
    if (!formData.description || formData.description.length < 5) {
      return "Beskrivningen måste vara minst 5 tecken.";
    }
    if (!formData.category_id) {
      return "Du måste välja en kategori.";
    }
    if (!imageFile) {
     return "Du måste välja en produktbild.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("category_id", formData.category_id);
    data.append("image", imageFile);
  
    try {
      const token = localStorage.getItem("token");

      await axios.post("/api/admin/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      })

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      setFormData({
        name: "",
        price: "",
        description: "",
        category_id: "Basics"
      });

      setImageFile(null);
      setImagePreview(null);

      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error("Error adding product:", err);

if (err.response) {
  console.log("Backend error:", err.response.data);
  setError(err.response.data.error || "Kunde inte lägga till produkten.");
} else {
  setError("Nätverksfel eller servern svarar inte.");
}

   
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category_id: "Basics"
    });
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="add-product">
      <h2 className="section-title">Lägg till produkt</h2>

    

      <form className="form" onSubmit={handleSubmit}>
        <input
          className={`form-input ${error?.includes("namnet") ? "input-error" : ""}`}
          type="text"
          name="name"
          value={formData.name}
          placeholder="Produktnamn"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <input
          className={`form-input ${error?.includes("Pris") ? "input-error" : ""}`}
          type="number"
          name="price"
          value={formData.price}
          placeholder="Pris"
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />

        <input
          className={`form-input ${error?.includes("Beskrivningen") ? "input-error" : ""}`}
          type="text"
          name="description"
          value={formData.description}
          placeholder="Beskrivning"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <select
          className={`form-select ${error?.includes("kategori") ? "input-error" : ""}`}
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
          className={`form-file ${error?.includes("bild") ? "input-error" : ""}`}
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
          }}
        />

        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="image-preview" />
        )}

        <div className="form-buttons">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Lägger till..." : "Lägg till"}
          </button>

          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {error && <p className="error-text">⚠ {error}</p>}
        {success && (
        <div className="success-popup">
          ✔ Produkten lades till!
        </div>
      )}
    </div>
  );
}




