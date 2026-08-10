import express from 'express';
import cors from 'cors';
import pool from './db.js';
import multer from 'multer';
import path from 'path';
import ordersRouter from './routes/orders.js';
import  cartRouter from './routes/cart.js';
import shippingRouter from './routes/shipping.js';
const app = express();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


app.use("/uploads", express.static("uploads"));


app.use(cors());
app.use(express.json());
app.use('/orders',ordersRouter);
app.use('/',cartRouter)
app.use('/',shippingRouter);

// Upload image route
//app.post("/upload", upload.single("image"), (req, res) => {
//  const filePath = `/uploads/${req.file.filename}`;
//  res.json({ url: filePath });
//});


// Get all products
app.get("/products", async (req, res) => {
  const { search, category } = req.query;

  try {
    let query = "SELECT * FROM products";
    let params = [];
    let conditions = [];

    if (search) {
      conditions.push("(name ILIKE $1 OR description ILIKE $1)");
      params.push(`%${search}%`);
    }

    if (category) {
      conditions.push(`category_id = $${params.length + 1}`);
      params.push(category);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not get products" });
  }
});




  

// Get one product
app.get("/products/:id", async (req, res) => {
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

// Create products
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category_id } = req.body;

    // Multer ger oss filen här
    const image_url = `/uploads/${req.file.filename}`;

    // Hämta category_id från namn
    const categoryRes = await pool.query(
      "SELECT id FROM categories WHERE name = $1",
      [category_id]
    );
     if (categoryRes.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const catId = categoryRes.rows[0].id;

    const result = await pool.query(
      `INSERT INTO products (name, price, description, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, price, description, image_url, catId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create product" });
  }
});

// Get all categories
app.get('/categories',async(req,res)=>{
  try{
    const result=await pool.query(`SELECT * FROM categories WHERE id>6`);
    res.json(result.rows);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:'Could not fetch categories'})
  }
})

// Update product
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, price, stock } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           image_url = $3,
           price = $4,
           stock = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, image_url, price, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update product" });
  }
});

// Delete product
app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM products
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      deletedProduct: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete product" });
  }
});

// Get variants for products
app.get('/products/:id/variants',async(req,res)=>{
  try{
     const result= await pool.query(`SELECT * FROM product_variants WHERE product_id=$1`,[req.params.id]);
     res.json(result.rows);
  }
  catch(err){
    console.error(err)
    res.status(500).json({error:'Could not fetch variants'})
  }
 
});

// Add variant
app.post("/products/:id/variants", async (req, res) => {
  const { size, color, stock } = req.body;

  try {
    await pool.query(
      `INSERT INTO product_variants (product_id, size, color, stock)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, size, color, stock]
    );

    res.json({ message: "Variant added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add variant" });
  }
});

// Delete variant
app.delete("/products/variants/:variantId", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM product_variants WHERE id = $1",
      [req.params.variantId]
    );

    res.json({ message: "Variant deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete variant" });
  }
});

 // Update variant 
app.put('/variants/:variantId',async(req,res)=>{
  const {size,color,stock}=req.body;
  try{
    await pool.query(`UPDATE product_variants SET 
      size=$1, color:$2, stock=$3
      WHERE id=$4`,
    [size,color,stock, req.params.variantId]);
    res.json({message:'Variant updated'})
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:'Could not update variant'})
  }
})




app.listen(3000, () => console.log('Server körs på port 3000'));
