# 🛍️ E‑handel – React & Node.js

En modern e‑handelsapplikation byggd med **React (frontend)** och **Node.js/Express (backend)**.  
Projektet innehåller produktlistning, kundvagn, checkout‑flöde och kommunikation med ett REST‑API.

---

## 🚀 Live Demo
🔗 https://fashionhub-live.vercel.app

---

## 📦 Funktioner
- Visa produkter
- Produktsökning med Algolia
- Lägg till / ta bort från kundvagn
- Produktimport från extern leverantör (CSV/XML)
- Checkout-flöde
- API-kommunikation mellan frontend och backend

---

## 🧰 Teknisk stack
- Frontend: React, Vite, CSS
- Backend: Node.js, Express
- Databas: PostgreSQL
- Sökning: Algolia
- Deployment: Vercel

---

## ▶️ Utveckling lokalt

```bash
# Starta backend
cd backend
npm install
npm run dev

# Starta frontend
cd ../frontend
npm install
npm run dev

*******
  ***  Produktimport

Shoppen innehåller en produktimport som hämtar produkter från ett externt leverantörs-API i både CSV- och XML-format.

Importen startas från adminsidan via:

Importera CSV
Importera XML

Externa miljövariabler:
Importen använder:
SUPPLIER_API_URL=
SUPPLIER_API_KEY=
SUPPLIER_API_TIMEOUT_MS=
SUPPLIER_BRANSCH=

Se .env.example för samtliga variabler.

***🔎 Produktsökning

Shoppen använder Algolia för fritextsökning.

Funktioner:

Stavfelstolerant sökning (ex. hodie → hoodie)
Pagination
Validering av sökparametrar med Zod
Synkronisering mot produktregistret vid:
skapande av produkt
uppdatering av produkt
borttagning av produkt

Externa miljövariabler:
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_API_KEY=
ALGOLIA_SEARCH_API_KEY=
ALGOLIA_INDEX_NAME=