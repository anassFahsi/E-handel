import express from 'express';
import pool from '../db.js';
import {z} from 'zod';
import { findServicePoints } from '../integrations/postNordAdapter.js';
import { getDeliveryTime } from '../integrations/postNordAdapter.js';

const router= express.Router();

const PostalCodeSchema = z.object({
  postalCode: z
    .string()
    .regex(/^\d{5}$/)
});

const FREE_SHIPPING_LIMIT = 500;

export function calculateShipping(method, orderValue) {
  if (orderValue >= FREE_SHIPPING_LIMIT) {
    return 0;
  }

  if (method === "PostNord Ombud") {
    return 49;
  }

  return 89;
};

router.get('/',async(req,res)=>{
    try{
        const result=await pool.query(`SELECT * FROM shipping_methods`);
        res.json(result.rows)
    }
    catch(error){
        console.error(error)
        res.status(500).json({error:'Could not fetch shipping methods'})
    }
})

router.get('/service-points',async(req,res)=>{
    try{
        const postalCode=String(req.query.postalCode??'');
        const parsed=PostalCodeSchema.safeParse({postalCode});
     
        if(!parsed.success){
            return res.status(400).json({error:'Ogiltigt postnummer'})
        }
        const servicePoints=await  findServicePoints(postalCode);
        res.json(servicePoints)
   
    }
    catch(error){
        console.error(error);
        res.status(502).json({error:'Kunde inte hämta ombud från PostNord'})
    }
})


router.get("/delivery-time", async (req, res) => {

  try {

    const postalCode =
      String(req.query.postalCode ?? "");

    const parsed =
      PostalCodeSchema.safeParse({
        postalCode
      });

    if (!parsed.success) {
      return res.status(400).json({
        error: "Ogiltigt postnummer"
      });
    }

    const deliveryTime =
      await getDeliveryTime(postalCode);

    res.json(deliveryTime);

  } catch (error) {

    console.error(error);

    res.status(502).json({
      error:
        "Kunde inte hämta leveranstid från PostNord"
    });
  }
});


export default router