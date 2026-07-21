import axios from "axios";
import { useState } from "react";

const  Product=({ products, fetchProducts }) =>{
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", price: "" });

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err.message);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditData({ name: product.name, price: product.price });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:3000/products/${id}`, editData);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err.message);
    }
  };

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {editingId === p.id ? (
            <>
              <input
                type="text"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
              <input
                type="number"
                value={editData.price}
                onChange={(e) =>
                  setEditData({ ...editData, price: e.target.value })
                }
              />
              <button onClick={() => handleUpdate(p.id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <strong>{p.name}</strong> – {p.price} kr
              <button onClick={() => startEdit(p)}>Edit</button>
              <button onClick={() => handleDelete(p.id)}>Delete</button>
            </>
          )}
        </li>
      ))}

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </ul>
  );
}




export default Product
