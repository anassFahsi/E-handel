import { useEffect, useState } from "react";
import axios from "axios";

export default function VariantList({ productId }) {
  const [variants, setVariants] = useState([]);
  const [editing, setEditing] = useState(null); 

  const fetchVariants = async () => {
    const res = await axios.get(`http://localhost:3000/products/${productId}/variants`);
    setVariants(res.data);
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const deleteVariant = async (variantId) => {
    await axios.delete(`http://localhost:3000/products/variants/${variantId}`);
    await fetchVariants();
  };

  const saveEdit = async () => {
    await axios.put(`http://localhost:3000/variants/${editing.id}`, {
      size: editing.size,
      color: editing.color,
      stock: editing.stock
    });

    setEditing(null);
    await fetchVariants();
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div>
      <h3>Varianter</h3>

      <p><strong>Total stock:</strong> {totalStock}</p>

      {variants.length === 0 && <p>Inga varianter ännu.</p>}

      <ul>
        {variants.map(v => (
          <li key={v.id}>
            {v.size} / {v.color} — Lager: {v.stock}

            {v.stock === 0 && (
              <span style={{ marginLeft: "10px", color: "red" }}>
                (Slut i lager)
              </span>
            )}

            <button onClick={() => setEditing(v)} style={{ marginLeft: "10px" }}>
              ✏️
            </button>

            <button onClick={() => deleteVariant(v.id)} style={{ marginLeft: "5px" }}>
              🗑️
            </button>
          </li>
        ))}
      </ul>

      {/* EDIT MODAL */}
      {editing && (
        <div style={{
          position: "fixed",
          top: "20%",
          left: "30%",
          width: "40%",
          padding: "20px",
          background: "white",
          border: "1px solid black"
        }}>
          <h3>Edit Variant</h3>

          <label>Size</label>
          <input
            value={editing.size}
            onChange={(e) => setEditing({ ...editing, size: e.target.value })}
          />

          <label>Color</label>
          <input
            value={editing.color}
            onChange={(e) => setEditing({ ...editing, color: e.target.value })}
          />

          <label>Stock</label>
          <input
            type="number"
            value={editing.stock}
            onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
          />

          <div style={{ marginTop: "10px" }}>
            <button onClick={saveEdit}>Save</button>
            <button onClick={() => setEditing(null)} style={{ marginLeft: "10px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

