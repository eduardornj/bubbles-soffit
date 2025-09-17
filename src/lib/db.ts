import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

interface SecurityLog {
  id: number;
  event_type: string;
  ip_address: string;
  message: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_agent?: string;
  referrer?: string;
  created_at: Date;
}

interface BlockedIp {
  id: number;
  ip_address: string;
  reason: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  blocked_by?: string;
  created_at: Date;
  updated_at: Date;
}

interface Database {
  security_logs: SecurityLog;
  blocked_ips: BlockedIp;
}

const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bubbles_enterprise',
    charset: 'utf8mb4',
    connectionLimit: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});

export default db;