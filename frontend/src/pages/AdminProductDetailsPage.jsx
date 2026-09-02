import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import VariantList from "../components/VariantList";
import AddVariant from "../components/AddVariant";

export default function AdminProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProduct = async () => {
    const res = await axios.get(`/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProduct(res.data);
  };

  const fetchVariants = async () => {
    const res = await axios.get(`/api/admin/products/${id}/variants`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setVariants(res.data);
  };

  useEffect(() => {
    fetchProduct();
    fetchVariants();
  }, [id]);

  if (!product) return <p>Laddar produkt...</p>;

  return (
    <div className="product-details-page">

      <h2 className="page-title">Produktdetaljer</h2>

      <div className="product-details-card">
        <h3 className="section-title">{product.name}</h3>

        <p>
          <strong>Pris:</strong>
          <span className="admin-product-price"> {product.price} kr</span>
        </p>

        <p><strong>Beskrivning:</strong> {product.description}</p>

        {product.image_url && (
          <img
            className="product-details-image"
            src={product.image_url}
            alt={product.name}
          />
        )}
      </div>

      <hr className="divider" />

      <h3 className="section-title">Varianter</h3>
      <VariantList
        variants={variants}
        fetchVariants={fetchVariants}
      />

      <hr className="divider" />

      <h3 className="section-title">Lägg till variant</h3>
      <AddVariant
        productId={product.id}
        onVariantAdded={fetchVariants}
      />

      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Tillbaka till produkter
      </button>
    </div>
  );
}




