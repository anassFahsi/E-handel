import express from "express";
import pool from "../db.js";
import multer from "multer";
import { auth } from "../middleware/auth.js";
import { admin } from "../middleware/admin.js";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


router.get("/stats", auth, admin, async (req, res) => {
  try {
    const productsRes = await pool.query("SELECT COUNT(*) FROM products");
    const ordersRes = await pool.query("SELECT COUNT(*) FROM orders");
    const usersRes = await pool.query("SELECT COUNT(*) FROM users");

    res.json({
      products: Number(productsRes.rows[0].count),
      orders: Number(ordersRes.rows[0].count),
      users: Number(usersRes.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch stats" });
  }
});


router.get("/orders/latest", auth, admin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, customer_name, total, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch latest orders" });
  }
});


router.get("/products", auth, admin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch products" });
  }
});


router.post("/products", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category_id } = req.body;
    const image_url = `/uploads/${req.file.filename}`;

    const categoryRes = await pool.query(
      "SELECT id FROM categories WHERE name = $1",
      [category_id]
    );

    if (categoryRes.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const catId = categoryRes.rows[0].id;

    const result = await pool.query(
      `INSERT INTO products (name, price, description, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, price, description, image_url, catId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create product" });
  }
});

router.get("/products/:id", auth, admin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch product" });
  }
});



router.put("/products/:id", auth, admin, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;


  let finalImageUrl = req.body.image_url;

  if (req.file) {
    finalImageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           image_url = $3,
           price = $4,
           stock = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, finalImageUrl, price, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update product" });
  }
});


router.delete("/products/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM products
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      deletedProduct: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete product" });
  }
});


router.get("/products/:id/variants", auth, admin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM product_variants WHERE product_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch variants" });
  }
});

router.post("/products/:id/variants", auth, admin, async (req, res) => {
  const { size, color, stock } = req.body;

  try {
    await pool.query(
      `INSERT INTO product_variants (product_id, size, color, stock)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, size, color, stock]
    );

    res.json({ message: "Variant added" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not add variant" });
  }
});

router.put("/variants/:variantId", auth, admin, async (req, res) => {
  const { size, color, stock } = req.body;

  try {
    await pool.query(
      `UPDATE product_variants
       SET size = $1, color = $2, stock = $3
       WHERE id = $4`,
      [size, color, stock, req.params.variantId]
    );

    res.json({ message: "Variant updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update variant" });
  }
});

router.delete("/products/variants/:variantId", auth, admin, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM product_variants WHERE id = $1",
      [req.params.variantId]
    );

    res.json({ message: "Variant deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete variant" });
  }
});


router.get("/orders", auth, admin, async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;
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


router.get("/orders/:id", auth, admin, async (req, res) => {
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
      SELECT oi.product_id, p.name, oi.variant_id, oi.quantity, oi.price_at_purchase,
             pv.size, pv.color, pv.stock,
             (oi.quantity * oi.price_at_purchase) AS subtotal
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN product_variants pv ON pv.id = oi.variant_id
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


router.delete("/orders/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM orders WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete order" });
  }
});


router.put("/orders/:id/status", auth, admin, async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    await pool.query("BEGIN");

    await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      [status, orderId]
    );

    if (status === "Refunded") {
      const variantsRes = await pool.query(`
        SELECT variant_id, quantity
        FROM order_items
        WHERE order_id = $1
      `, [orderId]);

      for (const item of variantsRes.rows) {
        await pool.query(
          `UPDATE product_variants SET stock = stock + $1 WHERE id = $2`,
          [item.quantity, item.variant_id]
        );
      }
    }

    await pool.query("COMMIT");
    res.json({ message: "Orderstatus uppdaterad" });

  } catch (err) {
    console.error(err);
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Kunde inte uppdatera orderstatus" });
  }
});

export default router;

