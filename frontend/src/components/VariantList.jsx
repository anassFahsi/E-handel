import { useEffect, useState } from "react";
import axios from "axios";

export default function VariantList({ productId }) {
  const [variants, setVariants] = useState([]);

  const fetchVariants = async () => {
    const res = await axios.get(`http://localhost:3000/products/${productId}/variants`);
    setVariants(res.data);
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  return (
    <div>
      <h3>Varianter</h3>

      {variants.length === 0 && <p>Inga varianter ännu.</p>}

      <ul>
        {variants.map(v => (
          <li key={v.id}>
            {v.size} / {v.color} — Lager: {v.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}
