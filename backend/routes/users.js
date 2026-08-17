import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router=express.Router();

// Register
router.post('/register', async(req,res)=>{
    const {email,password,name}=req.body;
    try{
        const hashed= await bcrypt.hash(password,10);

        await pool.query(
        `INSERT INTO users (email, password_hash, name, role)
          VALUES ($1, $2, $3, 'user')`,
          [email, hashed, name|| null]
       );

        res.json({ message: "User registered" });
    } 
    catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
    }
 }
);

// Login
router.post('/login',async(req,res)=>{
    const {email,password}=req.body;

    try{
      const userRes = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
     );
     const user = userRes.rows[0];
     if (!user) return res.status(400).json({ error: "User not found" });

     const match=await bcrypt.compare(password,user.password_hash);
     if (!match) return res.status(400).json({ error: "Wrong password" });

     const token=jwt.sign(
        {id:user.id, email:user.email, role:user.role},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
     );
     res.json({token});
    }
    catch(error){
        console.error(error);
        res.status(500).json({error:'Login failed'});
    }
 } 
)

// Profile (protected)
router.get('/profile', auth, async (req, res) => {
  try {
    const userRes = await pool.query(
      "SELECT *FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = userRes.rows[0];

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch profile" });
  }
});


router.get('/orders', auth, async (req, res) => {
  try {
    const email = req.user.email;

    const ordersRes = await pool.query(
      `SELECT * FROM orders 
       WHERE customer_email = $1
       ORDER BY created_at DESC`,
      [email]
    );

    const orders = ordersRes.rows;

    if (orders.length === 0) {
      return res.json([]);
    }

    const itemsRes = await pool.query(
      `SELECT 
         oi.id,
         oi.order_id,
         oi.product_id,
         oi.quantity,
         oi.price_at_purchase,
         p.name AS product_name,
         p.image_url,
         pv.size AS variant_size,
         pv.color AS variant_color
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       WHERE oi.order_id = ANY($1::int[])`,
      [orders.map(o => o.id)]
    );

    const items = itemsRes.rows;

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(i => i.order_id === order.id)
    }));

    res.json(ordersWithItems);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

router.post('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
  
    const userRes = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Fel nuvarande lösenord" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [hashed, user.id]
    );

    res.json({ message: "Lösenordet har uppdaterats" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunde inte uppdatera lösenord" });
  }
});





export default router;