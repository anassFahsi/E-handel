import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductVariants from "../components/ProductVariants";

const ProductPage = ({ addToCart }) => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`http://localhost:3000/products/${id}`);
      setProduct(res.data);
      console.log(res.data)
     
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  
  const handleAddToCart = () => {
  if (!selectedVariant) {
    alert("Välj en variant först!");
    return;
  }

  if (selectedVariant.stock <= 0) {
    alert("Denna variant är slut i lager!");
    return;
  }

  addToCart({
    productId: product.id,
    variantId: selectedVariant.id,
   
  });
};



  return (
    <div>
      <h1>{product.name}</h1>
      <img  src={product.image_url.startsWith('http')?product.image_url:'http://localhost:3000'+product.image_url}
      width={200}/>
      <p>{product.description}</p>
      <p>Pris: {Number(product.price)} kr</p>
      
      
      <ProductVariants
       productId={product.id}
        onVariantSelected={(variant) => setSelectedVariant(variant)}
      />

      <button onClick={handleAddToCart}>
        Add to cart
    </button>
    </div>
  );
};

export default ProductPage;
