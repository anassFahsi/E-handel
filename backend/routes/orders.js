import express from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router=express.Router();

router.post('/',async(req,res)=>{
    
        const {customer, cart, total,shipping_method_id,shipping_price,sessionId}=req.body;
        try{
          await pool.query('BEGIN')
          const orderRes = await pool.query(`
          INSERT INTO orders (customer_name, customer_email, customer_address, total, shipping_method_id, shipping_price)
            VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id`,
            [
            customer.name,
            customer.email,
            customer.address,
            total,
            shipping_method_id,
            shipping_price
          ]);

            const orderId=orderRes.rows[0].id;
    
            for(const item of cart){
              if(item.quantity>item.variant_stock){
                await pool.query('ROLLBACK')
                return res.json({error:'Not enough stock'})
              }
                await pool.query(`INSERT INTO order_items (order_id,product_id, variant_id,quantity, price_at_purchase) VALUES($1,$2,$3,$4,$5)`,[orderId,item.product_id,item.variant_id,item.quantity,item.price]);
                await pool.query(`UPDATE product_variants SET stock=stock-$1 WHERE id=$2`,[item.quantity,item.variant_id])
            }
             await pool.query(`DELETE FROM carts WHERE session_id=$1`,[sessionId])
             await pool.query('COMMIT')
             res.json({success:true,orderId});
       

        }catch(error){
            console.error(error)
            await pool.query('ROLLBACK')
            res.status(500).json({error:'Order creation failed'})
        }
});

router.get('/', auth, admin, async (req, res) => {
  const { search, page=1, limit=5 } = req.query;

  const offset = (page - 1) * limit;

  try {
    let baseQuery = `
      FROM orders
      WHERE ($1::TEXT IS NULL OR customer_name ILIKE $1 OR customer_email ILIKE $1 OR CAST(id AS TEXT) ILIKE $1)
    `;

    const countRes = await pool.query(
      `SELECT COUNT(*) ${baseQuery}`,
      [search ? `%${search}%` : null]
    );
   
    const total = parseInt(countRes.rows[0].count);

    const ordersRes = await pool.query(
      `
      SELECT *
      ${baseQuery}
      ORDER BY id DESC
      LIMIT $2 OFFSET $3
      `,
      [search ? `%${search}%` : null, limit, offset]
    );
    

    res.json({
      orders: ordersRes.rows,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load orders" });
  }
});


router.get('/:id', auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await pool.query(`
      SELECT id, customer_name, customer_email, customer_address, total, created_at, status
      FROM orders
      WHERE id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.query(`
      SELECT oi.product_id, p.name, oi.variant_id,oi.quantity, oi.price_at_purchase, pv.size, pv.color, pv.stock ,(oi.quantity * oi.price_at_purchase) AS subtotal
      FROM order_items oi inner join products p on p.id = oi.product_id JOIN product_variants pv ON oi.variant_id=pv.id
      WHERE order_id = $1
    `, [id]);
     
    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch order details' });
  }
});

router.delete('/:id', auth, admin, async(req,res)=>{
  const {id}=req.params;
  try{
    const result=await pool.query(`
    DELETE FROM orders WHERE id=$1 RETURNING *`,[id]);
    
    if(result.rows.length===0){
      return res.status(404).json({error:' Order not found'})
    }
    res.json({message:'Order deleted successfully'})

  }catch(error){
    console.error(error)
    res.status(500).json({error:'Could not delete order'})
  }
 
})

router.put('/:id/status', auth, admin, async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    await pool.query('BEGIN')
    await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      [status, orderId]
    );

    if (status === 'Refunded') {

      // 1. Hämta alla order_items + variant info
      const variantsRes = await pool.query(`
        SELECT oi.variant_id, oi.quantity
        FROM order_items oi
        WHERE oi.order_id = $1
      `, [orderId]);

      const items = variantsRes.rows;

      for (const item of items) {
        await pool.query(
          `UPDATE product_variants SET stock = stock + $1 WHERE id = $2`,
          [item.quantity, item.variant_id]
        );
      }
    }
    await pool.query('COMMIT')
    res.json({ message: "Orderstatus uppdaterad" });

  } catch (err) {
    console.error(err);
    await pool.query('ROLLBACK')
    res.status(500).json({ error: "Kunde inte uppdatera orderstatus" });
  }
});



export default router