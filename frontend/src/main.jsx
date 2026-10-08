import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx';
import { CurrencyProvider } from './context/CurrencyProvider.jsx';
import { BrowserRouter } from "react-router-dom";
import './styles/global.css';
import "./styles/products.css";
import "./styles/forms.css";
import "./styles/product-page.css";
import "./styles/cart.css";
import "./styles/admin.css";
import "./styles/variants.css";
import "./styles/product-admin-details.css";





createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <CurrencyProvider>
          <App />
      </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

