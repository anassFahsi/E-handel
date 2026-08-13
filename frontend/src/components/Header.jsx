import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Header = ({ cartCount }) => {
  const { isAdmin, token, logout } = useContext(AuthContext);

  return (
    <header>
      <nav>
        <Link to="/">Products</Link>
        {" | "}
        <Link to="/cart">Cart ({cartCount})</Link>
        {" | "}

        {token ? (
          <>
            <Link to="/users/profile">Profile</Link>

            {isAdmin && (
              <>
                {" | "}
                <Link to="/admin/products">Admin Products</Link>
                {" | "}
                <Link to="/admin/orders">Admin Orders</Link>
              </>
            )}

            {" | "}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/users/login">Login</Link>
            {" | "}
            <Link to="/users/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;

