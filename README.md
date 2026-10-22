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
- Betalning med Stripe Checkout
- Orderhantering och lageruppdatering
- API-kommunikation mellan frontend och backend

---

## 🧰 Teknisk stack
Frontend: React, Vite, CSS
Backend: Node.js, Express
Databas: PostgreSQL
Sökning: Algolia
Betalning: Stripe
Deployment: Vercel

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

💳 Betalning med Stripe

Shoppen använder Stripe Checkout i testläge för säkra betalningar.

Funktioner
Stripe Checkout (hosted)
Order skapas som Obetald innan betalning
Priser hämtas från databasen på servern
Stripe Checkout Session kopplas till ordern via client_reference_id
Signaturverifierad webhook
Order markeras som Betald först när Stripe bekräftar betalningen
Lagersaldo minskas automatiskt efter genomförd betalning
Utgångna betalningssessioner markeras som Avbrutna
Bekräftelsesida som visar orderstatus

Externa miljövariabler:
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
CLIENT_URL=

Testkort
4242 4242 4242 4242