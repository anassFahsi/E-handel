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

 
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState(null);

  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState(null);


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
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCanReview(res.data.canReview);
      } catch (err) {
        console.error(err);
      }
    };

    check();
  }, [id]);

  // SUBMIT REVIEW
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3000/reviews",
        { product_id: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(`http://localhost:3000/reviews/${id}`);
      setReviews(res.data);

      setRating(5);
      setComment("");

      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 2500);

    } catch (err) {
      console.error(err);
      setReviewError("Kunde inte skicka recension");
      setTimeout(() => setReviewError(null), 2500);
    }
  };

  if (!product) return <p>Laddar...</p>;

  return (
    <div className="product-page">

    
      {cartSuccess && (
        <div className="success-popup">
          Produkten lades i kundvagnen!
        </div>
      )}

   
      {cartError && (
        <div className="error-popup">
          {cartError}
        </div>
      )}

   
      {reviewSuccess && (
        <div className="success-popup">
          Recension skickad!
        </div>
      )}

      {reviewError && (
        <div className="error-popup">
          {reviewError}
        </div>
      )}

      <h1 className="product-title">{product.name}</h1>

      <img
        className="product-image"
        src={
          product.image_url.startsWith("http")
            ? product.image_url
            : "http://localhost:3000" + product.image_url
        }
        alt={product.name}
      />

      <p className="product-description">{product.description}</p>
      <p className="product-price">Pris: {Number(product.price)} kr</p>

      <ProductVariants
        productId={product.id}
        onVariantSelected={(variant) => setSelectedVariant(variant)}
      />

      <button
        className="btn btn-primary add-to-cart-btn"
        onClick={() => {
          if (!selectedVariant) {
            setCartError("Välj en variant först!");
            setTimeout(() => setCartError(null), 2500);
            return;
          }

          if (selectedVariant.stock <= 0) {
            setCartError("Slut i lager!");
            setTimeout(() => setCartError(null), 2500);
            return;
          }

          addToCart({
            productId: product.id,
            variantId: selectedVariant.id,
          });

          setCartSuccess(true);
          setTimeout(() => setCartSuccess(false), 2500);
        }}
      >
        Lägg i kundvagn
      </button>

      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        ← Tillbaka till produkter
      </button>

    
      <div className="reviews-section">
        <h3 className="reviews-title">Recensioner</h3>

        {reviews.length === 0 && <p>Inga recensioner ännu.</p>}

        {reviews.map((r) => (
          <div key={r.id} className="review-item">
            <strong className="review-author">{r.user_name}</strong>

            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`star ${i < r.rating ? "star-filled" : "star-empty"}`}
                >
                  ★
                </span>
              ))}
            </div>

            <p className="review-comment">{r.comment}</p>
            <small className="review-date">
              {new Date(r.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>

     
      {localStorage.getItem("token") && canReview && (
        <div className="review-form-section">
          <h3 className="review-form-title">Skriv en recension</h3>

          <form className="review-form" onSubmit={handleSubmitReview}>
            <label className="form-label">Betyg</label>

            <div className="review-stars-select">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  onClick={() => setRating(i + 1)}
                  className={`star-select ${i < rating ? "star-filled" : "star-empty"}`}
                >
                  ★
                </span>
              ))}
            </div>

            <label className="form-label">Kommentar</label>
            <textarea
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
            />

            <button className="btn btn-primary" type="submit">
              Skicka recension
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default ProductPage;



