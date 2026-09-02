import axios from "axios";
import { useState, useEffect } from "react";

export default function VariantList({ variants, fetchVariants }) {
  const [editing, setEditing] = useState(null);
  const [success,setSuccess]=useState(false);
  const [error, setError]=useState(null)

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const deleteVariant = async (variantId) => {
    try{
       await axios.delete(
      `/api/admin/products/variants/${variantId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSuccess('Varianten har tagits bort');
    setTimeout(() => setSuccess(false), 1500);
    await fetchVariants();
    }
   catch(error){
    console.error(error);
      setError('Kunde inte ta bort varianten');
      setTimeout(()=>setError(null),1500)
   }
  };

  const saveEdit = async () => {
    try{
       await axios.put(
      `/api/admin/variants/${editing.id}`,
      {
        size: editing.size,
        color: editing.color,
        stock: editing.stock
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSuccess("Varianten uppdaterades");
    setTimeout(()=>setSuccess(false),1500)
    setEditing(null);
    await fetchVariants();
    }
    catch (error) {
      console.error(error);
      setError('Kunde inte uppdatera varianten');
      setTimeout(()=>setSuccess(false),1500);
    }
   
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="admin-variant-list">
       {success && <div className="success-popup">{success}</div>}
      {error && <p className="error-text">⚠ {error}</p>}

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
              min={1}
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
  );
}



