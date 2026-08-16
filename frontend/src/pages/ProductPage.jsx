import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductVariants from "../components/ProductVariants";

const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [canReview, setCanReview] = useState(false);
 


  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(`http://localhost:3000/products/${id}`);
      setProduct(res.data);
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await axios.get(`http://localhost:3000/reviews/${id}`);
      setReviews(res.data);
    
    };

    fetchReviews();
  }, [id]);

 useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const check = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/reviews/can-review/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setCanReview(res.data.canReview);
      console.log(res.data.canReview)
    } catch (err) {
      console.error(err);
    }
  };

  check();
}, [id]);


  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token =localStorage.getItem('token');
   

    try {
      await axios.post(
  "http://localhost:3000/reviews",
  {
    product_id: id,
    rating,
    comment,
  },{
    headers:{Authorization:`Bearer ${token}`}
  }
);


    
      const res = await axios.get(`http://localhost:3000/reviews/${id}`);
      setReviews(res.data);

     
      setRating(5);
      setComment("");
    } catch (err) {
      console.error(err);
      alert("Kunde inte skicka recension");
    }
  };

  if (!product) return <p>Laddar...</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>
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
        Lägg i kundvagn
      </button>

      <div className="reviews" style={{ marginTop: "30px" }}>
        <h3>Recensioner</h3>

        {reviews.length === 0 && <p>Inga recensioner ännu.</p>}

        {reviews.map((r) => (
          <div key={r.id} className="review" style={{ marginBottom: "15px" }}>
            <strong>{r.user_name}</strong>
             {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{
               color: i < r.rating ? "gold" : "#ccc",
               fontSize: "20px",
               marginRight: "3px"
              }}
             >
               ★
           </span>
          ))}
            <p>{r.comment}</p>
            <small>{new Date(r.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
 
      {localStorage.getItem('token') && canReview &&
      <div style={{ marginTop: "30px" }}>
        <h3>Skriv en recension</h3>

        <form onSubmit={handleSubmitReview}>
          <label>Betyg</label>
          <div style={{ marginBottom: "10px" }}>
           {Array.from({ length: 5 }).map((_, i) => (
           <span
              key={i}
              onClick={() => setRating(i + 1)}
              style={{
              cursor: "pointer",
              fontSize: "24px",
              color: i < rating ? "gold" : "#ccc",
              marginRight: "5px"
              }}
           >
             ★
          </span>
         ))}
        </div>

          <label>Kommentar</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
          />

          <button type="submit" style={{ marginTop: "10px" }}>
            Skicka recension 
          </button>
        </form>
      </div>}
    </div>
  );
};

export default ProductPage;

