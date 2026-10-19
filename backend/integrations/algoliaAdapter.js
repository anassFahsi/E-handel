import { algoliasearch } from "algoliasearch";

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;
const SEARCH_KEY = process.env.ALGOLIA_SEARCH_API_KEY;

const adminClient = algoliasearch(APP_ID, ADMIN_KEY);
const searchClient = algoliasearch( APP_ID,SEARCH_KEY);



export async function indexProducts(products) {
  const records = products.map((product) => ({
    objectID: product.id,
    supplierSku: product.supplier_sku,
    name: product.name,
    price: Number(product.price),
    category: product.category_name,
    imageUrl: product.image_url,
    description:product.description
  }));

  return adminClient.saveObjects({
    indexName: INDEX_NAME,
    objects: records,
  });
}

export async function indexProduct(product) {
  const records ={
    objectID: product.id,
    supplierSku: product.supplier_sku,
    name: product.name,
    price: Number(product.price),
    category: product.category_name,
    imageUrl: product.image_url,
    description:product.description
  };

  return adminClient.saveObjects({
    indexName: INDEX_NAME,
    objects: [records],
  });
}


  // anropa Algolia

export async function searchProducts(
  query,
  page,
  pageSize
) {
  const result = await searchClient.searchSingleIndex({
    indexName: INDEX_NAME,
    searchParams: {
      query,
      page: page - 1,
      hitsPerPage: pageSize,
    },
  });

  return result;
}

export async function deleteProduct(productId) {
  await adminClient.deleteObject({
    indexName: INDEX_NAME,
    objectID: String(productId),
  });
} 

