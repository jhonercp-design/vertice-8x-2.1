import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse MySQL URL
const url = new URL(dbUrl);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1).split('?')[0],
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Add SSL - required for TiDB Cloud
config.ssl = { rejectUnauthorized: false };

const pool = mysql.createPool(config);
const connection = await pool.getConnection();

const sql = `CREATE TABLE IF NOT EXISTS \`pipelines\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`companyId\` int NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`stages\` json NOT NULL,
  \`isDefault\` boolean DEFAULT false,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`pipelines_id\` PRIMARY KEY(\`id\`)
)`;

try {
  await connection.execute(sql);
  console.log('✓ Pipelines table created successfully');
} catch (error) {
  console.error('✗ Error creating pipelines table:', error.message);
} finally {
  connection.release();
  await pool.end();
}
