import mysql from "mysql2/promise";
import { config } from "dotenv";
import chalk from "chalk";
config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(chalk.blue("Database Connected"));
    conn.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

export default pool;
