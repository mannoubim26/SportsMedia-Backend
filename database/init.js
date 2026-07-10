// database/init.js
// One-off script to create tables and seed data on the connected MySQL
// database (e.g. Railway). Run it from the deployed environment:
//
//   node database/init.js
//
// It uses the same DB_* environment variables as the app and executes
// database/railway.sql (which has no CREATE DATABASE / USE statements,
// so it targets whatever database you are connected to).

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sqlPath = path.join(__dirname, 'railway.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_social_db',
    multipleStatements: true,
  });

  console.log(`Connected to ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} / ${process.env.DB_NAME}`);
  console.log('Running database/railway.sql ...');

  await connection.query(sql);

  const [tables] = await connection.query('SHOW TABLES;');
  console.log('Done. Tables now present:');
  console.table(tables);

  await connection.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Database init failed:', err.message);
  process.exit(1);
});
