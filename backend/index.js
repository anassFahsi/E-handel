import express from 'express';
import cors from 'cors';
import pool from './db.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async(req, res) => {
  const result=await pool.query("SELECT * FROM products");
  res.json(result.rows)
});

app.listen(3000, () => console.log('Server körs på port 3000'));
