import { Link, useParams } from "react-router-dom";
import "../styles/thankyou.css";

const ThankYou = () => {
  const { id } = useParams();

  return (
    <div className="thankyou-page">

      <div className="thankyou-box">
        <div className="thankyou-icon">🎉</div>

        <h1 className="thankyou-title">Tack för din order!</h1>

        <p className="thankyou-order-id">
          Ditt ordernummer: <strong>{id}</strong>
        </p>

        <Link to="/">
          <button className="btn btn-primary thankyou-button">
            Tillbaka till produkter
          </button>
        </Link>
      </div>

    </div>
  );
};

export default ThankYou;
