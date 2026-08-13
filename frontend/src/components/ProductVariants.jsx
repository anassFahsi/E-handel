import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductVariants({ productId, onVariantSelected }) {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchVariants = async () => {
      const token=localStorage.getItem('token')
      const res = await axios.get(`http://localhost:3000/products/${productId}/variants`,{headers:{Authorization:`Baerer ${token}`}});
      setVariants(res.data);
    };

    fetchVariants();
  }, [productId]);

  const handleSelect = (variant) => {
    setSelectedVariant(variant);
    if (onVariantSelected) onVariantSelected(variant);
  };

  return (
    <div>
      <h3>Välj variant</h3>

      {variants.length === 0 && <p>Inga varianter tillgängliga.</p>}

      <ul>
        {variants.map(v => (
          <li key={v.id}>
            <button onClick={() => handleSelect(v)}>
              {v.size} / {v.color} — Lager: {v.stock}
            </button>
          </li>
        ))}
      </ul>

      {selectedVariant && (
        <p>
          Vald variant: {selectedVariant.size} / {selectedVariant.color}
        </p>
      )}
    </div>
  );
}
