import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import pool from '../db.js';
import {z} from 'zod';

import ordersRouter from '../routes/orders.js';
import cartRouter from '../routes/cart.js';
import shippingRouter from '../routes/shipping.js';
import usersRouter from '../routes/users.js';
import reviewsRouter from '../routes/reviews.js';
import adminRouter from '../routes/admin.js';  
import currencyRouter from '../routes/currency.js' ;
import { searchProducts } from "../integrations/algoliaAdapter.js";

const app = express();
app.use("/uploads", express.static("uploads"));

app.use(cors());
app.use(express.json());

app.use('/api/orders', ordersRouter);
app.use('/api/', cartRouter);
app.use('/api/', shippingRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);   
app.use('/api/currency', currencyRouter);

const SearchQuery = z.object({
  q: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});


// General error handling for all errors
app.use((err,req,res,_next)=>{
  const message=err instanceof Error?err.message:String(err);
  console.error(`${req.method} ${req.originalUrl}: failed ${message}`);
  res.status(500).json({error:'Something went wrong on the server'})
})



// Get all products (public)
app.get("/api/products", async (req, res) => {
  
  const { search, category, sort, page = 1, limit = 5 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let conditions = ['image_url IS NOT NULL'];
    let params = [];

    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (category) {
      conditions.push(`category_id = $${params.length + 1}`);
      params.push(category);
    }

    const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) FROM products ${whereSQL}`;
    const countRes = await pool.query(countQuery, params);
    const totalProducts = Number(countRes.rows[0].count);

    let sortSQL = "ORDER BY id DESC";
    if (sort === "price_asc") sortSQL = "ORDER BY price ASC";
    if (sort === "price_desc") sortSQL = "ORDER BY price DESC";
    if (sort === "oldest") sortSQL = "ORDER BY id ASC";
    if (sort === "newest") sortSQL = "ORDER BY id DESC";

    const productsQuery = `
      SELECT * FROM products
      ${whereSQL}
      ${sortSQL}
      OFFSET ${offset}
      LIMIT ${limit}
    `;

    const productsRes = await pool.query(productsQuery, params);

    res.json({
      products: productsRes.rows,
      productsCount: totalProducts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not get products" });
  }
});

// Get one product (public)
app.get("/api/products/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch product" });
  }
});

app.get("/api/search", async (req, res) => {
  const parsed = SearchQuery.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues,
    });
  }

  try {
    const { q, page, pageSize } = parsed.data;

    const result = await searchProducts(
      q,
      page,
      pageSize
    );
    //console.log("hits:", result.hits.length);
   //console.log(result.hits[0]); 

  return res.json({
    data: result.hits.map((hit) => ({
      id: Number(hit.objectID),
      supplierSku: hit.supplierSku,
      name: hit.name,
      description: hit.description,
      price: hit.price,
      category: hit.category,
      imageUrl: hit.imageUrl,
    })),
    meta: {
      page,
      pageSize,
      total: result.nbHits,
      totalPages: result.nbPages,
   },
  });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Could not search products",
    });
  }
});

// Get all categories
app.get('/api/categories',async(req,res)=>{
  try{
    const result=await pool.query(`SELECT * FROM categories WHERE id>6`);
    res.json(result.rows);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:'Could not fetch categories'})
  }
})


// Get variants for products
app.get('/api/products/:id/variants',async(req,res)=>{
  try{
     const result= await pool.query(`SELECT * FROM product_variants WHERE product_id=$1`,[req.params.id]);
     res.json(result.rows);
  }
  catch(err){
    console.error(err)
    res.status(500).json({error:'Could not fetch variants'})
  }
 
});




export default app;