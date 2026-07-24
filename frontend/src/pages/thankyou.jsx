import { Link, useParams } from "react-router-dom";

const ThankYou=()=> {
  const { id } = useParams();

 return (
  <div>
    <h1>Thank you for your order!</h1>
    <p>Your order number: {id}</p>
    <Link to='/'>
      <button>Back to products
      </button>
      </Link>
  </div>
);

}

export default ThankYou