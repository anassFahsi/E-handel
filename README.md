# 🛍️ E‑handel – React & Node.js

En modern e‑handelsapplikation byggd med **React (frontend)** och **Node.js/Express (backend)**.  
Projektet innehåller produktlistning, kundvagn, checkout‑flöde och kommunikation med ett REST‑API.

---

## 🚀 Live Demo
🔗 https://fashionhub-live.vercel.app

---

## 📦 Funktioner
- Visa produkter  
- Lägg till / ta bort från kundvagn  
- Visa totalpris  
- Checkout‑flöde  
- API‑kommunikation mellan frontend och backend  

---

## 🧰 Teknisk stack
**Frontend:** React, Vite, CSS  
**Backend:** Node.js, Express  
**Databas:** PostgreSQL  
**Deployment:** Vercel (frontend + backend)

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
Produktimport

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
