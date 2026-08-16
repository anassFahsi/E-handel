import express from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router=express.Router();

router.post('/', auth, async (req, res) => {
  const userId=req.user.id;
  const userEmail = req.user.email;   
  const { product_id, comment, rating } = req.body;

  try {
    const reviewed=await pool.query(`SELECT 1 FROM reviews WHERE user_id=$1 AND product_id=$2`,[userId,product_id]);
    if(reviewed.rowCount>0) {
        return res.status(403).json({error:'Already reviewed'})
    }
        
    
    const purchased = await pool.query(
      `SELECT 1
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.customer_email = $1 AND oi.product_id = $2
       LIMIT 1`,
      [userEmail, product_id]
    );

    if (purchased.rowCount === 0) {
      return res.status(403).json({ error: "Du kan bara recensera produkter du har köpt" });
      
    }

    await pool.query(
      `INSERT INTO reviews (product_id, user_id, comment, rating)
       VALUES ($1, $2, $3, $4)`,
      [product_id, req.user.id, comment, rating]
    );

    res.json({ message: 'review added' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add review' });
  }
});


router.get('/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const reviewsRes = await pool.query(`
      SELECT r.*, u.name AS user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `, [productId]);

    res.json(reviewsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch reviews" });
  }
});


router.get('/can-review/:productId', auth, async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const { productId } = req.params;
   
  try {
   
    const reviewed = await pool.query(
      `SELECT 1 FROM reviews WHERE user_id=$1 AND product_id=$2`,
      [userId, productId]
    );

    if (reviewed.rowCount > 0) {
      return res.json({ canReview: false, reason: "already_reviewed" });
    }

   const purchased = await pool.query(
      `SELECT 1
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.customer_email = $1 AND oi.product_id = $2
       LIMIT 1`,
      [userEmail, productId]
    );

    if (purchased.rowCount === 0) {
      return res.json({ canReview: false, reason: "not_purchased" });
    }

    res.json({ canReview: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not check review permission" });
  }
});



export default router;
