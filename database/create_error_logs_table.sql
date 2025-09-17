-- Criação da tabela de logs de erros para o sistema Bubbles Enterprise
-- Database: bubbles_enterprise

USE bubbles_enterprise;

-- Tabela principal de logs de erros
CREATE TABLE IF NOT EXISTS error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_type ENUM('error', 'warning', 'info') NOT NULL DEFAULT 'error',
    error_code VARCHAR(10) DEFAULT NULL,
    message TEXT NOT NULL,
    page_url VARCHAR(500) NOT NULL,
    user_agent TEXT DEFAULT NULL,
    client_ip VARCHAR(45) DEFAULT NULL,
    referer VARCHAR(500) DEFAULT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    stack_trace TEXT DEFAULT NULL,
    additional_data JSON DEFAULT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at DATETIME DEFAULT NULL,
    resolved_by VARCHAR(100) DEFAULT NULL,
    INDEX idx_timestamp (timestamp),
    INDEX idx_error_type (error_type),
    INDEX idx_error_code (error_code),
    INDEX idx_page_url (page_url(255)),
    INDEX idx_is_resolved (is_resolved),
    INDEX idx_client_ip (client_ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para estatísticas de páginas mais acessadas com erros
CREATE TABLE IF NOT EXISTS page_error_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    error_count INT DEFAULT 1,
    last_error_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    first_error_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_page (page_url(255)),
    INDEX idx_error_count (error_count),
    INDEX idx_last_error (last_error_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger para atualizar estatísticas automaticamente
DELIMITER //
CREATE TRIGGER update_page_stats 
AFTER INSERT ON error_logs
FOR EACH ROW
BEGIN
    INSERT INTO page_error_stats (page_url, error_count, last_error_at, first_error_at)
    VALUES (NEW.page_url, 1, NEW.timestamp, NEW.timestamp)
    ON DUPLICATE KEY UPDATE
        error_count = error_count + 1,
        last_error_at = NEW.timestamp;
END//
DELIMITER ;

-- Inserir alguns dados de exemplo para teste
INSERT INTO error_logs (error_type, error_code, message, page_url, user_agent, client_ip, method) VALUES
('error', '404', 'Page not found', '/non-existent-page', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '127.0.0.1', 'GET'),
('error', '500', 'Internal server error', '/api/broken-endpoint', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '127.0.0.1', 'POST'),
('warning', NULL, 'Slow query detected', '/dashboard', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '127.0.0.1', 'GET'),
('error', '403', 'Access denied', '/admin/restricted', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', 'GET');