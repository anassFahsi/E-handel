import express from 'express';
import pool from '../db.js';
//import { Query } from 'pg';

const router=express.Router();

router.post('/',async(req,res)=>{
    
        const {customer, cart, total}=req.body;
        try{
            const orderResult=await pool.query(`INSERT INTO orders (customer_name, customer_email, customer_address, total)
            VALUES ($1, $2, $3, $4)
            RETURNING id`, [customer.name, customer.email, customer.address, total]);
            const orderId=orderResult.rows[0].id;
    
            for(const item of cart){
                await pool.query(`INSERT INTO order_items (order_id,product_id, quantity, price_at_purchase) VALUES($1,$2,$3,$4)`,[orderId,item.id,item.quantity,item.price])
            }
        res.json({success:true,orderId})

        }catch(error){
            console.error(error)
            res.status(500).json({error:'Order creation failed'})
        }
});

router.get('/', async (req, res) => {
  const { search, page = 1, limit = 5} = req.query;

  const offset = (page - 1) * limit;

  try {
    let baseQuery = `
      FROM orders
      WHERE ($1::TEXT IS NULL OR customer_name ILIKE $1 OR customer_email ILIKE $1 OR CAST(id AS TEXT) ILIKE $1)
    `;

    // total count (för pagination)
    const countRes = await pool.query(
      `SELECT COUNT(*) ${baseQuery}`,
      [search ? `%${search}%` : null]
    );
    const total = parseInt(countRes.rows[0].count);

    // hämta orders för denna sida
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


router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await pool.query(`
      SELECT id, customer_name, customer_email, customer_address, total, created_at
      FROM orders
      WHERE id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.query(`
      SELECT oi.product_id, p.name, oi.quantity, oi.price_at_purchase ,(oi.quantity * oi.price_at_purchase) AS subtotal
      FROM order_items oi inner join products p on p.id = oi.product_id
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

router.delete('/:id',async(req,res)=>{
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


export default router