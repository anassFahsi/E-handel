import { useParams } from "react-router-dom";

const ThankYou=()=> {
  const { id } = useParams();

  return (
    <div>
      <h1>Tack för din order!</h1>
      <p>Ordernummer: {id}</p>
    </div>
  );
}

export default ThankYou