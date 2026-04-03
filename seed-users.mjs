import mysql from "mysql2/promise";

async function seedUsers() {
  const url = new URL(process.env.DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port || 3306,
    ssl: { rejectUnauthorized: false },
  });

  const users = [
    {
      openId: "master-jhonercp",
      name: "Jhoner Ricardo Pinto",
      email: "jhonercp@gmail.com",
      role: "admin",
      layer: "direcao",
      loginMethod: "email",
    },
    {
      openId: "client-jhonevsales",
      name: "Cliente Vértice",
      email: "jhonevsales@gmail.com",
      role: "user",
      layer: "operacional",
      loginMethod: "email",
    },
  ];

  for (const u of users) {
    try {
      await conn.execute(
        `INSERT INTO users (openId, name, email, role, layer, loginMethod, lastSignedIn)
         VALUES (?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role), layer=VALUES(layer), loginMethod=VALUES(loginMethod)`,
        [u.openId, u.name, u.email, u.role, u.layer, u.loginMethod]
      );
      console.log(`✓ User ${u.email} (${u.role}/${u.layer}) created/updated`);
    } catch (e) {
      // Try by email if openId conflict
      try {
        await conn.execute(
          `UPDATE users SET name=?, role=?, layer=?, loginMethod=? WHERE email=?`,
          [u.name, u.role, u.layer, u.loginMethod, u.email]
        );
        console.log(`✓ User ${u.email} updated by email`);
      } catch (e2) {
        console.error(`✗ Failed for ${u.email}:`, e2.message);
      }
    }
  }

  await conn.end();
  console.log("\nDone! Users seeded successfully.");
}

seedUsers().catch(console.error);
