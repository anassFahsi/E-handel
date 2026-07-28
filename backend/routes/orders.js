import express from 'express';
import pool from '../db.js';
import { Query } from 'pg';

const router=express.Router();

router.post('/',async(req,res)=>{
    
        const {customer, cart, total}=req.body;
        try{
            const orderResult=await pool.query(`INSERT INTO orders (customer_name, customer_email, customer_address, total)
            VALUES ($1, $2, $3, $4)
            RETURNING id`, [customer.name, customer.email, customer.address, total]);
            const orderId=orderResult.rows[0].id;
    
            for(const item of cart){
                await pool.query(`INSERT INTO order_items (order_id,product_id, quantity, price_at_purchase) VALUES($1,$2,$3,$4)`,[orderId,item.id,1,item.price])
            }
        res.json({success:true,orderId})

        }catch(error){
            console.error(error)
            res.status(500).json({error:'Order creation failed'})
        }
});

router.get('/', async (req, res) => {
  const {search}=req.query;
  try {
    let query=`SELECT * FROM orders ORDER BY id DESC`;
    let params=[]
    if (search){
    
      query=`SELECT * FROM orders WHERE customer_name ILIKE $1 OR customer_email ILIKE $1 OR CAST(id AS TEXT) ILIKE $1 ORDER BY id DESC `;
      params=[`%${search}%`]
    }
    const result = await pool.query(query,params);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch orders' });
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
      SELECT oi.product_id, p.name, oi.quantity, oi.price_at_purchase
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