import express from 'express';
import cors from 'cors';
import pool from './db.js';
const app = express();
app.use(cors());
app.use(express.json());

app.get("/products", async(req, res) => {
  const result=await pool.query("SELECT * FROM products");
  res.json(result.rows)
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

app.listen(3000, () => console.log('Server körs på port 3000'));
