-- Tabelas MySQL para Sistema de Segurança
-- Criação das tabelas para logs de segurança, monitoramento e análise

-- Tabela principal de eventos de segurança
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
);

-- Tabela específica para logs de erro (404, 500, etc)
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
);

-- Tabela para violações CSP (Content Security Policy)
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
);

-- Tabela de tentativas de autenticação
CREATE TABLE IF NOT EXISTS auth_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at)
);

-- Tabela de comportamento do usuário para UEBA
CREATE TABLE IF NOT EXISTS user_behavior (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255),
    action_type VARCHAR(100) NOT NULL,
    resource_accessed VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    risk_score DECIMAL(5,3) DEFAULT 0.000,
    anomaly_detected BOOLEAN DEFAULT FALSE,
    details JSON,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_risk_score (risk_score),
    INDEX idx_anomaly_detected (anomaly_detected)
);

-- Tabela para correlação de eventos e detecção de ataques
CREATE TABLE IF NOT EXISTS attack_patterns (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pattern_name VARCHAR(100) NOT NULL,
    attack_type VARCHAR(50) NOT NULL,
    client_ip VARCHAR(45) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    event_count INT DEFAULT 1,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('active', 'resolved', 'false_positive') DEFAULT 'active',
    related_events JSON,
    mitigation_actions JSON,
    analyst_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pattern_name (pattern_name),
    INDEX idx_attack_type (attack_type),
    INDEX idx_client_ip (client_ip),
    INDEX idx_start_time (start_time),
    INDEX idx_severity (severity),
    INDEX idx_status (status)
);

-- Tabela para alertas e notificações
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
);

-- Tabela para monitoramento de rede e tráfego
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
);

-- Tabela para threat intelligence e feeds externos
CREATE TABLE IF NOT EXISTS threat_intelligence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    indicator_type ENUM('ip', 'domain', 'url', 'hash', 'email') NOT NULL,
    indicator_value VARCHAR(500) NOT NULL,
    threat_type VARCHAR(50),
    confidence_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    source VARCHAR(100) NOT NULL,
    description TEXT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    tags JSON,
    additional_info JSON,
    INDEX idx_indicator_type (indicator_type),
    INDEX idx_indicator_value (indicator_value(255)),
    INDEX idx_threat_type (threat_type),
    INDEX idx_source (source),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_indicator (indicator_type, indicator_value(255))
);

-- Tabela para compliance e auditoria
CREATE TABLE IF NOT EXISTS logs_compliance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    regulation VARCHAR(50) NOT NULL, -- GDPR, LGPD, SOX, PCI-DSS, etc
    event_type VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    action_performed VARCHAR(100),
    data_classification ENUM('public', 'internal', 'confidential', 'restricted') DEFAULT 'internal',
    client_ip VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retention_period INT DEFAULT 2555, -- dias (7 anos padrão)
    details JSON,
    INDEX idx_regulation (regulation),
    INDEX idx_event_type (event_type),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_data_classification (data_classification)
);

-- Views para relatórios e dashboards

-- View para estatísticas de segurança em tempo real
CREATE OR REPLACE VIEW security_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM security_events WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as events_24h,
    (SELECT COUNT(*) FROM security_alerts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as alerts_24h,
    (SELECT COUNT(*) FROM logs_error WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as errors_24h,
    (SELECT COUNT(*) FROM auth_attempts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as auth_attempts_24h,
    (SELECT COUNT(*) FROM user_behavior WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as behavior_events_24h,
    (SELECT COUNT(*) FROM logs_compliance WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as compliance_events_24h;

-- View para top IPs suspeitos
CREATE OR REPLACE VIEW top_suspicious_ips AS
SELECT 
    client_ip,
    COUNT(*) as event_count,
    SUM(CASE WHEN severity IN ('high', 'critical') THEN 1 ELSE 0 END) as high_severity_count,
    MAX(timestamp) as last_activity,
    GROUP_CONCAT(DISTINCT event_type) as event_types
FROM security_events 
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY client_ip
HAVING event_count > 10 OR high_severity_count > 0
ORDER BY high_severity_count DESC, event_count DESC
LIMIT 50;

-- Triggers para automação

DELIMITER //

-- Trigger para criar alertas automáticos em eventos críticos
CREATE TRIGGER create_critical_alert 
AFTER INSERT ON security_events
FOR EACH ROW
BEGIN
    IF NEW.severity = 'critical' THEN
        INSERT INTO security_alerts (
            alert_type, title, description, severity, 
            source_table, source_id, client_ip
        ) VALUES (
            'CRITICAL_SECURITY_EVENT',
            CONCAT('Critical Security Event: ', NEW.event_type),
            NEW.message,
            'critical',
            'security_events',
            NEW.id,
            NEW.client_ip
        );
    END IF;
END//

-- Trigger para detectar brute force em tentativas de login
CREATE TRIGGER detect_brute_force 
AFTER INSERT ON auth_attempts
FOR EACH ROW
BEGIN
    DECLARE attempt_count INT DEFAULT 0;
    
    -- Contar tentativas falhadas nas últimas 15 minutos
    SELECT COUNT(*) INTO attempt_count
    FROM auth_attempts 
    WHERE ip_address = NEW.ip_address 
    AND success = FALSE 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE);
    
    -- Se mais de 5 tentativas falhadas, criar alerta
    IF attempt_count >= 5 THEN
        -- Criar alerta
        INSERT INTO security_alerts (
            alert_type, title, description, severity, client_ip
        ) VALUES (
            'BRUTE_FORCE_ATTACK',
            CONCAT('Brute Force Attack Detected from ', NEW.ip_address),
            CONCAT('Multiple failed login attempts detected: ', attempt_count, ' attempts in 15 minutes'),
            'high',
            NEW.ip_address
        );
    END IF;
END//

DELIMITER ;

-- Índices compostos para performance
CREATE INDEX idx_security_events_composite ON security_events (timestamp, severity, client_ip);
CREATE INDEX idx_logs_error_composite ON logs_error (timestamp, error_code);
CREATE INDEX idx_auth_attempts_composite ON auth_attempts (created_at, ip_address, success);

-- Configurações de retenção de dados (opcional)
DELIMITER //

-- Criar evento para limpeza automática de dados antigos
CREATE EVENT IF NOT EXISTS cleanup_old_security_data
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Manter apenas 90 dias de logs de baixa severidade
    DELETE FROM security_events 
    WHERE severity = 'low' 
    AND timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Manter 1 ano de logs de média severidade
    DELETE FROM security_events 
    WHERE severity = 'medium' 
    AND timestamp < DATE_SUB(NOW(), INTERVAL 365 DAY);
    
    -- Logs críticos e altos: manter por 2 anos
    DELETE FROM security_events 
    WHERE severity IN ('high', 'critical') 
    AND timestamp < DATE_SUB(NOW(), INTERVAL 730 DAY);
    
    -- Limpar logs de erro antigos (6 meses)
    DELETE FROM logs_error 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 180 DAY)
    AND is_suspicious = FALSE;
    
    -- Limpar tentativas de auth antigas (1 ano)
    DELETE FROM auth_attempts 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 365 DAY);
END//

DELIMITER ;

-- Ativar o event scheduler
SET GLOBAL event_scheduler = ON;