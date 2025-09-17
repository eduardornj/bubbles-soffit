import mysql from 'mysql2/promise';

async function initializeSecurityDatabase() {
  try {
    // Conectar ao banco de dados
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Cocacola10',
      database: 'bubbles_enterprise'
    });

    console.log('Connected to MySQL database');

    // Criar tabelas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        message TEXT,
        details JSON,
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_ip_address (ip_address),
        INDEX idx_severity (severity),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blocked_ips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL UNIQUE,
        reason TEXT NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'high',
        is_active BOOLEAN DEFAULT TRUE,
        blocked_by VARCHAR(100) DEFAULT 'system',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ip_address (ip_address),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at)
      )
    `);

    // Verificar se já existem dados
    const [existingLogs] = await connection.execute('SELECT COUNT(*) as total FROM security_logs');
    if (existingLogs[0].total === 0) {
      await connection.execute(`
        INSERT INTO security_logs (event_type, ip_address, severity, message, details) VALUES
        ('login_failed', '192.168.1.100', 'high', 'Failed login attempt for user admin', '{"username": "admin", "attempts": 5}'),
        ('brute_force', '192.168.1.101', 'critical', 'Multiple failed login attempts detected', '{"attempts": 50, "duration": "5 minutes"}'),
        ('suspicious_activity', '192.168.1.102', 'medium', 'Unusual access pattern detected', '{"requests_per_minute": 120}'),
        ('ip_blocked', '192.168.1.103', 'high', 'IP blocked due to security violation', '{"reason": "brute_force_attack"}'),
        ('login_success', '192.168.1.104', 'low', 'Successful login for user john_doe', '{"username": "john_doe"}'),
        ('sql_injection', '192.168.1.105', 'critical', 'SQL injection attempt blocked', '{"query": "SELECT * FROM users WHERE id = 1 OR 1=1"}'),
        ('xss_attempt', '192.168.1.106', 'high', 'Cross-site scripting attempt detected', '{"payload": "<script>alert(1)</script>"}'),
        ('file_upload', '192.168.1.107', 'medium', 'Suspicious file upload attempt', '{"filename": "malicious.php", "size": 1024}'),
        ('rate_limit', '192.168.1.108', 'low', 'Rate limit exceeded', '{"requests": 1000, "window": "1 minute"}'),
        ('unauthorized_access', '192.168.1.109', 'high', 'Unauthorized access attempt to admin panel', '{"endpoint": "/admin/users"}')
      `);
    }

    const [existingBlocked] = await connection.execute('SELECT COUNT(*) as total FROM blocked_ips');
    if (existingBlocked[0].total === 0) {
      await connection.execute(`
        INSERT INTO blocked_ips (ip_address, reason, severity, blocked_by) VALUES
        ('192.168.1.200', 'Brute force attack - 100 failed login attempts', 'critical', 'admin'),
        ('192.168.1.201', 'SQL injection attempts', 'high', 'system'),
        ('192.168.1.202', 'Suspicious automated activity', 'medium', 'admin'),
        ('10.0.0.50', 'DDoS attack participation', 'critical', 'system'),
        ('172.16.0.100', 'Port scanning detected', 'high', 'system')
      `);
    }

    // Verificar dados
    const [logs] = await connection.execute('SELECT COUNT(*) as total FROM security_logs');
    const [blocked] = await connection.execute('SELECT COUNT(*) as total FROM blocked_ips');
    
    console.log(`Total security logs: ${logs[0].total}`);
    console.log(`Total blocked IPs: ${blocked[0].total}`);

    await connection.end();
    console.log('Database initialization completed');

  } catch (error) {
    console.error('Error initializing security database:', error);
  }
}

initializeSecurityDatabase();