import mysql from "mysql2/promise";
import fs from "fs";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const sql = fs.readFileSync("drizzle/0003_open_midnight.sql", "utf-8");
const statements = sql.split(";").filter((s) => s.trim());

for (const statement of statements) {
  if (statement.trim()) {
    try {
      await connection.execute(statement);
      console.log("✓", statement.substring(0, 50) + "...");
    } catch (err) {
      console.log("⊘", statement.substring(0, 50) + "...", err.message);
    }
  }
}

await connection.end();
console.log("Migration complete");
