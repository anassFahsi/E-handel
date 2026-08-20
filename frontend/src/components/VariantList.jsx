import { useEffect, useState } from "react";
import axios from "axios";

export default function VariantList({ productId }) {
  const [variants, setVariants] = useState([]);
  const [editing, setEditing] = useState(null);

  const fetchVariants = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `http://localhost:3000/admin/products/${productId}/variants`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setVariants(res.data);
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const deleteVariant = async (variantId) => {
    const token = localStorage.getItem("token");
    await axios.delete(
      `http://localhost:3000/products/variants/${variantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchVariants();
  };

  const saveEdit = async () => {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:3000/admin/variants/${editing.id}`,
      {
        size: editing.size,
        color: editing.color,
        stock: editing.stock
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert('Variant uppdaterades')
    setEditing(null);
    await fetchVariants();
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="admin-variant-list">
  <h3 className="section-title">Varianter</h3>

  <p className="variant-total">
    <strong>Total lager:</strong> {totalStock}
  </p>

  {variants.length === 0 && (
    <p className="no-variants-text">Inga varianter ännu.</p>
  )}

  <ul className="variant-ul">
  {variants.map((v) => (
    <li key={v.id} className="admin-variant-item">
      
      <span className="admin-variant-info">
        {v.size} / {v.color}
      </span>

      <span className={`admin-variant-stock ${v.stock > 0 ? "in" : "out"}`}>
        {v.stock > 0 ? `I lager (${v.stock})` : "Slut i lager"}
      </span>

      <div className="admin-variant-actions">
        <button
          className="btn btn-icon"
          onClick={() => setEditing(v)}
        >
          ✏️
        </button>

        <button
          className="btn btn-danger"
          onClick={() => deleteVariant(v.id)}
        >
          🗑️
        </button>
      </div>

    </li>
  ))}
</ul>


  {/* EDIT MODAL */}
  {editing && (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title">Redigera variant</h3>

        <label className="form-label">Storlek</label>
        <input
          className="form-input"
          value={editing.size}
          onChange={(e) =>
            setEditing({ ...editing, size: e.target.value })
          }
        />

        <label className="form-label">Färg</label>
        <input
          className="form-input"
          value={editing.color}
          onChange={(e) =>
            setEditing({ ...editing, color: e.target.value })
          }
        />

        <label className="form-label">Lager</label>
        <input
          className="form-input"
          type="number"
          value={editing.stock}
          onChange={(e) =>
            setEditing({ ...editing, stock: Number(e.target.value) })
          }
        />

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={saveEdit}>
            Spara
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setEditing(null)}
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  )
}
