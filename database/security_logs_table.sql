-- Tabela security_logs para compatibilidade com endpoints existentes
CREATE TABLE IF NOT EXISTS security_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    details TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at),
    INDEX idx_severity (severity)
);

-- Tabela blocked_ips para bloqueio de IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    reason VARCHAR(255) DEFAULT 'Blocked via security system',
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    blocked_by VARCHAR(100) DEFAULT 'system',
    INDEX idx_ip_address (ip_address),
    INDEX idx_blocked_at (blocked_at),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
);

-- Inserir dados de exemplo para testes
INSERT INTO security_logs (event_type, ip_address, details, severity) VALUES
('login_attempt', '192.168.1.100', 'Failed login attempt for user admin', 'medium'),
('page_not_found', '10.0.0.1', '404 error accessing /admin/config.php', 'low'),
('suspicious_activity', '172.16.0.50', 'Multiple rapid requests detected', 'high'),
('login_success', '192.168.1.100', 'Successful login for user john.doe', 'low');