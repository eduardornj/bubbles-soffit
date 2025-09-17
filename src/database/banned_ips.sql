-- Tabela para gerenciar IPs banidos
CREATE TABLE IF NOT EXISTS banned_ips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    ban_type ENUM('temporary', 'permanent') NOT NULL DEFAULT 'temporary',
    ban_reason TEXT,
    banned_by VARCHAR(100) DEFAULT 'system',
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    attempts_count INT DEFAULT 1,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ip_address (ip_address),
    INDEX idx_ban_type (ban_type),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at)
);

-- Procedure para banir IP
DELIMITER //
CREATE PROCEDURE BanIP(
    IN p_ip_address VARCHAR(45),
    IN p_ban_type ENUM('temporary', 'permanent'),
    IN p_ban_reason TEXT,
    IN p_banned_by VARCHAR(100),
    IN p_duration_hours INT
)
BEGIN
    DECLARE v_expires_at TIMESTAMP DEFAULT NULL;
    
    -- Calcular data de expiração para banimentos temporários
    IF p_ban_type = 'temporary' AND p_duration_hours > 0 THEN
        SET v_expires_at = DATE_ADD(NOW(), INTERVAL p_duration_hours HOUR);
    END IF;
    
    -- Inserir ou atualizar banimento
    INSERT INTO banned_ips (ip_address, ban_type, ban_reason, banned_by, expires_at)
    VALUES (p_ip_address, p_ban_type, p_ban_reason, p_banned_by, v_expires_at)
    ON DUPLICATE KEY UPDATE
        ban_type = p_ban_type,
        ban_reason = p_ban_reason,
        banned_by = p_banned_by,
        expires_at = v_expires_at,
        is_active = TRUE,
        attempts_count = attempts_count + 1,
        last_attempt_at = NOW(),
        updated_at = NOW();
END //
DELIMITER ;

-- Procedure para verificar se IP está banido
DELIMITER //
CREATE PROCEDURE CheckIPBan(
    IN p_ip_address VARCHAR(45)
)
BEGIN
    SELECT 
        id,
        ip_address,
        ban_type,
        ban_reason,
        banned_by,
        banned_at,
        expires_at,
        is_active,
        attempts_count,
        CASE 
            WHEN ban_type = 'permanent' THEN TRUE
            WHEN ban_type = 'temporary' AND (expires_at IS NULL OR expires_at > NOW()) THEN TRUE
            ELSE FALSE
        END as is_banned
    FROM banned_ips 
    WHERE ip_address = p_ip_address 
    AND is_active = TRUE;
END //
DELIMITER ;

-- Procedure para desbanir IP
DELIMITER //
CREATE PROCEDURE UnbanIP(
    IN p_ip_address VARCHAR(45),
    IN p_unbanned_by VARCHAR(100)
)
BEGIN
    UPDATE banned_ips 
    SET is_active = FALSE,
        updated_at = NOW()
    WHERE ip_address = p_ip_address;
    
    -- Log da ação de desbanimento
    INSERT INTO security_events (event_type, ip_address, details, created_at)
    VALUES ('ip_unbanned', p_ip_address, 
            JSON_OBJECT('unbanned_by', p_unbanned_by, 'timestamp', NOW()), 
            NOW());
END //
DELIMITER ;

-- Procedure para limpar banimentos expirados
DELIMITER //
CREATE PROCEDURE CleanExpiredBans()
BEGIN
    UPDATE banned_ips 
    SET is_active = FALSE,
        updated_at = NOW()
    WHERE ban_type = 'temporary' 
    AND expires_at IS NOT NULL 
    AND expires_at <= NOW() 
    AND is_active = TRUE;
    
    SELECT ROW_COUNT() as cleaned_bans;
END //
DELIMITER ;

-- Event para limpeza automática de banimentos expirados (executa a cada hora)
CREATE EVENT IF NOT EXISTS clean_expired_bans
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
  CALL CleanExpiredBans();

-- Inserir alguns dados de exemplo
INSERT INTO banned_ips (ip_address, ban_type, ban_reason, banned_by, expires_at) VALUES
('192.168.1.100', 'temporary', 'Multiple failed login attempts', 'admin', DATE_ADD(NOW(), INTERVAL 24 HOUR)),
('10.0.0.50', 'permanent', 'Malicious activity detected', 'security_system', NULL),
('203.0.113.1', 'temporary', 'Suspicious behavior pattern', 'auto_ban_system', DATE_ADD(NOW(), INTERVAL 2 HOUR));