import { MysqlDialect, Kysely } from 'kysely';
import { createPool } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();
const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "bubbles_enterprise",
    charset: "utf8mb4",
    connectionLimit: 10
  })
});
const db = new Kysely({
  dialect
});

export { db as d };
