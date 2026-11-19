import express from 'express';
import pool from '../db.js';
import jwt from "jsonwebtoken";
import { auth} from '../middleware/auth.js';
import {getCheckoutSession,createCheckoutSession} from '../integrations/stripeAdapter.js';
import { findServicePoints} from '../integrations/postNordAdapter.js';
import { calculateShipping } from './shipping.js';

const router = express.Router();
/* -------------------------------------------
   USER: CREATE ORDER
------------------------------------------- */
router.post("/checkout", async (req, res) => {
  
    let userId = null;

  try {
    const token = req.cookies.token;

    if (token) {

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
     
        userId = payload.id;
    }

    } catch {
      userId = null;
    }

    const { customer, cart, shipping_method_id, sessionId,postalCode, servicePointId, deliveryTime } = req.body;
    
    try {
      const shippingRes = await pool.query(
      `SELECT name, price
      FROM shipping_methods
      WHERE id = $1`,
      [shipping_method_id]
    );

    if (shippingRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid shipping method' });
    }
    const shippingMethodName=shippingRes.rows[0].name;
    let servicePoint='';
    
    if (shippingMethodName === "PostNord Ombud") {

      const nearby =
        await findServicePoints(postalCode);

       servicePoint =
        nearby.find(
          point =>
            point.id === servicePointId
        );

      if (!servicePoint) {
        console.log('ogiltigt ombud')
        return res.status(400).json({
          error:
            "Välj ett giltigt ombud"
        });
      };
      
    }
   
    let backendTotal = 0;

    for (const item of cart) {

      const priceRes = await pool.query(
        `SELECT price
        FROM products
        WHERE id = $1`,
        [item.product_id]
      );

      
        const itemPrice =
          Number(priceRes.rows[0].price);

        backendTotal +=
          item.quantity * itemPrice;
      }

    const shippingPrice =calculateShipping(shippingMethodName,
        backendTotal);

    const total = backendTotal + shippingPrice;

  await pool.query('BEGIN');
 
  const orderRes = await pool.query(
      `INSERT INTO orders 
        (customer_name, customer_email, customer_address, total, shipping_method_id, shipping_price, cart_session_id, service_point_id, service_point_name, estimated_delivery, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10, $11)
       RETURNING id`,
      [
        customer.name,
        customer.email,
        customer.address,
        total,                 
        shipping_method_id,
        shippingPrice,
        sessionId,
        servicePoint?.id??null,
        servicePoint?.name??null,
        deliveryTime,
        userId
      ]
    );

    const orderId = orderRes.rows[0].id;
    const lineItems=[];

    for (const item of cart) {

      const variantStockRes= await pool.query(`SELECT stock FROM product_variants WHERE id=$1`,[item.variant_id]);

      const variantStock=variantStockRes.rows[0].stock;

      if (item.quantity > variantStock) {
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


    const session =await createCheckoutSession({
      orderId,
      lineItems,
      successUrl:
      `${process.env.CLIENT_URL}/#/thankyou?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:
      `${process.env.CLIENT_URL}/#/checkout`
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
    const userId = req.user.id;

    const ordersRes = await pool.query(`
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

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
    const session =await getCheckoutSession(
     req.params.sessionId
    );

  const orderRes =
   await pool.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1
    `,
    [session.orderId]
  );

    if (!orderRes.rows.length) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    res.json({
      sessionId: session.id,
      paymentStatus: session.paymentStatus,
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
