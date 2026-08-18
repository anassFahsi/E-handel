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
  const [error, setError] = useState(null);

  
  const [stockMap, setStockMap] = useState({});

  const fetchStock = async () => {
    const token = localStorage.getItem("token");
    const map = {};

    for (const p of products) {
      const res = await axios.get(
        `http://localhost:3000/admin/products/${p.id}/variants`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
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

  const handleDelete = async (id) => {
    if (!confirm("Är du säker att du vill ta bort produkten?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert("Produkten tagits bort");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.message);
    }
  };

  const startEdit = (product) => {
    setEditing(product.id);
    setEditData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image_url: product.image_url || "",
      imageFile: null
    });
  };

  
  const handleUpdate = async (id) => {
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
        `http://localhost:3000/admin/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Produkten uppdaterades");
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: "20px" }}>
            {editing === p.id ? (
              <div>
                <h3>Redigera produkt</h3>

                <input
                  type="text"
                  value={editData.name}
                  placeholder="Namn"
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />

                <input
                  type="number"
                  value={editData.price}
                  placeholder="Pris"
                  onChange={(e) =>
                    setEditData({ ...editData, price: e.target.value })
                  }
                />

                <textarea
                  value={editData.description}
                  placeholder="Beskrivning"
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setEditData({ ...editData, imageFile: file });
                  }}
                />

                {editData.image_url && (
                  <img
                    src={
                      editData.image_url.startsWith("https")
                        ? editData.image_url
                        : `http://localhost:3000${editData.image_url}`
                    }
                    alt="Nuvarande bild"
                    width="100"
                  />
                )}

                <button onClick={() => handleUpdate(p.id)}>Spara</button>
                <button onClick={() => setEditing(null)}>Avbryt</button>
              </div>
            ) : (
              <>
                {p.image_url && (
                  <img
                    src={
                      p.image_url.startsWith("https")
                        ? p.image_url
                        : `http://localhost:3000${p.image_url}`
                    }
                    alt="Produktbild"
                    width="100"
                  />
                )}

                <Link to={`/admin/products/${p.id}`}>
                  <strong>{p.name}</strong> — {p.price} kr
                </Link>

                {stockMap[p.id] !== undefined && (
                  <span style={{ marginLeft: "10px" }}>
                    Lager totalt: {stockMap[p.id]}
                  </span>
                )}

                {stockMap[p.id] === 0 && (
                  <span style={{ marginLeft: "10px", color: "red" }}>
                    (Slut i lager)
                  </span>
                )}

                <button
                  onClick={() => startEdit(p)}
                  style={{ marginLeft: "10px" }}
                >
                  ✏️
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ marginLeft: "5px" }}
                >
                  🗑️
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {error && <p style={{ color: "red" }}>Fel: {error}</p>}
    </div>
  );
}




