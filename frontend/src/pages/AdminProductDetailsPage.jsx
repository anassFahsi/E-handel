import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import VariantList from "../components/VariantList";
import AddVariant from "../components/AddVariant";

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const fetchProduct = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://localhost:3000/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProduct(res.data);
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (!product) return <p>Laddar produkt...</p>; 

  return (
    <div className="product-details-page">

      <h2 className="page-title">Produktdetaljer</h2>

      <div className="product-details-card">
        <h3 className="section-title">{product.name}</h3>

        <p><strong>Pris:</strong> {product.price} kr</p>
        <p><strong>Beskrivning:</strong> {product.description}</p>

        {product.image_url && (
          <img
            className="product-details-image"
            src={
              product.image_url.startsWith('http')
                ? product.image_url
                : `http://localhost:3000${product.image_url}`
            }
            alt={product.name}
          />
        )}
      </div>

      <hr className="divider" />

      <h3 className="section-title">Varianter</h3>
      <VariantList productId={product.id} />

      <hr className="divider" />

      <h3 className="section-title">Lägg till variant</h3>
      <AddVariant productId={product.id} onVariantAdded={fetchProduct} />

      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Tillbaka till produkter
      </button>
    </div>
  );
}


