import express from 'express';
import cors from 'cors';
import pool from './db.js';
import ordersRouter from './routes/orders.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/orders',ordersRouter);

app.get("/products", async(req, res) => {
  try{
    const result=await pool.query("SELECT * FROM products");
    res.json(result.rows)
  }
  catch(error){
    console.error(error)
    res.status(500).json({error:'Could not get products'})
  }
  
});

app.post('/products',async(req,res)=>{
  const {name,description,image_url,price,stock}=req.body;
  try{
    const result=await pool.query(`INSERT INTO products (name,description,image_url,price,stock) VALUES ($1,$2,$3,$4,$5) RETURNING *`,[name,description,image_url,price,stock]);
    res.json(result.rows[0]);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:'Could not create product'});
  }

})

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



app.listen(3000, () => console.log('Server körs på port 3000'));
