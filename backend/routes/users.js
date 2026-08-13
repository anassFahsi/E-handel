import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router=express.Router();

// Register
router.post('/register', async(req,res)=>{
    const {email,password,username}=req.body;
    try{
        const hashed= await bcrypt.hash(password,10);

        await pool.query(
        `INSERT INTO users (email, password_hash, username, role)
          VALUES ($1, $2, $3, 'user')`,
          [email, hashed, username || null]
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
        {id:user.id, role:user.role},
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
      "SELECT id, email, username, role FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = userRes.rows[0];

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch profile" });
  }
});


export default router;