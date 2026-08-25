import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/header.css";

const Header = ({ cartCount }) => {
  const { isAdmin, token, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`header ${menuOpen ? "menu-open" : ""}`}>

      <nav className="nav-left desktop-only">
        <Link className="nav-link" to="/">Produkter</Link>

        {isAdmin && (
          <>
            <Link className="nav-link" to="/admin/products">Admin - Produkter</Link>
            <Link className="nav-link" to="/admin/orders">Admin - Ordrar</Link>
            <Link className="nav-link" to="/admin/dashboard">Admin-Dashboard</Link>
          </>
        )}
      </nav>

      <div className="logo">👗 FashionHub</div>

      <nav className="nav-right desktop-only">
        

        {token ? (
          <>
            <Link className="nav-link" to={isAdmin ? "/admin/profile" : "/users/profile"}>
              Profil
            </Link>
            <button className="btn btn-secondary" onClick={logout}>Logga ut</button>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/users/login">Logga in</Link>
            <Link className="nav-link" to="/users/register">Registrera</Link>
          </>
        )}
      </nav>

      <button className="hamburger mobile-only" onClick={toggleMenu}>
        ☰
      </button>

    

      <div className={`mobile-menu mobile-only ${menuOpen ? "open" : ""}`}>
        <button className="close-menu" onClick={closeMenu}>✕</button>

        <Link className="mobile-link" to="/" onClick={closeMenu}>Produkter</Link>

       <Link className="mobile-link-cart" to="/cart" onClick={closeMenu}>
         🛒
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>

        {token ? (
          <>
            <Link className="mobile-link" to={isAdmin ? "/admin/profile" : "/users/profile"} onClick={closeMenu}>
              Profil
            </Link>

            {isAdmin && (
              <>
                <Link className="mobile-link" to="/admin/products" onClick={closeMenu}>Admin - Produkter</Link>
                <Link className="mobile-link" to="/admin/orders" onClick={closeMenu}>Admin - Ordrar</Link>
                <Link className="mobile-link" to="/admin/dashboard" onClick={closeMenu}>Admin - Dashboard</Link>
              </>
            )}

            <button className="mobile-link logout" onClick={() => { logout(); closeMenu(); }}>
              Logga ut
            </button>
          </>
        ) : (
          <>
            <Link className="mobile-link" to="/users/login" onClick={closeMenu}>Logga in</Link>
            <Link className="mobile-link" to="/users/register" onClick={closeMenu}>Registrera</Link>
          </>
        )}
        
      </div>
      <Link className="nav-cart" to="/cart">
          🛒
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>

    </header>
  );
};

export default Header;













