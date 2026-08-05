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

  const deleteVariant=async(variant)=>{
      await axios.delete(`http://localhost:3000/products/variants/${variant}`);
      await fetchVariants();
  };

  const editVariant=async(variant)=>{
    const newSize=prompt('New size:',variant.size);
    const newColor=prompt('New color:',variant.color);
    const newStock=prompt('New stock:', variant.stock);

    await axios.put(`http://localhost:3000/variants/${variant.id}`,{size:newSize,color:newColor, stock:newStock});
    await fetchVariants();

  }

  return (
    <div>
      <h3>Varianter</h3>

      {variants.length === 0 && <p>Inga varianter ännu.</p>}

      <ul>
        {variants.map(v => (
          <li key={v.id}>
            {v.size} / {v.color} — Lager: {v.stock}
            <button onClick={()=>editVariant(v)}>Edit</button>
            <button onClick={()=>deleteVariant(v.id)}></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
