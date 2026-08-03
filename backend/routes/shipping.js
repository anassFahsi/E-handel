import express from 'express';
import pool from '../db.js';
const router= express.Router();

router.get('/shipping',async(req,res)=>{
    try{
        const result=await pool.query(`SELECT * FROM shipping_methods`);
        res.json(result.rows)
    }
    catch(error){
        console.error(error)
        res.status(500).json({error:'Could not fetch shipping methods'})
    }
})





















export default router