import fs from "fs";
import path from "path";
import { pool } from "../config/db";

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  console.log("[migrate] Applying schema.sql ...");
  await pool.query(sql);
  console.log("[migrate] Done.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("[migrate] Failed:", err);
  process.exit(1);
});
