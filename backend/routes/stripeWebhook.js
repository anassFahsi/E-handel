import express from "express";
import {verifyWebhook} from "../integrations/stripeAdapter.js";
import pool from "../db.js";
import { sendOrderConfirmation } from "../integrations/emailAdapter.js";
const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
     
    try{
  
       const event =verifyWebhook({ 
        payload: req.body, 
        signature: req.headers["stripe-signature"]
       });
         
        switch (event.type) {

        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
       
            const session = event.data.object;
            const orderId = session.client_reference_id;

            const orderRes = await pool.query(
             `SELECT status, cart_session_id
               FROM orders
               WHERE id = $1`,
               [orderId]
            );
            if(!orderRes.rows.length){
                break;
            }
            if(orderRes.rows[0].status=='Betald'){
                 return res.json({ received: true });
            }
            await pool.query(`UPDATE orders SET status=$1 WHERE id=$2`,['Betald',orderId]);

            const variantRes=await pool.query(`SELECT variant_id, quantity FROM order_items WHERE order_id=$1`,[orderId]);

            const variants=variantRes.rows;

            for (const variant of variants){

                await pool.query(`
                    UPDATE product_variants SET stock=stock - $1 WHERE id=$2`,[variant.quantity, variant.variant_id])
            }

            

            const cartSessionId=orderRes.rows[0].cart_session_id;
            if(cartSessionId){
                 await pool.query(`DELETE FROM carts WHERE session_id = $1`,[cartSessionId])
            }

            const orderDetails = await pool.query(
                `
                SELECT *
                FROM orders
                WHERE id = $1
                `,
                [orderId]
                );

                const items = await pool.query(
                `
                SELECT
                    oi.quantity,
                    oi.price_at_purchase,
                    p.name
                FROM order_items oi
                JOIN products p
                    ON p.id = oi.product_id
                WHERE oi.order_id = $1
                `,
                [orderId]
                );
            
        try {
            await sendOrderConfirmation({
                orderId,
                order: orderDetails.rows[0],
                items: items.rows
            });

            }
        catch (error) {

            console.error(
                "Failed to send email:",
                error
            );

        }

           

            break;
        }

        case "checkout.session.expired": {
          
            const session = event.data.object;

            const orderId = session.client_reference_id;

            await pool.query(
            `UPDATE orders
              SET status = $1
              WHERE id = $2
              AND status = $3`,
              ["Avbruten", orderId, "Obetald"]
             );

            break;
        }

        default:
            console.log(
            "Unhandled event:",
            event.type
            );
        }
    }
 
    catch (err) {
        console.error(err)
    return res.status(400).send(
        `Webhook Error: ${err.message}`
    );
}

  res.json({
    received: true,
  });
});

export default router;
