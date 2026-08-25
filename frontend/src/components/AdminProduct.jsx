import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Product({ products, fetchProducts }) {
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    imageFile: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [stockMap, setStockMap] = useState({});

  const fetchStock = async () => {
    const token = localStorage.getItem("token");
    const map = {};

    for (const p of products) {
      const res = await axios.get(
        `/api/admin/products/${p.id}/variants`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const variants = res.data;
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      map[p.id] = totalStock;
    }

    setStockMap(map);
  };

  useEffect(() => {
    fetchStock();
  }, [products]);

  const validateEdit = () => {
    if (!editData.name || editData.name.length < 2)
      return "Produktnamnet måste vara minst 2 tecken.";

    if (!editData.price || Number(editData.price) <= 0)
      return "Pris måste vara större än 0.";

    if (!editData.description || editData.description.length < 5)
      return "Beskrivningen måste vara minst 5 tecken.";

    return null;
  };

  const handleDelete = async (id) => {
    if (!confirm("Är du säker att du vill ta bort produkten?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Produkten har tagits bort!");
      setTimeout(() => setSuccess(false), 2500);

      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.message);
    }
  };

  const startEdit = (product) => {
    setEditing(product.id);
    setError(null);
    setSuccess(false);

    setEditData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image_url: product.image_url || "",
      imageFile: null
    });

    setImagePreview(
      product.image_url.startsWith("https")
        ? product.image_url
        : `/api${product.image_url}`
    );
  };

  const resetEdit = () => {
    setEditing(null);
    setEditData({
      name: "",
      price: "",
      description: "",
      image_url: "",
      imageFile: null
    });
    setImagePreview(null);
    setError(null);
    setSuccess(false);
  };

  const handleUpdate = async (id) => {
    setError(null);
    setSuccess(false);

    const validationError = validateEdit();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("price", editData.price);
      formData.append("description", editData.description);
      formData.append("image_url", editData.image_url);

      if (editData.imageFile) {
        formData.append("image", editData.imageFile);
      }

      await axios.put(
        `/api/admin/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSuccess("Produkten uppdaterades!");
      setTimeout(() => setSuccess(false), 2500);

      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message);
    }
  };

  return (
    <div className="admin-product-list">
      {success && <div className="success-popup">{success}</div>}
      {error && <p className="error-text">⚠ {error}</p>}
      
      <ul className="admin-product-ul">
        {products.map((p) => (
          <li key={p.id} className="admin-product-item">
            {editing === p.id ? (
              <div className="admin-product-edit">
                <h3 className="section-title">Redigera produkt</h3>

                <input
                  className={`form-input ${error?.includes("namnet") ? "input-error" : ""}`}
                  type="text"
                  value={editData.name}
                  placeholder="Namn"
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />

                <input
                  className={`form-input ${error?.includes("Pris") ? "input-error" : ""}`}
                  type="number"
                  value={editData.price}
                  placeholder="Pris"
                  onChange={(e) =>
                    setEditData({ ...editData, price: e.target.value })
                  }
                />

                <textarea
                  className={`form-textarea ${error?.includes("Beskrivningen") ? "input-error" : ""}`}
                  value={editData.description}
                  placeholder="Beskrivning"
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />

                <input
                  className="form-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setEditData({ ...editData, imageFile: file });
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />

                {imagePreview && (
                  <img
                    className="admin-product-image"
                    src={imagePreview}
                    alt="Ny bild"
                  />
                )}

                <button className="btn btn-primary" onClick={() => handleUpdate(p.id)}>Spara</button>
                <button className="btn btn-secondary" onClick={resetEdit}>Avbryt</button>

              </div>
            ) : (
              <div className="admin-product-view">
                <Link className="admin-product-link" to={`/admin/products/${p.id}`}>
                  {p.image_url && (
                    <img
                      className="admin-product-image"
                      src={p.image_url}
                      alt="Produktbild"
                    />
                  )}

                  <strong className="admin-product-name">{p.name}</strong>
                  <span className="admin-product-price">{p.price} kr</span>
                </Link>

                {stockMap[p.id] !== undefined && (
                  <span className="admin-product-stock">
                    Lager totalt: {stockMap[p.id]}
                  </span>
                )}

                {stockMap[p.id] === 0 && (
                  <span className="admin-product-outofstock">(Slut i lager)</span>
                )}

                <button className="btn btn-icon" onClick={() => startEdit(p)}>✏️</button>
                <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>🗑️</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}






