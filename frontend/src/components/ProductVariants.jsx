import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductVariants({ productId, onVariantSelected }) {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchVariants = async () => {
      const res = await axios.get(
        `http://localhost:3000/products/${productId}/variants`
      );
      setVariants(res.data);
    };

    fetchVariants();
  }, [productId]);

  const handleSelect = (variant) => {
    setSelectedVariant(variant);
    if (onVariantSelected) onVariantSelected(variant);
  };

  return (
    <div className="product-variants">
  <h3 className="section-title">Välj variant</h3>

  {variants.length === 0 && (
    <p className="no-variants-text">Inga varianter tillgängliga.</p>
  )}

  <ul className="variant-list">
    {variants.map((v) => (
      <li key={v.id} className="variant-item">
        <button
          className="btn btn-variant"
          onClick={() => handleSelect(v)}
        >
          {v.size} / {v.color} — Lager: {v.stock}
        </button>
      </li>
    ))}
  </ul>

  {selectedVariant && (
    <p className="selected-variant">
      Vald variant: {selectedVariant.size} / {selectedVariant.color}
    </p>
  )}
</div>

  );
}

