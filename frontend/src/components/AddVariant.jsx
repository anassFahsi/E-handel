import { useState } from "react";
import axios from "axios";

const AddVariant = ({ productId, onVariantAdded }) => {
  const [formData, setFormData] = useState({
    size: "",
    color: "",
    stock: ""
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!formData.size || formData.size.length < 1)
      return "Storlek måste fyllas i.";

    if (!formData.color || formData.color.length < 1)
      return "Färg måste fyllas i.";

    if (!formData.stock || Number(formData.stock) <= 0)
      return "Lagerantal måste vara större än 0.";

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    const token = localStorage.getItem("token");

    await axios.post(
      `http://localhost:3000/admin/products/${productId}/variants`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccess("Varianten lades till!");
    setTimeout(() => setSuccess(false), 2500);

    setFormData({ size: "", color: "", stock: "" });

    if (onVariantAdded) onVariantAdded();
  };

  const handleReset = () => {
    setFormData({ size: "", color: "", stock: "" });
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="variant-form-wrapper">

      {success && <div className="success-popup">{success}</div>}
      {error && <p className="error-text">⚠ {error}</p>}

      <form className="variant-form" onSubmit={handleSubmit}>
        <input
          className={`form-input ${error?.includes("Storlek") ? "input-error" : ""}`}
          type="text"
          name="size"
          value={formData.size}
          placeholder="Storlek"
          onChange={handleChange}
        />

        <input
          className={`form-input ${error?.includes("Färg") ? "input-error" : ""}`}
          type="text"
          name="color"
          value={formData.color}
          placeholder="Färg"
          onChange={handleChange}
        />

        <input
          className={`form-input ${error?.includes("Lagerantal") ? "input-error" : ""}`}
          type="number"
          name="stock"
          value={formData.stock}
          placeholder="Lagerantal"
          onChange={handleChange}
        />

        <div className="form-buttons">
          <button className="btn btn-primary" type="submit">
            Lägg till variant
          </button>

          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVariant;

