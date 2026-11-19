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
- Bildlagring: Cloudinary
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

```
--- 

##   Produktimport

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

## 🔎 Produktsökning

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

## 💳 Betalning med Stripe

Shoppen använder Stripe Checkout i testläge för säkra betalningar.

Funktioner:

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

## 🖼️ Produktbilder
Shoppen använder Cloudinary för lagring av produktbilder i molnet.

Funktioner: 

Uppladdning av produktbilder via backend
Endast JPEG- och PNG-filer accepteras
Maximal filstorlek: 4 MB
Bilder lagras i Cloudinary
Bildens URL sparas i databasen
Bilder visas i produktlistan och på produktsidan
Vid byte av bild laddas den nya bilden upp innan den gamla tas bort
Den gamla bilden behålls om uppladdningen misslyckas
Begripliga felmeddelanden vid ogiltig filtyp eller för stor fil
Externa miljövariabler
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

## 🚚 PostNord Integration (Labb 5)
Shoppen använder PostNords API för att hämta närmaste ombud och beräknad leveranstid direkt i kassan.

Funktioner:

Kunden anger sitt postnummer
Närmaste PostNord-ombud hämtas via backend
Kunden kan välja ett ombud från listan
Backend verifierar att valt ombud tillhör det aktuella postnumret
Beräknad leveranstid hämtas från PostNords Transit Time API
Fraktpriset beräknas på servern
Fri frakt vid köp över 500 kr
Frakten ingår i Stripe Checkout
Ombud och fraktinformation sparas på ordern
PostNords svar valideras med Zod
Timeout och felhantering används för alla API-anrop
Miljövariabler:
POSTNORD_API_KEY=
SHOP_POSTAL_CODE=

🤖 AI-användning

PostNord-integrationen utvecklades med hjälp av Microsoft Copilot och ChatGPT.

Exempel på prompts

Prompt 1

Skriv en Express-adapter för PostNords API som hämtar de närmaste ombuden för ett postnummer.
Använd fetch, timeout och felhantering.

Prompt 2

Skapa ett Zod-schema för validering av PostNords svar från Service Point API.

Prompt 3

Hur hämtar man beräknad leveranstid från PostNords Transit Time API?

Prompt 4

Hur verifierar man att det ombud som skickas från frontend faktiskt finns bland ombuden för det aktuella postnumret?
Vad AI föreslog

AI föreslog:

En separat postNordAdapter.js
Hämtning av service points via backend
Leveranstidsberäkning via Transit Time API
Validering av API-svar med Zod
Timeout med AbortSignal.timeout()
Verifiering av valt ombud på serversidan
Kontroll mot PostNords dokumentation

Den kod som genererades av AI jämfördes med PostNords officiella dokumentation.

Följande kontrollerades:

Rätt endpoint för Service Point API
Rätt endpoint för Transit Time API
Obligatoriska parametrar
API-nyckel i query string
Struktur på API-svaren
Vilka fält som innehåller leveranstid (timeOfArrival)
Hantering av felkoder och timeout
Anpassningar efter dokumentationen

Följande ändringar gjordes efter kontroll mot PostNords dokumentation:

Eget Zod-schema skapades utifrån det faktiska API-svaret
Endast de fält som används i shoppen valideras
Validering av service point på serversidan lades till
Egna fraktpriser implementerades på backend
Fri frakt lades till för ordervärden över 500 kr
Leveranstid hämtas från Transit Time API och visas i checkouten
Slutsats

AI användes för att generera ett första förslag på implementationen, men samtliga endpointer, parametrar och svar verifierades mot PostNords dokumentation innan de användes i projektet.

                                    Reflektion
                                    ********
1. Vilken integrationsmodell använder varje tjänst och varför passar den?
I projektet har jag integrerat flera externa tjänster med olika integrationsmodeller.

Produktimporten använder REST API-anrop för att hämta CSV- och XML-data från en extern leverantör. Detta passar bra eftersom leverantören publicerar sitt sortiment i dessa format och datan kan hämtas och uppdateras automatiskt.

Algolia använder REST-baserade API-anrop för indexering och sökning. Det passar bra eftersom sökningar måste vara snabba och kunna hantera fritext, filtrering, sortering och paginering.

Stripe använder både redirect och webhook. Kunden omdirigeras till Stripes betalningssida för att genomföra betalningen, medan webhooken används för att bekräfta betalningen och uppdatera orderstatus på serversidan. Detta är säkrare än att lita på information från frontend.

Cloudinary använder ett SDK tillsammans med REST-kommunikation bakom kulisserna. SDK:n förenklar uppladdning, lagring och borttagning av produktbilder.

PostNord använder REST API-anrop för att hämta ombud och beräknad leveranstid. Detta passar bra eftersom informationen behöver hämtas i realtid baserat på kundens postnummer.

2. Varför går anropen till externa tjänster via Express och inte direkt från React?
Alla externa anrop går via Express eftersom API-nycklar och andra hemligheter inte får exponeras för användaren. Om React skulle anropa externa tjänster direkt skulle API-nycklar kunna ses i webbläsaren.

Backend fungerar därför som ett mellanlager mellan frontend och externa tjänster. React kommunicerar endast med mina egna API-endpoints och backend ansvarar för autentisering, validering, felhantering och omvandling av data.

Det ger också bättre kontroll över affärslogiken. Exempelvis beräknas fraktpriser och orderbelopp på serversidan istället för i React.

3. Varför är det bättre att integrera tjänsterna än att bygga dem själv?
Att bygga egna motsvarigheter till dessa tjänster skulle kräva mycket arbete.

Att bygga en egen sökmotor motsvarande Algolia skulle kräva indexering, relevansrankning, filtrering, sortering och optimering för prestanda.

En egen betalningslösning motsvarande Stripe skulle innebära hantering av kortbetalningar, säkerhetskrav, PCI-DSS, återbetalningar och bedrägeriskydd. Det skulle vara både komplicerat och riskfyllt.

Att bygga en egen molnlagring motsvarande Cloudinary skulle kräva filhantering, bildoptimering, CDN och hantering av stora mängder filer.

För PostNord skulle det vara omöjligt att själv upprätthålla aktuell information om ombud och leveranstider utan tillgång till transportnätverket.

Genom att använda etablerade tjänster får jag tillgång till funktionalitet som redan är testad, säker och underhållen.

4. Vad händer om tjänsterna är nere och hur har det hanterats?
Alla externa integrationer använder timeout och felhantering.

Om leverantörens produktdata inte kan hämtas avbryts importen och ett fel loggas.

Om Algolia är nere fungerar inte sökningen korrekt, men webbshoppen kan fortfarande användas.

Om Cloudinary är nere kan nya bilder inte laddas upp, och i vissa fall inte visas.

Om Stripe är nere kan kunden inte slutföra en betalning. Ordern markeras då inte som betald eftersom betalstatus hanteras via webhooken.

Om PostNord är nere visas ett tydligt felmeddelande för kunden. Fraktpriserna fungerar fortfarande eftersom de beräknas av min egen backend. Kunden kan även välja hemleverans utan att PostNords ombudsdata behöver användas.

5. Vilka risker medför beroendet av externa tjänster?
En risk är kostnaden. Många av tjänsterna erbjuder gratisnivåer för utveckling, men kan bli kostsamma om trafiken ökar.

En annan risk är att API:er eller villkor förändras. Om exempelvis PostNord eller Stripe ändrar sina API:er kan delar av integrationen sluta fungera och behöva uppdateras.

Det finns även en beroenderisk om tjänsten får driftstörningar. Om Stripe eller PostNord ligger nere påverkas delar av webbshoppen direkt.

Persondata är också en viktig aspekt. Kundinformation skickas till exempelvis Stripe under betalningsprocessen, vilket innebär att GDPR och säker hantering av personuppgifter måste beaktas.

Sammanfattningsvis ger externa tjänster mycket funktionalitet till låg utvecklingskostnad, men de innebär också att systemet blir beroende av externa leverantörer, deras tillgänglighet och deras villkor.

# Autentisering

## Kundinloggning med Google

Shoppen använder Google OAuth 2.0 tillsammans med OpenID Connect för att låta kunder logga in med sina Google-konton.
Externa miljövariabler:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
### Inloggningsflöde

1. Kunden klickar på **"Fortsätt med Google"** i loginformuläret.
2. Frontend skickar användaren till backend-routen /api/auth/google.
3. Backend skapar ett slumpmässigt state-värde och en PKCE code_verifier.
4. state och code_verifier sparas i httpOnly-cookies.
5. Servern genererar en code_challenge från verifieraren och skickar användaren vidare till Googles inloggningssida.
6. Kunden loggar in och godkänner åtkomst.
7. Google skickar tillbaka användaren till shoppens callback-route tillsammans med en authorization code.
8. Backend kontrollerar att state matchar det värde som sparades vid starten av inloggningen.
9. Authorization code byts mot en ID-token genom ett server -till-server-anrop till Google.
10. ID-token valideras och används för att identifiera användaren.
11. Användaren hämtas eller skapas i databasen baserat på Googles unika sub.
12. Shoppen skapar sin egen JWT och sparar den i en httpOnly-cookie.
13. Kunden skickas tillbaka till shoppen som inloggad användare.

### State och PKCE

Två säkerhetsmekanismer används:

#### State

Ett slumpmässigt state-värde skapas när inloggningen startar.

När Google skickar tillbaka användaren måste samma värde komma tillbaka i callbacken. Om värdet inte matchar avbryts inloggningen.

State skyddar mot CSRF-attacker där en angripare försöker tvinga användaren att logga in med ett annat konto än sitt eget.

#### PKCE

Vid starten av inloggningen skapas en slumpmässig code_verifier.

Servern skickar endast en hash (code_challenge) till Google.

När authorization code senare byts mot tokens måste servern skicka den ursprungliga verifieraren. Google kontrollerar att verifieraren matchar den tidigare challenge som registrerats.

Detta skyddar mot att någon stjäl authorization code och försöker använda den själv.

### Tokens

#### Googles ID-token

Google returnerar en ID-token som är en JWT.

Den används endast för att identifiera användaren och läsa ut:

- sub
- email
- email_verified
- name

Innan informationen används valideras tokenens innehåll med Zod och följande kontroller genomförs:

- iss måste vara Google
- aud måste vara shoppens Google Client ID
- exp får inte ha passerat

ID-token sparas inte i databasen och skickas aldrig vidare till frontend.

#### Googles Access Token

Google returnerar även ett access token vid tokenutbytet.

Shoppen använder inte Googles API:er efter inloggningen och access token används därför inte.

Det sparas inte heller någonstans.

### Identifiering av användare

Google-användare identifieras med sub och inte med e\-postadress.

Anledningen är att sub är Googles permanenta och unika identifierare för ett konto medan användaren kan byta e-postadress.

Vid första inloggningen skapas en ny användare i databasen med:

- google_sub
- email
- name

Vid senare inloggningar hämtas samma användare genom google_sub.

Konton slås inte ihop automatiskt enbart baserat på e-postadress.

### JWT och inloggad session

Efter att Google identifierat användaren skapar shoppen sin egen JWT.

JWT:n innehåller användarens interna id, namn och e-postadress.

Tokenen sparas i en httpOnly-cookie.

Alla skyddade routes använder därefter shoppens egen JWT för autentisering.

Google är endast inblandat under själva inloggningsprocessen.

### Varför JWT?

Shoppen använde redan JWT-baserad autentisering innan Google-login lades till.

Genom att fortsätta använda JWT kunde både vanlig inloggning och Google-login återanvända samma autentiseringssystem och middleware.

Efter callbacken fungerar båda inloggningssätten identiskt eftersom backend endast arbetar med shoppens egen JWT-cookie.

### Mina sidor

När en kund är inloggad kopplas nya ordrar till användarens konto via user_id.

Mina sidor hämtar endast ordrar som tillhör den inloggade användaren.

Om användaren inte är autentiserad returnerar servern statuskod 401.

På så sätt kan kunder endast se sina egna beställningar.

### Utloggning

Vid utloggning rensas JWT-cookien av servern.

Nästa begäran till en skyddad route saknar då giltig token och användaren betraktas som utloggad.

# Orderbekräftelse via e-post

## Resend-integration

Shoppen skickar orderbekräftelser via Resend när en order har betalats.

Resend används som extern e-posttjänst eftersom webbshoppen inte har en egen e-postserver. Genom att använda Resend kan shoppen skicka e-post via ett HTTPS-anrop istället för att själv hantera SMTP, spamfilter och leveransproblem.

API-nyckeln för Resend lagras endast på serversidan i en miljövariabel (RESEND_API_KEY) och exponeras aldrig för frontend eller webbläsaren.
Externa miljövariabler:
RESEND_API_KEY=
EMAIL_FROM=

## E-postadapter

All kommunikation med Resend sker via en separat adapter:

integrations/emailAdapter.js

Det är den enda filen som känner till Resends URL och API-nyckel. På så sätt påverkas resten av systemet inte om leverantören skulle bytas ut i framtiden.

Alla anrop använder timeout och felhantering för att undvika att servern låser sig om Resend inte svarar.

## När skickas orderbekräftelsen?

Orderbekräftelsen skickas från Stripe-webhooken efter att ordern har markerats som betald.

Flödet ser ut så här:

Kund genomför köp

↓

Stripe Checkout

↓

Stripe skickar webhook

↓

Order markeras som Betald

↓

Lager uppdateras

↓

Orderbekräftelse skickas via Resend

Mejlet skickas alltså inte när kunden klickar på "Köp" eftersom kunden fortfarande kan avbryta betalningen innan den genomförs.

## Innehåll i orderbekräftelsen

Orderbekräftelsen innehåller:

- Ordernummer
- Kundens namn
- Beställda produkter
- Antal per produkt
- Pris per produkt
- Totalsumma

Mejlet genereras både som HTML och som vanlig text för att fungera i olika e-postklienter.

## Säkerhet

Kunddata som visas i HTM-versionen av mejlet escapas innan den används. Detta förhindrar att HTML-kod eller skadligt innehåll injiceras i e-postmeddelandet.

Resends svar valideras med Zod innan det används av systemet.

## Idempotency Key

För att undvika dubbla orderbekräftelser används en Idempotency-Key kopplad till ordern:

order-confirmation/<orderId>Om Stripe skickar samma webhook flera gånger kommer Resend att känna igen förfrågan och inte skapa flera identiska mejl.

## Felhantering

Ett misslyckat mejlutskick påverkar inte betalningen.

Om Resend inte svarar eller returnerar ett fel loggas felet på servern, men ordern förblir markerad som betald.

På så sätt riskerar kunden inte att förlora en genomförd betalning på grund av ett problem i e-posttjänsten.

## Testmiljö

Projektet använder:

onboarding@resend.dev

som avsändaradress i utvecklings- och testmiljön.

I detta läge kan Resend endast skicka mejl till den e-postadress som är kopplad till Resend-kontot. För att skicka till valfria mottagare krävs en verifierad egen domän.

