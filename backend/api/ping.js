import { pool } from "../db";

export default async function handler(req, res) {
  console.log("Cron körs:", new Date().toISOString());

  try {
    await pool.query("SELECT 1");
    console.log("Ping OK");
    res.status(200).send("OK");
  } catch (err) {
    console.error("Ping failed:", err);
    res.status(500).send("FAIL");
  }
}