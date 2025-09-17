import { createConnection } from 'mysql2/promise';

async function testConnection() {
  try {
    const connection = await createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Cocacola10',
      database: 'bubbles_enterprise'
    });

    console.log('✅ Connected to MySQL database');

    // Test security_logs table
    const [securityLogs] = await connection.execute('SELECT COUNT(*) as count FROM security_logs');
    console.log('📊 Security logs count:', securityLogs[0].count);

    // Test blocked_ips table
    const [blockedIPs] = await connection.execute('SELECT COUNT(*) as count FROM blocked_ips');
    console.log('🚫 Blocked IPs count:', blockedIPs[0].count);

    // Show sample data
    const [sampleLogs] = await connection.execute('SELECT * FROM security_logs LIMIT 3');
    console.log('📋 Sample security logs:', sampleLogs);

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();