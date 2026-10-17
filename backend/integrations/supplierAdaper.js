import {parse} from 'csv-parse/sync';
import {XMLParser} from 'fast-xml-parser';

const BASE_URL = process.env.SUPPLIER_API_URL;
const API_KEY = process.env.SUPPLIER_API_KEY;
const BRANSCH = process.env.SUPPLIER_BRANSCH || "klader";
const TIMEOUT_MS = Number(
  process.env.SUPPLIER_API_TIMEOUT_MS || 5000
);

function parseCsvCatalog(buffer) {
  const text = buffer.toString('latin1');
  const rows = parse(text, {
    columns: true,
    delimiter: ";",
  });

 const products = rows.map((row) => ({
  supplierSku: row.artNr,
  name: row.benamning,
  categoryName: row.kategori,
  price: parseDecimal(row.pris),
  stock:
    row.lagersaldo === ''
      ? null
      : Number(row.lagersaldo),

  variants:
    row.varianter === ''
      ? []
      : row.varianter.split('|'),
   }));
     
  return products;
};

function parseXmlCatalog(buffer){
  const text = buffer.toString('utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseTagValue:false
  });
  
  const data = parser.parse(text);
  const products = data.katalog.produkt.map((product) => ({
  supplierSku: product.artNr,
  name: product.benamning,
  categoryName: product.kategori,

  price: parseDecimal(product.pris["#text"]),

  stock:
    product.lagersaldo === ""
      ? null
      : Number(product.lagersaldo),

  variants: product.varianter?.variant
  ? Array.isArray(product.varianter.variant)
    ? product.varianter.variant
    : [product.varianter.variant]
  : [],
}));

 return products;
}

function parseDecimal(value) {
  const text = String(value ?? '')
    .replace(/\s/g, '')
    .replace(',', '.');

  return text === '' ? NaN : Number(text);
}

export async function getSupplierCatalog(format) {
  try {
    const response = await fetch(
      `${BASE_URL}/export/products.${format}?bransch=${BRANSCH}`,
      {
        headers: {
          "X-Api-Key": API_KEY,
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );

   if (!response.ok) {
        console.log("Status:", response.status);
        console.log("StatusText:", response.statusText);

        const body = await response.text();
        console.log(body);

        throw new Error("Kunde inte hämta katalogen");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    switch(format){
      case "csv":
       return parseCsvCatalog(buffer);
      case "xml":
        return parseXmlCatalog(buffer);
      default :
      throw new Error('Ogiltigt format')
    }
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}

