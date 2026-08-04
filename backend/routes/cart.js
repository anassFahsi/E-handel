import express from 'express';
import pool from '../db.js';

const router=express.Router();


router.post('/cart',async(req,res)=>{
    const {sessionId}=req.body;
    try{
        const existingCart=await pool.query(`SELECT id FROM carts WHERE session_id=$1`,[sessionId]);

        if(existingCart.rows.length > 0){
            return  res.json({cartId:existingCart.rows[0].id});
        }
       const newCart=await pool.query(`INSERT INTO carts (session_id) VALUES ($1) RETURNING id`,[sessionId]);
       res.json({cartId:newCart.rows[0].id});
    }
    catch(error){
        console.error(error)
        res.status(500).json({error:'Could not create or fetch cart'})
    }
})



// Add item to cart
router.post("/cart/items", async (req, res) => {
  const { cartId, productId, quantity } = req.body;

  try {
    
    const existingItem = await pool.query(
      `SELECT id, quantity FROM cart_items 
       WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    if (existingItem.rows.length > 0) {
      
      const newQuantity = existingItem.rows[0].quantity + quantity;

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
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [cartId, productId, quantity]
    );

    res.json({ message: "Item added to cart" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add item to cart" });
  }
});

// fetch cart
router.get("/cart/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    
    const cartRes = await pool.query(
      `SELECT id FROM carts WHERE session_id = $1`,
      [sessionId]
    );

    if (cartRes.rows.length === 0) {
      return res.json({ cart: null, items: [], total:0,cartCount:0});
    }

    const cartId = cartRes.rows[0].id;

    // fetch items
    const itemsRes = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    const cartCount=itemsRes.rows.reduce((sum,item)=>sum+item.quantity,0)
    const total=itemsRes.rows.reduce((sum,item)=>sum+(item.quantity*item.price),0);

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

router.delete('/cart/items/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    await pool.query(
      `DELETE FROM cart_items WHERE id = $1`,
      [itemId]
    );

    res.json({ success: true, message: 'Item removed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove item' });
  }
});

router.put('/cart/items/:itemId/increase',async(req,res)=>{
  const {itemId}=req.params;
  try{
  const result=await pool.query(`UPDATE cart_items SET quantity=quantity+1 WHERE id=$1`,[itemId])
  res.json({message:'quantity increased'})

  }
  catch(error){
    console.error(error)
    res.status(500).json({error:'Could not increase quantity'})
  }
});

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

    res.json({ success: true , message: 'quantity decreased'});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not decrease quantity" });
  }
});


export default router;



