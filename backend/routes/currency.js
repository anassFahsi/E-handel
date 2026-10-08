import { Router } from "express";
import { getRates } from "../api/integrations/currencyAdapter";

const router=Router();

router.get('/rates',async(req,res)=>{
    const {base}=req.query??'SEK';
    res.json(await getRates(base))
})

export default router;