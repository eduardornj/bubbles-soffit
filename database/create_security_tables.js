import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function createSecurityTables() {
  try {
    console.log('🔧 Criando tabelas de segurança no banco bubbles_enterprise...');
    
    // Conectar ao banco existente
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'bubbles_enterprise'
    });
    
    console.log('✅ Conectado ao banco bubbles_enterprise');
    
    // Verificar se já existe a tabela do chat
    const [chatTables] = await connection.execute("SHOW TABLES LIKE 'chat_conversations'");
    console.log(`✅ Tabela do chat encontrada: ${chatTables.length > 0 ? 'SIM' : 'NÃO'}`);
    
    // Criar tabelas de segurança
    console.log('📋 Criando tabelas de segurança...');
    
    // 1. Tabela principal de eventos de segurança
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS security_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
        client_ip VARCHAR(45) NOT NULL,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        message TEXT,
        details JSON,
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_severity (severity),
        INDEX idx_client_ip (client_ip),
        INDEX idx_timestamp (timestamp),
        INDEX idx_resolved (resolved)
      )
    `);
    console.log('✅ Tabela security_events criada');
    
    // 2. Tabela de logs de erro
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS logs_error (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        error_code INT NOT NULL,
        requested_path VARCHAR(500) NOT NULL,
        client_ip VARCHAR(45) NOT NULL,
        user_agent TEXT,
        referer TEXT,
        method VARCHAR(10) DEFAULT 'GET',
        response_time_ms INT,
        is_suspicious BOOLEAN DEFAULT FALSE,
        suspicious_patterns JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        headers JSON,
        query_params JSON,
        INDEX idx_error_code (error_code),
        INDEX idx_client_ip (client_ip),
        INDEX idx_requested_path (requested_path(255)),
        INDEX idx_is_suspicious (is_suspicious),
        INDEX idx_timestamp (timestamp)
      )
    `);
    console.log('✅ Tabela logs_error criada');
    
    // 3. Tabela de violações CSP
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS csp_violations (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        document_uri VARCHAR(500) NOT NULL,
        blocked_uri VARCHAR(500),
        violated_directive VARCHAR(100),
        effective_directive VARCHAR(100),
        original_policy TEXT,
        disposition ENUM('enforce', 'report') DEFAULT 'report',
        status_code INT,
        client_ip VARCHAR(45) NOT NULL,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source_file VARCHAR(500),
        line_number INT,
        column_number INT,
        INDEX idx_document_uri (document_uri(255)),
        INDEX idx_blocked_uri (blocked_uri(255)),
        INDEX idx_violated_directive (violated_directive),
        INDEX idx_client_ip (client_ip),
        INDEX idx_timestamp (timestamp)
      )
    `);
    console.log('✅ Tabela csp_violations criada');
    
    // 4. Tabela de tentativas de autenticação
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS auth_attempts (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(255),
        attempt_type ENUM('login', 'register', 'password_reset', 'token_refresh') NOT NULL,
        success BOOLEAN DEFAULT FALSE,
        failure_reason VARCHAR(100),
        client_ip VARCHAR(45) NOT NULL,
        user_agent TEXT,
        session_id VARCHAR(100),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        geolocation JSON,
        device_fingerprint VARCHAR(255),
        is_brute_force BOOLEAN DEFAULT FALSE,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_client_ip (client_ip),
        INDEX idx_success (success),
        INDEX idx_timestamp (timestamp),
        INDEX idx_is_brute_force (is_brute_force)
      )
    `);
    console.log('✅ Tabela auth_attempts criada');
    
    // 5. Tabela de alertas de segurança
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS security_alerts (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        alert_type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        source_table VARCHAR(50),
        source_id BIGINT,
        status ENUM('new', 'acknowledged', 'investigating', 'resolved', 'false_positive') DEFAULT 'new',
        assigned_to VARCHAR(100),
        client_ip VARCHAR(45),
        affected_resources JSON,
        recommended_actions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        acknowledged_at TIMESTAMP NULL,
        resolved_at TIMESTAMP NULL,
        INDEX idx_alert_type (alert_type),
        INDEX idx_severity (severity),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_client_ip (client_ip)
      )
    `);
    console.log('✅ Tabela security_alerts criada');
    
    // 6. Tabela de análise comportamental
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_behavior (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100),
        session_id VARCHAR(100),
        action_type VARCHAR(50) NOT NULL,
        resource_accessed VARCHAR(500),
        client_ip VARCHAR(45) NOT NULL,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration_ms INT,
        anomaly_score DECIMAL(5,2) DEFAULT 0.00,
        is_anomaly BOOLEAN DEFAULT FALSE,
        risk_factors JSON,
        geolocation JSON,
        device_info JSON,
        INDEX idx_user_id (user_id),
        INDEX idx_session_id (session_id),
        INDEX idx_action_type (action_type),
        INDEX idx_client_ip (client_ip),
        INDEX idx_timestamp (timestamp),
        INDEX idx_is_anomaly (is_anomaly),
        INDEX idx_anomaly_score (anomaly_score)
      )
    `);
    console.log('✅ Tabela user_behavior criada');
    
    // 7. Tabela de monitoramento de rede
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS network_monitoring (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        client_ip VARCHAR(45) NOT NULL,
        request_count INT DEFAULT 1,
        bytes_transferred BIGINT DEFAULT 0,
        unique_paths INT DEFAULT 1,
        error_rate DECIMAL(5,2) DEFAULT 0.00,
        avg_response_time_ms INT DEFAULT 0,
        suspicious_activity BOOLEAN DEFAULT FALSE,
        rate_limit_exceeded BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        time_window ENUM('1min', '5min', '15min', '1hour', '1day') DEFAULT '1min',
        geolocation JSON,
        threat_intelligence JSON,
        INDEX idx_client_ip (client_ip),
        INDEX idx_timestamp (timestamp),
        INDEX idx_time_window (time_window),
        INDEX idx_suspicious_activity (suspicious_activity),
        INDEX idx_rate_limit_exceeded (rate_limit_exceeded)
      )
    `);
    console.log('✅ Tabela network_monitoring criada');
    
    // Verificar todas as tabelas criadas
    const [allTables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tabelas no banco bubbles_enterprise:');
    allTables.forEach(table => {
      const tableName = Object.values(table)[0];
      const isSecurityTable = ['security_events', 'logs_error', 'csp_violations', 'auth_attempts', 'security_alerts', 'user_behavior', 'network_monitoring'].includes(tableName);
      const isChatTable = tableName === 'chat_conversations';
      console.log(`${isSecurityTable ? '🔒' : isChatTable ? '💬' : '📋'} ${tableName}`);
    });
    
    await connection.end();
    console.log('\n✅ Tabelas de segurança criadas com sucesso no banco bubbles_enterprise!');
    console.log('🔗 Conexão MySQL: mysql://root@localhost:3306/bubbles_enterprise');
    console.log('💬 Tabela do chat do Grok: chat_conversations');
    console.log('🔒 Tabelas de segurança: security_events, logs_error, csp_violations, auth_attempts, security_alerts, user_behavior, network_monitoring');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas de segurança:', error);
    process.exit(1);
  }
}

createSecurityTables();