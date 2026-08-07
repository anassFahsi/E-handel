import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import VariantList from "../components/VariantList";
import AddVariant from "../components/AddVariant";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const fetchProduct = async () => {
    const res = await axios.get(`http://localhost:3000/products/${id}`);
    setProduct(res.data);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (!product) return <p>Laddar produkt...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Produktdetaljer</h2>

      <div>
        <h3>{product.name}</h3>
        <p>Pris: {product.price} kr</p>
        <p>{product.description}</p>

        {product.image_url && (
          <img
            src={product.image_url.startsWith('http')?product.image_url:`http://localhost:3000${product.image_url}`}
            alt={product.name}
            width="200"
            height="200"
          />
        )}
      </div>

      <hr />

      <VariantList productId={product.id} />

      <hr />

      <h3>Lägg till variant</h3>
      <AddVariant productId={product.id} onVariantAdded={fetchProduct} />
    </div>
  );
}

