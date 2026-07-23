import express from 'express';
import pool from '../db.js';

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
})

export default router