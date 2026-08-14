import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductVariants from "../components/ProductVariants";

const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`http://localhost:3000/products/${id}`);
      setProduct(res.data);
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <button
        onClick={() =>
          navigate(-1)}
      >
        ← Tillbaka till produkter
      </button>

      <h1>{product.name}</h1>
      <img
        src={
          product.image_url.startsWith("http")
            ? product.image_url
            : "http://localhost:3000" + product.image_url
        }
        width={200}
      />
      <p>{product.description}</p>
      <p>Pris: {Number(product.price)} kr</p>

      <ProductVariants
        productId={product.id}
        onVariantSelected={(variant) => setSelectedVariant(variant)}
      />

      <button
        onClick={() => {
          if (!selectedVariant) return alert("Välj en variant först!");
          if (selectedVariant.stock <= 0) return alert("Slut i lager!");

          addToCart({
            productId: product.id,
            variantId: selectedVariant.id,
          });
        }}
      >
        Add to cart
      </button>
    </div>
  );
};

export default ProductPage;

