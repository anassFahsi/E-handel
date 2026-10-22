import express from "express";
import stripe from "../integrations/stripeAdapter.js";
import pool from "../db.js";
const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    try{
        const event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
        );
        switch (event.type) {

        case "checkout.session.completed": {

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
           

            break;
        }

        case "checkout.session.expired": {
            console.log('SESSION EXPIRED')
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
