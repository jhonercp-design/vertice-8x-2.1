import mysql from "mysql2/promise";
import fs from "fs";

const sql = fs.readFileSync("./drizzle/0004_sturdy_devos.sql", "utf-8");

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const statements = sql.split("--> statement-breakpoint").filter(s => s.trim());

for (const statement of statements) {
  const trimmed = statement.trim();
  if (trimmed) {
    console.log("Executing:", trimmed.substring(0, 50) + "...");
    await connection.execute(trimmed);
  }
}

console.log("Migration applied successfully!");
await connection.end();
