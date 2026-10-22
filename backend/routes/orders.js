import express from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import {stripe} from '../integrations/stripeAdapter.js';

const router = express.Router();
/* -------------------------------------------
   USER: CREATE ORDER
------------------------------------------- */
router.post("/checkout", async (req, res) => {
    const { customer, cart, shipping_method_id, sessionId } = req.body;
    try {
    await pool.query('BEGIN');
       const shippingRes = await pool.query(
      `SELECT price FROM shipping_methods WHERE id = $1`,
      [shipping_method_id]
    );

    if (shippingRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid shipping method' });
    }

    const shippingPrice = shippingRes.rows[0].price;

    let backendTotal = 0;

  const orderRes = await pool.query(
      `INSERT INTO orders 
        (customer_name, customer_email, customer_address, total, shipping_method_id, shipping_price, cart_session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        customer.name,
        customer.email,
        customer.address,
        0,                 
        shipping_method_id,
        shippingPrice,
        sessionId
      ]
    );

    const orderId = orderRes.rows[0].id;
    const lineItems=[];
    for (const item of cart) {

      if (item.quantity > item.variant_stock) {
        await pool.query('ROLLBACK');
        return res.json({ error: 'Not enough stock' });
      }

      const priceRes = await pool.query(
        `SELECT price FROM products WHERE id = $1`,
        [item.product_id]
      );

      if (priceRes.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'Product not found' });
      }

      const itemPrice = priceRes.rows[0].price;
      backendTotal += item.quantity * Number(itemPrice);

      await pool.query(
        `INSERT INTO order_items 
          (order_id, product_id, variant_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.variant_id, item.quantity, itemPrice]
      );

      lineItems.push({
        quantity: item.quantity,
        price_data: {
        currency: "sek",
        unit_amount: Math.round(Number(itemPrice) * 100),
        product_data: {
          name: item.name,
        },
      },
    });
    }; 
    lineItems.push({
      quantity:1,
      price_data:{
         currency: "sek",
         unit_amount: Math.round(shippingPrice)*100,
          product_data: {
              name: "frakt",
            }
          }
        })
    backendTotal += Number(shippingPrice);
       await pool.query(
      `UPDATE orders SET total = $1 WHERE id = $2`,
      [backendTotal, orderId]
    );


    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      client_reference_id: String(orderId),

      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,

      line_items: lineItems,

      success_url:
        `${process.env.CLIENT_URL}/thankyou?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${process.env.CLIENT_URL}/checkout`,
    });
    await pool.query('COMMIT')

    res.json({
      url: session.url,
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
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

router.get("/checkout/session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    const orderId = session.client_reference_id;

    const orderRes = await pool.query(
      `SELECT *
       FROM orders
       WHERE id = $1`,
      [orderId]
    );

    if (!orderRes.rows.length) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      order: orderRes.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Could not fetch checkout session",
    });
  }
});




export default router;
