import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Header = ({ cartCount }) => {
  const { isAdmin, token, logout } = useContext(AuthContext);

  return (
    <header>
      <nav>
        <Link to="/">Produkter</Link> 
        {" | "}
        <Link to='/cart' style={{ position: "relative", fontSize: "22px" }}>
  🛒
  {cartCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: "-8px",
        right: "-12px",
        background: "red",
        color: "white",
        borderRadius: "50%",
        padding: "2px 6px",
        fontSize: "12px"
      }}
    >
      {cartCount}
    </span>
  )}
</Link>

        {" | "}

        {token ? (
          <>
            <Link to="/users/profile">Profil</Link> 

            {isAdmin && (
              <>
                {" | "}
                <Link to="/admin/products">Admin - Produkter</Link> 
                {" | "}
                <Link to="/admin/orders">Admin - Ordrar</Link>
              </>
            )}

            {" | "}
            <button onClick={logout}>Logga ut</button> 
          </>
        ) : (
          <>
            <Link to="/users/login">Logga in</Link> 
            {" | "}
            <Link to="/users/register">Registrera</Link> 
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;


