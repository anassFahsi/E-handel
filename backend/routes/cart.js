import express from 'express';
import pool from '../db.js';

const router = express.Router();

// CREATE OR FETCH CART
router.post('/cart', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const existingCart = await pool.query(
      `SELECT id FROM carts WHERE session_id = $1`,
      [sessionId]
    );

    if (existingCart.rows.length > 0) {
      return res.json({ cartId: existingCart.rows[0].id });
    }

    const newCart = await pool.query(
      `INSERT INTO carts (session_id) VALUES ($1) RETURNING id`,
      [sessionId]
    );

    res.json({ cartId: newCart.rows[0].id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create or fetch cart' });
  }
});


// ADD ITEM TO CART (WITH STOCK CHECK)

router.post("/cart/items", async (req, res) => {
  const { cartId, productId, variantId, quantity } = req.body;

  try {
   
    const variantRes = await pool.query(
      `SELECT stock FROM product_variants WHERE id = $1`,
      [variantId]
    );

    if (variantRes.rows.length === 0) {
      return res.status(400).json({ error: "Variant not found" });
    }

    const stock = variantRes.rows[0].stock;

    if (stock < quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    
    const existingItem = await pool.query(
      `SELECT id, quantity FROM cart_items
       WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3`,
      [cartId, productId, variantId]
    );

    if (existingItem.rows.length > 0) {
      const newQuantity = existingItem.rows[0].quantity + quantity;

      if (newQuantity > stock) {
        return res.status(400).json({ error: "Not enough stock" });
      }

      await pool.query(
        `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
        [newQuantity, existingItem.rows[0].id]
      );

      return res.json({
        message: "Quantity updated",
        quantity: newQuantity
      });
    }

    
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
       VALUES ($1, $2, $3, $4)`,
      [cartId, productId, variantId, quantity]
    );

    res.json({ message: "Item added to cart" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add item to cart" });
  }
});


// FETCH CART
router.get("/cart/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const cartRes = await pool.query(
      `SELECT id FROM carts WHERE session_id = $1`,
      [sessionId]
    );

    if (cartRes.rows.length === 0) {
      return res.json({ cart: null, items: [], total: 0, cartCount: 0 });
    }

    const cartId = cartRes.rows[0].id;

    const itemsRes = await pool.query(
      `SELECT 
          ci.id,
          ci.quantity,
          ci.variant_id,
          p.id AS product_id,
          p.name,
          p.price,
          pv.size,
          pv.color,
          pv.stock AS variant_stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN product_variants pv ON pv.id = ci.variant_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const cartCount = itemsRes.rows.reduce((sum, item) => sum + item.quantity, 0);
    const total = itemsRes.rows.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    res.json({
      cartId,
      items: itemsRes.rows,
      cartCount,
      total
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch cart" });
  }
});


// REMOVE ITEM

router.delete('/cart/items/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    await pool.query(`DELETE FROM cart_items WHERE id = $1`, [itemId]);
    res.json({ success: true, message: 'Item removed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove item' });
  }
});


 
// INCREASE QUANTITY (WITH STOCK CHECK)

router.put('/cart/items/:itemId/increase', async (req, res) => {
  const { itemId } = req.params;

  try {
    const itemRes = await pool.query(
      `SELECT ci.quantity, pv.stock
       FROM cart_items ci
       JOIN product_variants pv ON pv.id = ci.variant_id
       WHERE ci.id = $1`,
      [itemId]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const { quantity, stock } = itemRes.rows[0];

    if (quantity + 1 > stock) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    await pool.query(
      `UPDATE cart_items SET quantity = quantity + 1 WHERE id = $1`,
      [itemId]
    );

    res.json({ message: "quantity increased" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not increase quantity" });
  }
});


//  DECREASE QUANTITY

router.put("/cart/items/:itemId/decrease", async (req, res) => {
  const { itemId } = req.params;

  try {
    const itemRes = await pool.query(
      `SELECT quantity FROM cart_items WHERE id = $1`,
      [itemId]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const quantity = itemRes.rows[0].quantity;

    if (quantity > 1) {
      await pool.query(
        `UPDATE cart_items SET quantity = quantity - 1 WHERE id = $1`,
        [itemId]
      );
    } else {
      await pool.query(
        `DELETE FROM cart_items WHERE id = $1`,
        [itemId]
      );
    }

    res.json({ success: true, message: 'quantity decreased' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not decrease quantity" });
  }
});

export default router;


