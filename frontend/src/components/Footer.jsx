import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>👗 FashionHub</h4>
          <p>© {new Date().getFullYear()} 👗 FashionHub</p>
          <p>Alla rättigheter reserverade</p>
        </div>

        <div className="footer-section">
          <h4>Kontakt</h4>
          <p>support@FashionHub.se</p>
          <p>Öppettider: Mån-Fre 09:00-17:00</p>
        </div>

        <div className="footer-section">
          <h4>Följ oss</h4>
          <p>📸 Instagram</p>
          <p>📘 Facebook</p>
          <p>🐦 Twitter</p>
        </div>

        <div className="footer-section">
          <h4>Betalning</h4>
          <div className="payment-row">
            <span className="payment-icon">💳</span> Visa
          </div>
          <div className="payment-row">
            <span className="payment-icon">💳</span> Mastercard
          </div>
          <div className="payment-row">
            <span className="payment-icon">💳</span> Klarna
          </div>
        </div>

        <div className="footer-section">
          <h4>Trygghet</h4>
          <p>🔒 Krypterade betalningar</p>
          <p>🔄 30 dagars öppet köp</p>
          <p>🚚 Snabba leveranser</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;


