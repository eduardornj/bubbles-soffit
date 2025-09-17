// MySQL Security Logger - Sistema avançado de logging de segurança
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

class MySQLSecurityLogger {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.initializeConnection();
    }

    async initializeConnection() {
        try {
            // Configuração do pool de conexões MySQL - USANDO O MESMO BANCO DO GROK
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.MYSQL_PASSWORD || '',
                database: 'bubbles_enterprise', // Mesmo banco do chat do Grok
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                acquireTimeout: 60000,
                timeout: 60000,
                reconnect: true
            });

            // Testar conexão
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            console.log('✅ MySQL Security Logger connected successfully');
            
            // Criar tabelas se não existirem
            await this.createTablesIfNotExist();
            
        } catch (error) {
            console.error('❌ MySQL Security Logger connection failed:', error.message);
            this.isConnected = false;
            
            // Fallback para arquivo se MySQL não estiver disponível
            console.log('📝 Falling back to file-based logging');
        }
    }

    async createTablesIfNotExist() {
        try {
            const sqlFile = path.join(process.cwd(), 'database', 'security_tables.sql');
            const sqlContent = await fs.readFile(sqlFile, 'utf8');

            const lines = sqlContent.split('\n');
            let currentDelimiter = ';';
            let statement = '';

            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith('--')) continue;

                if (line.toUpperCase().startsWith('DELIMITER ')) {
                    currentDelimiter = line.split(' ')[1].trim();
                    continue;
                }

                statement += line + ' ';

                if (line.endsWith(currentDelimiter)) {
                    statement = statement.slice(0, -currentDelimiter.length).trim();
                    if (statement) {
                        try {
                            await this.pool.query(statement);
                            console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
                        } catch (stmtError) {
                            console.warn(`⚠️ SQL Statement failed: ${stmtError.message}`);
                            console.warn(`Statement: ${statement.substring(0, 100)}...`);
                        }
                        statement = '';
                    }
                }
            }

            if (statement.trim()) {
                try {
                    await this.pool.query(statement);
                    console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
                } catch (stmtError) {
                    console.warn(`⚠️ SQL Statement failed: ${stmtError.message}`);
                    console.warn(`Statement: ${statement.substring(0, 100)}...`);
                }
            }

            console.log('✅ Security tables creation process completed');
        } catch (error) {
            console.error('❌ Error creating security tables:', error.message);
        }
    }

    // Log de eventos de segurança gerais
    async logSecurityEvent(eventData) {
        if (!this.isConnected) {
            return this.fallbackToFileLog('security-events', eventData);
        }

        try {
            const query = `
                INSERT INTO security_events (
                    event_type, severity, client_ip, user_agent, 
                    message, details, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            const values = [
                eventData.type || 'UNKNOWN',
                eventData.severity || 'low',
                eventData.clientIP || 'unknown',
                eventData.userAgent || 'unknown',
                eventData.message || '',
                JSON.stringify(eventData.details || {}),
                new Date()
            ];

            const [result] = await this.pool.execute(query, values);
            
            // Processar evento para alertas em tempo real
            const processedEventData = {
                id: result.insertId,
                event_type: eventData.type || 'UNKNOWN',
                severity: eventData.severity || 'low',
                client_ip: eventData.clientIP || 'unknown',
                user_agent: eventData.userAgent || 'unknown',
                message: eventData.message || '',
                details: eventData.details || {},
                timestamp: new Date().toISOString()
            };
            
            // Importar dinamicamente para evitar dependência circular
            try {
                const { default: realTimeAlerts } = await import('./realTimeAlerts.js');
                await realTimeAlerts.processSecurityEvent(processedEventData);
            } catch (alertError) {
                console.warn('⚠️ Real-time alerts not available:', alertError.message);
            }
            
            // Se for evento crítico, criar alerta automático
            if (eventData.severity === 'critical') {
                await this.createSecurityAlert({
                    type: 'CRITICAL_SECURITY_EVENT',
                    title: `Critical Event: ${eventData.type}`,
                    description: eventData.message,
                    severity: 'critical',
                    clientIP: eventData.clientIP
                });
            }
            
            return result.insertId;
            
        } catch (error) {
            console.error('Error logging security event to MySQL:', error);
            return this.fallbackToFileLog('security-events', eventData);
        }
    }

    // Log de erros HTTP (404, 500, etc)
    async logErrorEvent(errorData) {
        if (!this.isConnected) {
            return this.fallbackToFileLog('error-logs', errorData);
        }

        try {
            const query = `
                INSERT INTO logs_error (
                    error_code, requested_path, client_ip, user_agent, 
                    referer, method, is_suspicious, suspicious_patterns,
                    headers, query_params, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                errorData.errorCode || 404,
                errorData.requestedPath || '/',
                errorData.clientIP || 'unknown',
                errorData.userAgent || 'unknown',
                errorData.referer || 'direct',
                errorData.method || 'GET',
                errorData.isSuspicious || false,
                JSON.stringify(errorData.suspiciousPatterns || []),
                JSON.stringify(errorData.headers || {}),
                JSON.stringify(errorData.queryParams || {}),
                new Date()
            ];

            await this.pool.execute(query, values);
            
        } catch (error) {
            console.error('Error logging error event to MySQL:', error);
            return this.fallbackToFileLog('error-logs', errorData);
        }
    }

    // Log de violações CSP
    async logCSPViolation(cspData) {
        if (!this.isConnected) {
            return this.fallbackToFileLog('csp-violations', cspData);
        }

        try {
            const query = `
                INSERT INTO csp_violations (
                    document_uri, blocked_uri, violated_directive, 
                    effective_directive, original_policy, disposition,
                    client_ip, user_agent, source_file, line_number, 
                    column_number, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                cspData.documentURI || '',
                cspData.blockedURI || '',
                cspData.violatedDirective || '',
                cspData.effectiveDirective || '',
                cspData.originalPolicy || '',
                cspData.disposition || 'report',
                cspData.clientIP || 'unknown',
                cspData.userAgent || 'unknown',
                cspData.sourceFile || '',
                cspData.lineNumber || 0,
                cspData.columnNumber || 0,
                new Date()
            ];

            await this.pool.execute(query, values);
            
        } catch (error) {
            console.error('Error logging CSP violation to MySQL:', error);
            return this.fallbackToFileLog('csp-violations', cspData);
        }
    }

    // Log de tentativas de autenticação
    async logAuthAttempt(authData) {
        if (!this.isConnected) {
            return this.fallbackToFileLog('auth-attempts', authData);
        }

        try {
            const query = `
                INSERT INTO auth_attempts (
                    username, email, attempt_type, success, failure_reason,
                    client_ip, user_agent, session_id, geolocation,
                    device_fingerprint, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                authData.username || null,
                authData.email || null,
                authData.attemptType || 'login',
                authData.success || false,
                authData.failureReason || null,
                authData.clientIP || 'unknown',
                authData.userAgent || 'unknown',
                authData.sessionId || null,
                JSON.stringify(authData.geolocation || {}),
                authData.deviceFingerprint || null,
                new Date()
            ];

            await this.pool.execute(query, values);
            
        } catch (error) {
            console.error('Error logging auth attempt to MySQL:', error);
            return this.fallbackToFileLog('auth-attempts', authData);
        }
    }

    // Criar alertas de segurança
    async createSecurityAlert(alertData) {
        if (!this.isConnected) return;

        try {
            const query = `
                INSERT INTO security_alerts (
                    alert_type, title, description, severity, client_ip,
                    affected_resources, recommended_actions, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
            `;
            
            const values = [
                alertData.type || 'SECURITY_EVENT',
                alertData.title || 'Security Alert',
                alertData.description || '',
                alertData.severity || 'medium',
                alertData.clientIP || null,
                JSON.stringify(alertData.affectedResources || []),
                JSON.stringify(alertData.recommendedActions || [])
            ];

            const [result] = await this.pool.execute(query, values);
            
            console.log(`🚨 Security alert created: ${alertData.title}`);
            return result.insertId;
            
        } catch (error) {
            console.error('Error creating security alert:', error);
            throw error;
        }
    }

    // Análise de comportamento do usuário
    async logUserBehavior(behaviorData) {
        if (!this.isConnected) return;

        try {
            const query = `
                INSERT INTO user_behavior (
                    user_id, session_id, action_type, resource_accessed,
                    client_ip, user_agent, duration_ms, anomaly_score,
                    is_anomaly, risk_factors, geolocation, device_info
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                behaviorData.userId || null,
                behaviorData.sessionId || null,
                behaviorData.actionType || 'unknown',
                behaviorData.resourceAccessed || '',
                behaviorData.clientIP || 'unknown',
                behaviorData.userAgent || 'unknown',
                behaviorData.durationMs || 0,
                behaviorData.anomalyScore || 0.0,
                behaviorData.isAnomaly || false,
                JSON.stringify(behaviorData.riskFactors || {}),
                JSON.stringify(behaviorData.geolocation || {}),
                JSON.stringify(behaviorData.deviceInfo || {})
            ];

            await this.pool.execute(query, values);
            
        } catch (error) {
            console.error('Error logging user behavior:', error);
        }
    }

    // Obter estatísticas do dashboard
    async getDashboardStats(timeRange = '24h') {
        if (!this.isConnected) return null;

        try {
            const timeCondition = this.getTimeCondition(timeRange);
            
            const [stats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total_events,
                    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_events,
                    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_events,
                    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_events,
                    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_events,
                    COUNT(DISTINCT client_ip) as unique_ips
                FROM security_events 
                WHERE ${timeCondition}
            `);

            const [errorStats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total_errors,
                    SUM(CASE WHEN is_suspicious THEN 1 ELSE 0 END) as suspicious_errors,
                    COUNT(DISTINCT client_ip) as unique_error_ips
                FROM logs_error 
                WHERE ${timeCondition}
            `);

            const [cspStats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total_violations,
                    COUNT(DISTINCT violated_directive) as unique_directives
                FROM csp_violations 
                WHERE ${timeCondition}
            `);

            // Top ameaças
            const [topThreats] = await this.pool.execute(`
                SELECT client_ip, COUNT(*) as event_count, 
                       GROUP_CONCAT(DISTINCT event_type) as event_types
                FROM security_events 
                WHERE ${timeCondition} AND severity IN ('medium', 'high', 'critical')
                GROUP BY client_ip 
                ORDER BY event_count DESC 
                LIMIT 10
            `);
            
            // Eventos recentes
            const [recentEvents] = await this.pool.execute(`
                SELECT event_type, severity, client_ip, message, timestamp
                FROM security_events 
                WHERE ${timeCondition}
                ORDER BY timestamp DESC 
                LIMIT 20
            `);

            return {
                security: stats[0],
                errors: errorStats[0],
                csp: cspStats[0],
                topThreats: topThreats || [],
                recentEvents: recentEvents || []
            };
            
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return null;
        }
    }

    // Obter estatísticas de alertas
    async getAlertStats() {
        if (!this.isConnected) return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };

        try {
            const [stats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
                    SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
                    SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
                    SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
                FROM security_alerts 
                WHERE DATE(created_at) = CURDATE()
            `);
            
            return stats[0] || { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
            
        } catch (error) {
            console.error('Error getting alert stats:', error);
            return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
        }
    }

    // Obter top IPs suspeitos
    async getTopSuspiciousIPs(limit = 10) {
        if (!this.isConnected) return [];

        try {
            const [results] = await this.pool.execute(`
                SELECT 
                    client_ip,
                    COUNT(*) as event_count,
                    SUM(CASE WHEN severity IN ('high', 'critical') THEN 1 ELSE 0 END) as high_severity_count,
                    MAX(timestamp) as last_activity,
                    GROUP_CONCAT(DISTINCT event_type) as event_types
                FROM security_events 
                WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY client_ip
                HAVING event_count > 5 OR high_severity_count > 0
                ORDER BY high_severity_count DESC, event_count DESC
                LIMIT ?
            `, [limit]);

            return results;
            
        } catch (error) {
            console.error('Error getting suspicious IPs:', error);
            return [];
        }
    }

    // Obter alertas ativos
    async getActiveAlerts(limit = 20) {
        if (!this.isConnected) return [];

        try {
            const [results] = await this.pool.execute(`
                SELECT *
                FROM security_alerts 
                WHERE status IN ('new', 'acknowledged', 'investigating')
                ORDER BY severity DESC, created_at DESC
                LIMIT ?
            `, [limit]);

            return results;
            
        } catch (error) {
            console.error('Error getting active alerts:', error);
            return [];
        }
    }

    // Migrar logs existentes dos arquivos para MySQL
    async migrateExistingLogs() {
        if (!this.isConnected) {
            console.log('❌ Cannot migrate: MySQL not connected');
            return;
        }

        console.log('🔄 Starting migration of existing logs to MySQL...');
        
        try {
            // Migrar logs de erro
            await this.migrateErrorLogs();
            
            // Migrar logs de CSP
            await this.migrateCSPLogs();
            
            console.log('✅ Log migration completed successfully');
            
        } catch (error) {
            console.error('❌ Error during log migration:', error);
        }
    }

    async migrateErrorLogs() {
        try {
            const logFile = path.join(process.cwd(), 'logs', 'error-pages.log');
            const content = await fs.readFile(logFile, 'utf8');
            const lines = content.split('\n').filter(line => line.trim());
            
            let migrated = 0;
            
            for (const line of lines) {
                try {
                    const logData = JSON.parse(line);
                    await this.logErrorEvent({
                        errorCode: logData.statusCode || 404,
                        requestedPath: logData.url || '/',
                        clientIP: logData.clientIP || 'unknown',
                        userAgent: logData.userAgent || 'unknown',
                        referer: logData.referer || 'direct',
                        method: logData.method || 'GET',
                        isSuspicious: logData.suspicious || false,
                        headers: logData.headers || {},
                        queryParams: logData.query || {}
                    });
                    migrated++;
                } catch (parseError) {
                    // Ignorar linhas com formato inválido
                    continue;
                }
            }
            
            console.log(`✅ Migrated ${migrated} error log entries`);
            
        } catch (error) {
            console.log('ℹ️ No existing error logs found or error reading file');
        }
    }

    async migrateCSPLogs() {
        try {
            const logFile = path.join(process.cwd(), 'logs', 'csp-violations.log');
            const content = await fs.readFile(logFile, 'utf8');
            const lines = content.split('\n').filter(line => line.trim());
            
            let migrated = 0;
            
            for (const line of lines) {
                try {
                    const logData = JSON.parse(line);
                    await this.logCSPViolation({
                        documentURI: logData.documentURI || '',
                        blockedURI: logData.blockedURI || '',
                        violatedDirective: logData.violatedDirective || '',
                        effectiveDirective: logData.effectiveDirective || '',
                        originalPolicy: logData.originalPolicy || '',
                        disposition: logData.disposition || 'report',
                        clientIP: logData.clientIP || 'unknown',
                        userAgent: logData.userAgent || 'unknown',
                        sourceFile: logData.sourceFile || '',
                        lineNumber: logData.lineNumber || 0,
                        columnNumber: logData.columnNumber || 0
                    });
                    migrated++;
                } catch (parseError) {
                    continue;
                }
            }
            
            console.log(`✅ Migrated ${migrated} CSP violation entries`);
            
        } catch (error) {
            console.log('ℹ️ No existing CSP logs found or error reading file');
        }
    }

    // Fallback para logging em arquivo quando MySQL não está disponível
    async fallbackToFileLog(type, data) {
        try {
            const logsDir = path.join(process.cwd(), 'logs');
            await fs.mkdir(logsDir, { recursive: true });
            
            const logFile = path.join(logsDir, `${type}.log`);
            const logEntry = JSON.stringify({
                ...data,
                timestamp: new Date().toISOString()
            }) + '\n';
            
            await fs.appendFile(logFile, logEntry);
            
        } catch (error) {
            console.error('Error writing to fallback log file:', error);
        }
    }

    // Utilitário para condições de tempo
    getTimeCondition(timeRange) {
        const conditions = {
            '1h': 'timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)',
            '24h': 'timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)',
            '7d': 'timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
            '30d': 'timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        };
        
        return conditions[timeRange] || conditions['24h'];
    }

    // Fechar conexões
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('🔌 MySQL Security Logger disconnected');
        }
    }
}

// Instância singleton
const mysqlSecurityLogger = new MySQLSecurityLogger();

export { mysqlSecurityLogger, MySQLSecurityLogger };
export default mysqlSecurityLogger;