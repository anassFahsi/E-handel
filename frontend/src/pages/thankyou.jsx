import { Link, useParams } from "react-router-dom";

const ThankYou = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Tack för din order!</h1> 
      <p>Ditt ordernummer: {id}</p> 
      <Link to="/">
        <button>
          Tillbaka till produkter 
        </button>
      </Link>
    </div>
  );
};

export default ThankYou;
