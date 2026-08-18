import express from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/* -------------------------------------------
   USER: CREATE ORDER (checkout)
------------------------------------------- */
router.post('/', async (req, res) => {
  const { customer, cart, total, shipping_method_id, shipping_price, sessionId } = req.body;

  try {
    await pool.query('BEGIN');

    const orderRes = await pool.query(`
      INSERT INTO orders (customer_name, customer_email, customer_address, total, shipping_method_id, shipping_price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      customer.name,
      customer.email,
      customer.address,
      total,
      shipping_method_id,
      shipping_price
    ]);

    const orderId = orderRes.rows[0].id;

    for (const item of cart) {
      if (item.quantity > item.variant_stock) {
        await pool.query('ROLLBACK');
        return res.json({ error: 'Not enough stock' });
      }

      await pool.query(`
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4, $5)
      `, [orderId, item.product_id, item.variant_id, item.quantity, item.price]);

      await pool.query(`
        UPDATE product_variants SET stock = stock - $1 WHERE id = $2
      `, [item.quantity, item.variant_id]);
    }

    await pool.query(`DELETE FROM carts WHERE session_id = $1`, [sessionId]);

    await pool.query('COMMIT');
    res.json({ success: true, orderId });

  } catch (error) {
    console.error(error);
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Order creation failed' });
  }
});

/* -------------------------------------------
   USER: GET OWN ORDERS
------------------------------------------- */
router.get('/', auth, async (req, res) => {
  try {
    const email = req.user.email;

    const ordersRes = await pool.query(`
      SELECT * FROM orders
      WHERE customer_email = $1
      ORDER BY created_at DESC
    `, [email]);

    const orders = ordersRes.rows;

    if (orders.length === 0) {
      return res.json([]);
    }

    const itemsRes = await pool.query(`
      SELECT 
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
      WHERE oi.order_id = ANY($1::int[])
    `, [orders.map(o => o.id)]);

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

export default router;
