import { WebSocketServer } from 'ws';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// MySQL Security Logger - Sistema avançado de logging de segurança

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
            
            // Limpar comentários e linhas vazias
            const cleanedContent = sqlContent
                .split('\n')
                .filter(line => {
                    const trimmed = line.trim();
                    return trimmed && !trimmed.startsWith('--');
                })
                .join('\n');
            
            // Executar cada statement SQL separadamente
            const statements = cleanedContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);
            
            for (const statement of statements) {
                try {
                    if (statement.trim()) {
                        await this.pool.execute(statement);
                        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
                    }
                } catch (stmtError) {
                    // Log erro mas continue com próximos statements
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
                const { default: realTimeAlerts } = await Promise.resolve().then(() => realTimeAlerts$1);
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

const mysqlSecurityLogger$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    MySQLSecurityLogger,
    default: mysqlSecurityLogger,
    mysqlSecurityLogger
}, Symbol.toStringTag, { value: 'Module' }));

// Security Logging and Monitoring System
// Advanced threat detection logging for 2025 security measures

class SecurityLogger {
  constructor() {
    this.logBuffer = [];
    this.maxBufferSize = 1000;
    this.flushInterval = 30000; // 30 seconds
    this.threatPatterns = new Map();
    
    // Start periodic log flushing
    this.startPeriodicFlush();
  }

  // Log security events
  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      severity: event.severity || 'INFO',
      clientIP: event.clientIP,
      userAgent: event.userAgent,
      riskLevel: event.riskLevel,
      riskFactors: event.riskFactors || [],
      action: event.action,
      details: event.details || {},
      sessionId: event.sessionId,
      endpoint: event.endpoint
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Immediate console log for high severity events
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      console.warn('🚨 High Severity Security Event:', logEntry);
    }

    // Update threat patterns
    this.updateThreatPatterns(logEntry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }

    return logEntry;
  }

  // Log AI-specific threats
  logAIThreat(threat) {
    return this.logSecurityEvent({
      type: 'AI_THREAT_DETECTED',
      severity: threat.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      clientIP: threat.clientIP,
      userAgent: threat.userAgent,
      riskLevel: threat.riskLevel,
      riskFactors: threat.riskFactors,
      action: threat.action,
      details: {
        aiContentDetected: threat.aiContentDetected,
        behaviorAnomalies: threat.behaviorAnomalies,
        confidence: threat.confidence,
        contentAnalysis: threat.contentAnalysis
      },
      endpoint: threat.endpoint
    });
  }

  // Log bot detection
  logBotDetection(detection) {
    return this.logSecurityEvent({
      type: 'BOT_DETECTED',
      severity: detection.certainty > 0.8 ? 'HIGH' : 'MEDIUM',
      clientIP: detection.clientIP,
      userAgent: detection.userAgent,
      riskLevel: detection.riskLevel,
      riskFactors: detection.indicators,
      action: detection.action,
      details: {
        botType: detection.botType,
        certainty: detection.certainty,
        signatures: detection.signatures,
        behaviorPatterns: detection.behaviorPatterns
      },
      endpoint: detection.endpoint
    });
  }

  // Log spam attempts
  logSpamAttempt(spam) {
    return this.logSecurityEvent({
      type: 'SPAM_DETECTED',
      severity: 'MEDIUM',
      clientIP: spam.clientIP,
      userAgent: spam.userAgent,
      riskLevel: spam.riskLevel,
      riskFactors: spam.indicators,
      action: spam.action,
      details: {
        spamType: spam.spamType,
        content: spam.content ? spam.content.substring(0, 200) : null, // Truncate for privacy
        honeypotTriggered: spam.honeypotTriggered,
        rateLimitExceeded: spam.rateLimitExceeded
      },
      endpoint: spam.endpoint
    });
  }

  // Log rate limit violations
  logRateLimitViolation(violation) {
    return this.logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      severity: 'MEDIUM',
      clientIP: violation.clientIP,
      userAgent: violation.userAgent,
      riskLevel: 'MEDIUM',
      riskFactors: ['RATE_LIMIT_EXCEEDED'],
      action: 'BLOCKED',
      details: {
        requestCount: violation.requestCount,
        timeWindow: violation.timeWindow,
        limit: violation.limit,
        retryAfter: violation.retryAfter
      },
      endpoint: violation.endpoint
    });
  }

  // Log CSRF token violations
  logCSRFViolation(violation) {
    return this.logSecurityEvent({
      type: 'CSRF_TOKEN_INVALID',
      severity: 'HIGH',
      clientIP: violation.clientIP,
      userAgent: violation.userAgent,
      riskLevel: 'HIGH',
      riskFactors: ['CSRF_TOKEN_INVALID'],
      action: 'BLOCKED',
      details: {
        tokenProvided: !!violation.tokenProvided,
        tokenValid: violation.tokenValid,
        expectedToken: violation.expectedToken ? 'present' : 'missing'
      },
      endpoint: violation.endpoint
    });
  }

  // Log 404 Not Found errors
  log404Error(errorData) {
    return this.logSecurityEvent({
      type: '404_NOT_FOUND',
      severity: 'LOW',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: errorData.isRepeated ? 'MEDIUM' : 'LOW',
      riskFactors: errorData.isRepeated ? ['REPEATED_404', 'POSSIBLE_ENUMERATION'] : ['NOT_FOUND'],
      action: 'LOGGED',
      details: {
        requestedUrl: errorData.requestedUrl,
        referrer: errorData.referrer,
        timestamp: new Date().toISOString(),
        possibleAttack: errorData.isRepeated || errorData.requestedUrl.includes('../')
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 405 Method Not Allowed errors
  log405Error(errorData) {
    return this.logSecurityEvent({
      type: '405_METHOD_NOT_ALLOWED',
      severity: 'MEDIUM',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'MEDIUM',
      riskFactors: ['INVALID_METHOD', 'POSSIBLE_ENUMERATION'],
      action: 'BLOCKED',
      details: {
        attemptedMethod: errorData.attemptedMethod,
        allowedMethods: errorData.allowedMethods,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 413 Payload Too Large errors
  log413Error(errorData) {
    return this.logSecurityEvent({
      type: '413_PAYLOAD_TOO_LARGE',
      severity: 'MEDIUM',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'MEDIUM',
      riskFactors: ['OVERSIZED_REQUEST', 'POSSIBLE_DOS'],
      action: 'BLOCKED',
      details: {
        payloadSize: errorData.payloadSize,
        maxAllowedSize: errorData.maxAllowedSize,
        contentType: errorData.contentType,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 429 Too Many Requests errors
  log429Error(errorData) {
    return this.logSecurityEvent({
      type: '429_TOO_MANY_REQUESTS',
      severity: 'HIGH',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'HIGH',
      riskFactors: ['RATE_LIMIT_EXCEEDED', 'POSSIBLE_DOS', 'AUTOMATED_REQUESTS'],
      action: 'RATE_LIMITED',
      details: {
        requestCount: errorData.requestCount,
        timeWindow: errorData.timeWindow,
        retryAfter: errorData.retryAfter,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 500 Internal Server Error
  log500Error(errorData) {
    return this.logSecurityEvent({
      type: '500_INTERNAL_SERVER_ERROR',
      severity: 'CRITICAL',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'LOW', // Usually not a security risk, but critical for operations
      riskFactors: ['SERVER_ERROR'],
      action: 'ERROR_LOGGED',
      details: {
        errorId: errorData.errorId,
        requestedUrl: errorData.requestedUrl,
        timestamp: new Date().toISOString(),
        // Don't log sensitive error details for security
        hasStackTrace: !!errorData.stackTrace
      },
      endpoint: errorData.requestedUrl
    });
  }

  // Log 403 Forbidden errors
  log403Error(errorData) {
    return this.logSecurityEvent({
      type: '403_FORBIDDEN',
      severity: 'HIGH',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: 'HIGH',
      riskFactors: ['UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED'],
      action: 'ACCESS_DENIED',
      details: {
        requestedResource: errorData.requestedResource,
        userRole: errorData.userRole || 'anonymous',
        requiredPermission: errorData.requiredPermission,
        authenticationStatus: errorData.authenticationStatus,
        timestamp: new Date().toISOString()
      },
      endpoint: errorData.requestedResource
    });
  }

  // Log generic error page access
  logErrorPageAccess(errorData) {
    const severityMap = {
      400: 'MEDIUM', 401: 'HIGH', 403: 'HIGH', 404: 'LOW', 405: 'MEDIUM',
      413: 'MEDIUM', 414: 'MEDIUM', 415: 'LOW', 429: 'HIGH', 500: 'CRITICAL',
      501: 'LOW', 502: 'MEDIUM', 503: 'MEDIUM', 504: 'MEDIUM', 505: 'LOW'
    };

    return this.logSecurityEvent({
      type: `${errorData.statusCode}_ERROR_PAGE_ACCESS`,
      severity: severityMap[errorData.statusCode] || 'MEDIUM',
      clientIP: errorData.clientIP,
      userAgent: errorData.userAgent,
      riskLevel: errorData.isRepeated ? 'HIGH' : 'LOW',
      riskFactors: errorData.isRepeated ? ['REPEATED_ERRORS', 'POSSIBLE_ATTACK'] : ['ERROR_ACCESS'],
      action: 'PAGE_SERVED',
      details: {
        statusCode: errorData.statusCode,
        originalUrl: errorData.originalUrl,
        referrer: errorData.referrer,
        timestamp: new Date().toISOString(),
        sessionId: errorData.sessionId
      },
      endpoint: errorData.originalUrl
    });
  }

  // Update threat patterns for analysis
  updateThreatPatterns(logEntry) {
    const key = `${logEntry.clientIP}_${logEntry.type}`;
    
    if (!this.threatPatterns.has(key)) {
      this.threatPatterns.set(key, {
        count: 0,
        firstSeen: logEntry.timestamp,
        lastSeen: logEntry.timestamp,
        riskFactors: new Set(),
        endpoints: new Set()
      });
    }

    const pattern = this.threatPatterns.get(key);
    pattern.count++;
    pattern.lastSeen = logEntry.timestamp;
    
    if (logEntry.riskFactors) {
      logEntry.riskFactors.forEach(factor => pattern.riskFactors.add(factor));
    }
    
    if (logEntry.endpoint) {
      pattern.endpoints.add(logEntry.endpoint);
    }

    // Alert on repeated threats from same IP
    if (pattern.count >= 5) {
      this.logSecurityEvent({
        type: 'REPEATED_THREAT_PATTERN',
        severity: 'CRITICAL',
        clientIP: logEntry.clientIP,
        userAgent: logEntry.userAgent,
        riskLevel: 'HIGH',
        riskFactors: ['REPEATED_VIOLATIONS'],
        action: 'ALERT',
        details: {
          patternCount: pattern.count,
          timeSpan: new Date(logEntry.timestamp) - new Date(pattern.firstSeen),
          uniqueRiskFactors: Array.from(pattern.riskFactors),
          affectedEndpoints: Array.from(pattern.endpoints)
        }
      });
    }
  }

  // Get security statistics
  getSecurityStats(timeRange = 3600000) { // Default 1 hour
    const now = new Date();
    const cutoff = new Date(now.getTime() - timeRange);
    
    const recentLogs = this.logBuffer.filter(log => 
      new Date(log.timestamp) > cutoff
    );

    const stats = {
      totalEvents: recentLogs.length,
      eventsByType: {},
      eventsBySeverity: {},
      topRiskFactors: {},
      topClientIPs: {},
      blockedRequests: 0,
      challengedRequests: 0
    };

    recentLogs.forEach(log => {
      // Count by type
      stats.eventsByType[log.type] = (stats.eventsByType[log.type] || 0) + 1;
      
      // Count by severity
      stats.eventsBySeverity[log.severity] = (stats.eventsBySeverity[log.severity] || 0) + 1;
      
      // Count risk factors
      if (log.riskFactors) {
        log.riskFactors.forEach(factor => {
          stats.topRiskFactors[factor] = (stats.topRiskFactors[factor] || 0) + 1;
        });
      }
      
      // Count client IPs
      if (log.clientIP) {
        stats.topClientIPs[log.clientIP] = (stats.topClientIPs[log.clientIP] || 0) + 1;
      }
      
      // Count actions
      if (log.action === 'BLOCKED') stats.blockedRequests++;
      if (log.action === 'CHALLENGE') stats.challengedRequests++;
    });

    return stats;
  }

  // Get threat patterns
  getThreatPatterns() {
    const patterns = [];
    
    for (const [key, pattern] of this.threatPatterns.entries()) {
      const [clientIP, type] = key.split('_');
      patterns.push({
        clientIP,
        type,
        count: pattern.count,
        firstSeen: pattern.firstSeen,
        lastSeen: pattern.lastSeen,
        riskFactors: Array.from(pattern.riskFactors),
        endpoints: Array.from(pattern.endpoints)
      });
    }

    return patterns.sort((a, b) => b.count - a.count);
  }

  // Flush logs to persistent storage
  async flushLogs() {
    if (this.logBuffer.length === 0) return;

    try {
      // In a production environment, you would send these to:
      // - External logging service (e.g., Datadog, Splunk)
      // - Database for analysis
      // - Security monitoring system
      
      console.log(`📊 Security Log Flush: ${this.logBuffer.length} events`);
      
      // For now, we'll just log high-severity events
      const highSeverityEvents = this.logBuffer.filter(log => 
        log.severity === 'HIGH' || log.severity === 'CRITICAL'
      );
      
      if (highSeverityEvents.length > 0) {
        console.warn('🚨 High Severity Security Events:', highSeverityEvents);
      }
      
      // Clear buffer
      this.logBuffer = [];
      
    } catch (error) {
      console.error('Failed to flush security logs:', error);
    }
  }

  // Start periodic log flushing
  startPeriodicFlush() {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  // Generate security report
  generateSecurityReport(timeRange = 86400000) { // Default 24 hours
    const stats = this.getSecurityStats(timeRange);
    const patterns = this.getThreatPatterns();
    
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange: timeRange,
      summary: {
        totalSecurityEvents: stats.totalEvents,
        blockedRequests: stats.blockedRequests,
        challengedRequests: stats.challengedRequests,
        highSeverityEvents: stats.eventsBySeverity.HIGH || 0,
        criticalEvents: stats.eventsBySeverity.CRITICAL || 0
      },
      topThreats: {
        eventTypes: Object.entries(stats.eventsByType)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        riskFactors: Object.entries(stats.topRiskFactors)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        suspiciousIPs: Object.entries(stats.topClientIPs)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
      },
      threatPatterns: patterns.slice(0, 20),
      recommendations: this.generateRecommendations(stats, patterns)
    };

    return report;
  }

  // Generate security recommendations
  generateRecommendations(stats, patterns) {
    const recommendations = [];

    // Check for high bot activity
    if (stats.eventsByType.BOT_DETECTED > 10) {
      recommendations.push({
        type: 'HIGH_BOT_ACTIVITY',
        priority: 'HIGH',
        message: 'High bot activity detected. Consider implementing additional CAPTCHA challenges.',
        action: 'Implement stricter bot detection measures'
      });
    }

    // Check for AI-generated content
    if (stats.eventsByType.AI_THREAT_DETECTED > 5) {
      recommendations.push({
        type: 'AI_CONTENT_THREATS',
        priority: 'MEDIUM',
        message: 'AI-generated content detected. Monitor for sophisticated spam campaigns.',
        action: 'Enhance AI content detection algorithms'
      });
    }

    // Check for repeated violations
    const repeatedViolators = patterns.filter(p => p.count >= 5);
    if (repeatedViolators.length > 0) {
      recommendations.push({
        type: 'REPEATED_VIOLATORS',
        priority: 'HIGH',
        message: `${repeatedViolators.length} IPs with repeated violations detected.`,
        action: 'Consider IP blocking for persistent violators',
        affectedIPs: repeatedViolators.map(v => v.clientIP)
      });
    }

    return recommendations;
  }
}

// Export singleton instance
const securityLogger = new SecurityLogger();

// Export convenience functions
function logAIThreat(threat) {
  return securityLogger.logAIThreat(threat);
}

function logBotDetection(detection) {
  return securityLogger.logBotDetection(detection);
}

function logSpamAttempt(spam) {
  return securityLogger.logSpamAttempt(spam);
}

function getSecurityStats(timeRange) {
  return securityLogger.getSecurityStats(timeRange);
}

function generateSecurityReport(timeRange) {
  return securityLogger.generateSecurityReport(timeRange);
}

// Rate limiting utility to prevent spam and abuse

// In-memory store for rate limiting (in production, use Redis or similar)
const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > data.windowMs) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 5, // 5 requests per window default
    message = 'Too many requests from this IP, please try again later.',
    keyGenerator = (request) => getClientIP(request)
  } = options;

  return async function(request) {
    try {
      const key = keyGenerator(request);
      const now = Date.now();
      
      // Get or create rate limit data for this key
      let rateLimitData = requestCounts.get(key);
      
      if (!rateLimitData || now - rateLimitData.resetTime > windowMs) {
        // Reset or create new rate limit data
        rateLimitData = {
          count: 0,
          resetTime: now,
          windowMs: windowMs
        };
      }
      
      // Increment request count
      rateLimitData.count++;
      requestCounts.set(key, rateLimitData);
      
      // Check if limit exceeded
      if (rateLimitData.count > max) {
        const timeUntilReset = Math.ceil((rateLimitData.resetTime + windowMs - now) / 1000);
        
        return {
          error: message,
          retryAfter: timeUntilReset,
          limit: max,
          remaining: 0,
          reset: new Date(rateLimitData.resetTime + windowMs)
        };
      }
      
      // Request allowed
      return {
        error: null,
        limit: max,
        remaining: max - rateLimitData.count,
        reset: new Date(rateLimitData.resetTime + windowMs)
      };
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed
      return {
        error: null,
        limit: max,
        remaining: max - 1,
        reset: new Date(Date.now() + windowMs)
      };
    }
  };
}

// Extract client IP from request
function getClientIP(request) {
  // Check various headers for the real IP
  const headers = request.headers;
  
  // Common proxy headers
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

// Basic IP validation
function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// AI-Based Security and Advanced Bot Detection for 2025
// Protection against AI-generated attacks, deepfakes, and sophisticated bots

class AISecurityEngine {
  constructor() {
    this.behaviorPatterns = new Map();
    this.suspiciousActivities = [];
    this.aiDetectionRules = this.initializeAIDetectionRules();
    this.mlModel = this.initializeBasicMLModel();
  }

  // Initialize AI detection rules based on 2025 threat intelligence
  initializeAIDetectionRules() {
    return {
      // Patterns common in AI-generated content
      aiGeneratedText: [
        /\b(as an ai|i'm an ai|artificial intelligence|language model)\b/i,
        /\b(i don't have personal|i cannot provide personal|as a language model)\b/i,
        /\b(i'm sorry, but i|unfortunately, i cannot|i'm unable to)\b/i,
        /\b(please note that|it's important to note|keep in mind that)\b/i
      ],
      
      // Suspicious timing patterns (too fast for humans)
      rapidFilling: {
        minTimePerField: 500, // milliseconds
        maxFormCompletionTime: 5000 // 5 seconds is suspiciously fast
      },
      
      // Perfect grammar/formatting (AI characteristic)
      perfectFormatting: {
        punctuationAccuracy: 0.98,
        grammarScore: 0.95,
        consistentCapitalization: true
      },
      
      // Behavioral anomalies
      behaviorAnomalies: {
        noMouseMovement: true,
        perfectKeystrokes: true,
        noBackspacing: true,
        uniformTypingSpeed: true
      }
    };
  }

  // Basic ML model for behavior analysis
  initializeBasicMLModel() {
    return {
      weights: {
        typingSpeed: 0.3,
        mouseMovement: 0.25,
        formCompletionTime: 0.2,
        errorRate: 0.15,
        pausePatterns: 0.1
      },
      threshold: 0.7 // Suspicion threshold
    };
  }

  // Analyze user behavior for AI/bot characteristics
  analyzeBehavior(behaviorData) {
    const features = this.extractBehaviorFeatures(behaviorData);
    const suspicionScore = this.calculateSuspicionScore(features);
    
    return {
      isHuman: suspicionScore < this.mlModel.threshold,
      suspicionScore,
      flags: this.identifyFlags(features),
      recommendation: this.getRecommendation(suspicionScore)
    };
  }

  extractBehaviorFeatures(data) {
    const {
      timeSpent,
      keystrokes,
      mouseMovements,
      backspaces = 0,
      pauses = [],
      fieldFocusTime = {},
      typingIntervals = []
    } = data;

    return {
      // Typing characteristics
      avgTypingSpeed: keystrokes / (timeSpent / 1000),
      typingConsistency: this.calculateTypingConsistency(typingIntervals),
      backspaceRatio: backspaces / keystrokes,
      
      // Mouse behavior
      mouseActivity: mouseMovements / (timeSpent / 1000),
      hasMouseMovement: mouseMovements > 0,
      
      // Timing patterns
      formCompletionSpeed: timeSpent,
      pauseFrequency: pauses.length,
      avgPauseLength: pauses.length > 0 ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0,
      
      // Focus patterns
      fieldSwitchingPattern: Object.keys(fieldFocusTime).length,
      avgFieldFocusTime: Object.values(fieldFocusTime).reduce((a, b) => a + b, 0) / Object.keys(fieldFocusTime).length
    };
  }

  calculateSuspicionScore(features) {
    let score = 0;
    const weights = this.mlModel.weights;
    const userAgent = features.userAgent || '';

    // Enhanced typing speed analysis with mobile device tolerance
    let typingThreshold = 12; // Increased from 10 to 12 chars/sec
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      typingThreshold = 15; // Higher threshold for mobile devices (predictive keyboards)
    }
    
    if (features.avgTypingSpeed > typingThreshold || features.typingConsistency > 0.9) {
      score += weights.typingSpeed;
    }

    // Mouse movement analysis
    if (!features.hasMouseMovement || features.mouseActivity < 0.1) {
      score += weights.mouseMovement;
    }

    // Form completion time (too fast = bot)
    if (features.formCompletionSpeed < this.aiDetectionRules.rapidFilling.maxFormCompletionTime) {
      score += weights.formCompletionTime;
    }

    // Error patterns (no backspaces = suspicious)
    if (features.backspaceRatio < 0.02) {
      score += weights.errorRate;
    }

    // Pause patterns (no natural pauses = bot)
    if (features.pauseFrequency < 2 || features.avgPauseLength < 200) {
      score += weights.pausePatterns;
    }

    // JavaScript verification check (enhanced bot detection)
    if (features.jsEnabled === false || features.jsEnabled === 'false') {
      score += 0.3; // High penalty for disabled JavaScript
    }

    return Math.min(score, 1.0);
  }

  calculateTypingConsistency(intervals) {
    if (intervals.length < 2) return 0;
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = more consistent = more suspicious
    return 1 - (stdDev / mean);
  }

  identifyFlags(features) {
    const flags = [];

    if (features.avgTypingSpeed > 15) flags.push('SUPERHUMAN_TYPING_SPEED');
    if (features.typingConsistency > 0.95) flags.push('ROBOTIC_TYPING_PATTERN');
    if (!features.hasMouseMovement) flags.push('NO_MOUSE_INTERACTION');
    if (features.backspaceRatio < 0.01) flags.push('NO_CORRECTIONS');
    if (features.formCompletionSpeed < 3000) flags.push('INSTANT_COMPLETION');
    if (features.pauseFrequency === 0) flags.push('NO_NATURAL_PAUSES');

    return flags;
  }

  getRecommendation(score) {
    if (score >= 0.9) return 'BLOCK_IMMEDIATELY';
    if (score >= 0.7) return 'REQUIRE_ADDITIONAL_VERIFICATION';
    if (score >= 0.5) return 'MONITOR_CLOSELY';
    return 'ALLOW';
  }

  // Detect AI-generated content in form submissions
  detectAIGeneratedContent(formData) {
    const suspiciousFields = [];
    
    for (const [fieldName, value] of Object.entries(formData)) {
      if (typeof value === 'string' && value.length > 10) {
        const aiScore = this.analyzeTextForAI(value);
        if (aiScore > 0.6) {
          suspiciousFields.push({
            field: fieldName,
            score: aiScore,
            reasons: this.getAIDetectionReasons(value)
          });
        }
      }
    }

    return {
      isAIGenerated: suspiciousFields.length > 0,
      suspiciousFields,
      overallScore: suspiciousFields.length > 0 ? 
        suspiciousFields.reduce((sum, field) => sum + field.score, 0) / suspiciousFields.length : 0
    };
  }

  analyzeTextForAI(text) {
    let score = 0;
    const rules = this.aiDetectionRules.aiGeneratedText;

    // Check for AI-specific phrases
    rules.forEach(pattern => {
      if (pattern.test(text)) {
        score += 0.3;
      }
    });

    // Check for perfect grammar/formatting
    const grammarScore = this.analyzeGrammar(text);
    if (grammarScore > 0.95) score += 0.2;

    // Check for unnatural perfection
    const perfectionScore = this.analyzePerfection(text);
    score += perfectionScore * 0.3;

    // Check for repetitive patterns common in AI
    const repetitionScore = this.analyzeRepetition(text);
    score += repetitionScore * 0.2;

    return Math.min(score, 1.0);
  }

  analyzeGrammar(text) {
    // Simple grammar analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let correctSentences = 0;

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      // Check for proper capitalization
      if (trimmed.length > 0 && trimmed[0] === trimmed[0].toUpperCase()) {
        correctSentences++;
      }
    });

    return sentences.length > 0 ? correctSentences / sentences.length : 0;
  }

  analyzePerfection(text) {
    let perfectionIndicators = 0;
    const totalChecks = 4;

    // No typos (simplified check)
    const commonTypos = /\b(teh|recieve|seperate|occured|definately)\b/gi;
    if (!commonTypos.test(text)) perfectionIndicators++;

    // Perfect punctuation spacing
    const punctuationSpacing = /[.!?]\s+[A-Z]/g;
    const matches = text.match(punctuationSpacing) || [];
    const sentences = text.split(/[.!?]+/).length - 1;
    if (sentences > 0 && matches.length / sentences > 0.8) perfectionIndicators++;

    // Consistent formatting
    const hasConsistentQuotes = !/["'][^"']*["'].*["'][^"']*["']/g.test(text) || 
                               /^["'][^"']*["']$|^[^"']*$/.test(text);
    if (hasConsistentQuotes) perfectionIndicators++;

    // No informal language
    const informalWords = /\b(gonna|wanna|kinda|sorta|yeah|nah|ok|okay)\b/gi;
    if (!informalWords.test(text)) perfectionIndicators++;

    return perfectionIndicators / totalChecks;
  }

  analyzeRepetition(text) {
    const words = text.toLowerCase().split(/\s+/);
    const phrases = [];
    
    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(words.slice(i, i + 3).join(' '));
    }

    // Count repetitions
    const phraseCount = {};
    phrases.forEach(phrase => {
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
    });

    const repetitions = Object.values(phraseCount).filter(count => count > 1).length;
    return phrases.length > 0 ? repetitions / phrases.length : 0;
  }

  getAIDetectionReasons(text) {
    const reasons = [];
    const rules = this.aiDetectionRules.aiGeneratedText;

    rules.forEach((pattern, index) => {
      if (pattern.test(text)) {
        reasons.push(`AI_PHRASE_DETECTED_${index + 1}`);
      }
    });

    if (this.analyzeGrammar(text) > 0.95) reasons.push('PERFECT_GRAMMAR');
    if (this.analyzePerfection(text) > 0.8) reasons.push('UNNATURAL_PERFECTION');
    if (this.analyzeRepetition(text) > 0.3) reasons.push('REPETITIVE_PATTERNS');

    return reasons;
  }

  // Advanced honeypot with AI detection
  createAdvancedHoneypot() {
    return {
      // Multiple honeypot fields with different strategies
      fields: [
        {
          name: 'website_url',
          type: 'url',
          style: 'position: absolute; left: -9999px; opacity: 0;',
          tabindex: '-1',
          autocomplete: 'off'
        },
        {
          name: 'confirm_email',
          type: 'email',
          style: 'display: none !important;',
          tabindex: '-1',
          autocomplete: 'new-password'
        },
        {
          name: 'phone_backup',
          type: 'tel',
          style: 'visibility: hidden; height: 0; width: 0;',
          tabindex: '-1'
        }
      ],
      
      // Time-based honeypot
      timeCheck: {
        minTime: 3000, // Minimum 3 seconds to fill form
        maxTime: 1800000 // Maximum 30 minutes
      },
      
      // JavaScript challenge
      jsChallenge: {
        required: true,
        token: this.generateJSChallengeToken()
      }
    };
  }

  generateJSChallengeToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${timestamp}:${random}`);
  }

  validateJSChallenge(token, submissionTime) {
    try {
      const decoded = atob(token);
      const [timestamp, random] = decoded.split(':');
      const tokenTime = parseInt(timestamp);
      
      // Check if token is within valid time range (5 minutes)
      const timeDiff = submissionTime - tokenTime;
      return timeDiff > 3000 && timeDiff < 300000;
    } catch (error) {
      return false;
    }
  }

  // Generate security report
  generateSecurityReport(analysisResults) {
    return {
      timestamp: new Date().toISOString(),
      riskLevel: this.calculateRiskLevel(analysisResults),
      behaviorAnalysis: analysisResults.behavior,
      contentAnalysis: analysisResults.content,
      recommendations: this.generateRecommendations(analysisResults),
      actionTaken: this.determineAction(analysisResults)
    };
  }

  calculateRiskLevel(results) {
    const behaviorRisk = results.behavior?.suspicionScore || 0;
    const contentRisk = results.content?.overallScore || 0;
    const overallRisk = (behaviorRisk + contentRisk) / 2;

    if (overallRisk >= 0.8) return 'CRITICAL';
    if (overallRisk >= 0.6) return 'HIGH';
    if (overallRisk >= 0.4) return 'MEDIUM';
    return 'LOW';
  }

  generateRecommendations(results) {
    const recommendations = [];
    const riskLevel = this.calculateRiskLevel(results);

    switch (riskLevel) {
      case 'CRITICAL':
        recommendations.push('Block submission immediately');
        recommendations.push('Log IP for monitoring');
        recommendations.push('Implement additional verification');
        break;
      case 'HIGH':
        recommendations.push('Require CAPTCHA verification');
        recommendations.push('Manual review required');
        break;
      case 'MEDIUM':
        recommendations.push('Monitor future submissions');
        recommendations.push('Consider additional validation');
        break;
      default:
        recommendations.push('Allow with standard processing');
    }

    return recommendations;
  }

  determineAction(results) {
    const riskLevel = this.calculateRiskLevel(results);
    
    const actions = {
      'CRITICAL': 'BLOCK',
      'HIGH': 'CHALLENGE',
      'MEDIUM': 'MONITOR',
      'LOW': 'ALLOW'
    };

    return actions[riskLevel] || 'ALLOW';
  }
}

// Input validation and sanitization utilities

// Main validation function
function validateInput(data, rules) {
  const errors = [];
  const sanitizedData = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors = [];
    
    // Check required fields
    if (rule.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is not required and empty
    if (!rule.required && (!value || value.toString().trim() === '')) {
      sanitizedData[field] = '';
      continue;
    }
    
    const sanitizedValue = sanitizeInput(value, rule.type);
    
    // Type validation
    if (rule.type) {
      const typeValidation = validateType(sanitizedValue, rule.type);
      if (!typeValidation.isValid) {
        fieldErrors.push(`${field} ${typeValidation.error}`);
      }
    }
    
    // Length validation
    if (rule.minLength && sanitizedValue.length < rule.minLength) {
      fieldErrors.push(`${field} must be at least ${rule.minLength} characters`);
    }
    
    if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
      fieldErrors.push(`${field} must not exceed ${rule.maxLength} characters`);
    }
    
    // Number range validation
    if (rule.type === 'number') {
      const numValue = parseFloat(sanitizedValue);
      if (rule.min !== undefined && numValue < rule.min) {
        fieldErrors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && numValue > rule.max) {
        fieldErrors.push(`${field} must not exceed ${rule.max}`);
      }
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
      fieldErrors.push(`${field} format is invalid`);
    }
    
    // Custom validation function
    if (rule.validator) {
      const customValidation = rule.validator(sanitizedValue);
      if (!customValidation.isValid) {
        fieldErrors.push(`${field} ${customValidation.error}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
    } else {
      sanitizedData[field] = sanitizedValue;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

// Sanitize input based on type
function sanitizeInput(value, type) {
  if (value === null || value === undefined) {
    return '';
  }
  
  let sanitized = value.toString().trim();
  
  switch (type) {
    case 'email':
      return sanitized.toLowerCase();
    
    case 'phone':
      // Remove all non-digit characters except + and -
      return sanitized.replace(/[^\d+\-\s()]/g, '');
    
    case 'text':
    case 'textarea':
      // Remove potentially dangerous characters
      return sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    
    case 'number':
      return sanitized.replace(/[^\d.-]/g, '');
    
    case 'zipcode':
      return sanitized.replace(/[^\d-]/g, '');
    
    default:
      return sanitized;
  }
}

// Type-specific validation
function validateType(value, type) {
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        error: 'must be a valid email address'
      };
    
    case 'phone':
      // Accept various phone formats
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
      return {
        isValid: phoneRegex.test(value.replace(/\s/g, '')),
        error: 'must be a valid phone number'
      };
    
    case 'number':
      const numValue = parseFloat(value);
      return {
        isValid: !isNaN(numValue) && isFinite(numValue),
        error: 'must be a valid number'
      };
    
    case 'url':
      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return {
          isValid: false,
          error: 'must be a valid URL'
        };
      }
    
    case 'zipcode':
      const zipRegex = /^\d{5}(-\d{4})?$/;
      return {
        isValid: zipRegex.test(value),
        error: 'must be a valid ZIP code (12345 or 12345-6789)'
      };
    
    default:
      return { isValid: true };
  }
}

// Email utility for sending notifications and confirmations

// Email service configuration (use environment variables in production)
({
  // For development, you can use services like:
  // - Nodemailer with Gmail SMTP
  // - SendGrid API
  // - Mailgun API
  // - AWS SES
  
  service: process.env.EMAIL_SERVICE || 'smtp',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  },
  from: process.env.FROM_EMAIL || 'noreply@bubblesenterprise.com'
});

// Email templates
const EMAIL_TEMPLATES = {
  'quote-request': {
    subject: 'New Quote Request - {{firstName}} {{lastName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Quote Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Bubbles Enterprise - Soffit & Fascia Services</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e40af; margin-top: 0;">Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>{{firstName}} {{lastName}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:{{email}}">{{email}}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:{{phone}}">{{phone}}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Address:</td><td>{{address}}, {{city}} {{zipCode}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Contact:</td><td>{{contactMethod}}</td></tr>
          </table>
          
          <h3 style="color: #1e40af; margin-top: 30px;">Project Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Service Type:</td><td>{{serviceType}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Timeline:</td><td>{{timeline}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td>{{budget}}</td></tr>
          </table>
          
          <h3 style="color: #1e40af; margin-top: 30px;">Project Description</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            {{projectDescription}}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">📞 Next Steps:</p>
            <p style="margin: 10px 0 0 0;">Contact the customer within 24 hours using their preferred method: {{contactMethod}}</p>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; opacity: 0.8;">Bubbles Enterprise | Orlando, FL | (407) 715-1790</p>
        </div>
      </div>
    `
  },
  
  'estimate-details': {
    subject: 'Your Soffit & Fascia Estimate - ${{totalPrice}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Your Estimate is Ready!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Soffit & Fascia Services in Orlando</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 30px;">
            <h2 style="color: #1e40af; margin-top: 0; text-align: center; font-size: 32px;">${{totalPrice}}</h2>
            <p style="text-align: center; color: #6b7280; margin: 0;">Estimated Total Cost</p>
          </div>
          
          <h3 style="color: #1e40af;">Project Specifications</h3>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <tr style="background: #f3f4f6;"><td style="padding: 12px; font-weight: bold;">Linear Feet:</td><td style="padding: 12px;">{{linearFeet}} ft</td></tr>
            <tr><td style="padding: 12px; font-weight: bold;">Overhang:</td><td style="padding: 12px;">{{overhang}} inches</td></tr>
            <tr style="background: #f3f4f6;"><td style="padding: 12px; font-weight: bold;">Installation Type:</td><td style="padding: 12px;">{{installationType}}</td></tr>
            <tr><td style="padding: 12px; font-weight: bold;">Material:</td><td style="padding: 12px;">{{materialType}}</td></tr>
            <tr style="background: #f3f4f6;"><td style="padding: 12px; font-weight: bold;">Service:</td><td style="padding: 12px;">{{serviceType}}</td></tr>
            <tr><td style="padding: 12px; font-weight: bold;">Location:</td><td style="padding: 12px;">{{zipCode}}</td></tr>
          </table>
          
          {{#if notes}}
          <h3 style="color: #1e40af; margin-top: 30px;">Additional Notes</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            {{notes}}
          </div>
          {{/if}}
          
          <div style="margin-top: 30px; padding: 25px; background: #dbeafe; border-radius: 12px; text-align: center;">
            <h3 style="color: #1e40af; margin-top: 0;">🎯 Ready to Get Started?</h3>
            <p style="margin: 15px 0;">This estimate is valid for 30 days. Contact us to schedule your free on-site consultation!</p>
            <div style="margin-top: 20px;">
              <a href="tel:+14077151790" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">📞 Call (407) 715-1790</a>
              <a href="mailto:contact@bubblesenterprise.com" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">✉️ Email Us</a>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> This is a preliminary estimate based on the information provided. Final pricing may vary after our free on-site inspection.</p>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 30px; text-align: center;">
          <h3 style="margin-top: 0; color: #60a5fa;">Why Choose Bubbles Enterprise?</h3>
          <div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin: 20px 0;">
            <div style="margin: 10px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">🏆</div>
              <div style="font-size: 14px;">Licensed & Insured</div>
            </div>
            <div style="margin: 10px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">⚡</div>
              <div style="font-size: 14px;">24hr Response</div>
            </div>
            <div style="margin: 10px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">💯</div>
              <div style="font-size: 14px;">Quality Guarantee</div>
            </div>
          </div>
          <p style="margin: 20px 0 0 0; opacity: 0.8; font-size: 14px;">Bubbles Enterprise | Orlando, FL | Licensed General Contractor</p>
        </div>
      </div>
    `
  }
};

// Main email sending function
async function sendEmail(options) {
  try {
    const {
      to,
      cc,
      bcc,
      subject,
      template,
      data = {},
      attachments = []
    } = options;
    
    // In a real implementation, you would use a proper email service
    // For now, we'll simulate the email sending and log the details
    
    let emailContent;
    
    if (template && EMAIL_TEMPLATES[template]) {
      const templateData = EMAIL_TEMPLATES[template];
      emailContent = {
        subject: interpolateTemplate(subject || templateData.subject, data),
        html: interpolateTemplate(templateData.html, data)
      };
    } else {
      emailContent = {
        subject: subject || 'Notification from Bubbles Enterprise',
        html: `<p>${JSON.stringify(data, null, 2)}</p>`
      };
    }
    
    // Log email details (in production, replace with actual email sending)
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', emailContent.subject);
    console.log('Template:', template);
    console.log('Data:', data);
    
    // Simulate email service response
    const success = Math.random() > 0.1; // 90% success rate simulation
    
    if (success) {
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      throw new Error('Simulated email service error');
    }
    
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Template interpolation function
function interpolateTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

// Real-Time Security Alerts System

dotenv.config();

class RealTimeAlertsSystem {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.alertRules = {
      // Regras de alerta configuráveis
      suspiciousIP: {
        threshold: 5, // 5 eventos suspeitos em 10 minutos
        timeWindow: 10 * 60 * 1000, // 10 minutos
        severity: 'high'
      },
      bruteForce: {
        threshold: 10, // 10 tentativas de login falhadas
        timeWindow: 5 * 60 * 1000, // 5 minutos
        severity: 'critical'
      },
      directoryTraversal: {
        threshold: 3, // 3 tentativas de directory traversal
        timeWindow: 2 * 60 * 1000, // 2 minutos
        severity: 'high'
      },
      adminScan: {
        threshold: 5, // 5 tentativas de acesso admin
        timeWindow: 5 * 60 * 1000, // 5 minutos
        severity: 'medium'
      }
    };
    this.recentEvents = new Map(); // Cache de eventos recentes
  }

  // Inicializar servidor WebSocket
  initWebSocketServer(port = 8080) {
    try {
      this.wss = new WebSocketServer({ port });
      
      this.wss.on('connection', (ws, req) => {
        console.log(`🔗 New security dashboard client connected from ${req.socket.remoteAddress}`);
        this.clients.add(ws);
        
        // Enviar status inicial
        this.sendToClient(ws, {
          type: 'connection',
          message: 'Connected to Security Alert System',
          timestamp: new Date().toISOString()
        });
        
        ws.on('close', () => {
          console.log('🔌 Security dashboard client disconnected');
          this.clients.delete(ws);
        });
        
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.clients.delete(ws);
        });
      });
      
      console.log(`🚨 Real-Time Alerts WebSocket server started on port ${port}`);
      
    } catch (error) {
      console.error('❌ Failed to start WebSocket server:', error);
    }
  }

  // Enviar mensagem para um cliente específico
  sendToClient(ws, data) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Broadcast para todos os clientes conectados
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }

  // Processar evento de segurança e verificar regras de alerta
  async processSecurityEvent(eventData) {
    try {
      const { event_type, client_ip, severity, message, details } = eventData;
      const now = Date.now();
      
      // Armazenar evento no cache
      const eventKey = `${client_ip}_${event_type}`;
      if (!this.recentEvents.has(eventKey)) {
        this.recentEvents.set(eventKey, []);
      }
      
      const events = this.recentEvents.get(eventKey);
      events.push({ timestamp: now, ...eventData });
      
      // Limpar eventos antigos
      const maxAge = Math.max(...Object.values(this.alertRules).map(rule => rule.timeWindow));
      this.recentEvents.set(eventKey, events.filter(e => now - e.timestamp < maxAge));
      
      // Verificar regras de alerta
      await this.checkAlertRules(client_ip, event_type, events);
      
      // Enviar para correlação de eventos
      try {
        const { default: eventCorrelation } = await Promise.resolve().then(() => eventCorrelation$1);
        await eventCorrelation.processEvent(eventData);
      } catch (error) {
        console.warn('⚠️ Event correlation not available:', error.message);
      }
      
      // Processar com sistema SOAR para resposta automatizada
      try {
        const { default: soarSystem } = await Promise.resolve().then(() => soarSystem$1);
        await soarSystem.processIncident({
          type: event_type,
          severity: severity,
          clientIP: client_ip,
          userAgent: details?.userAgent,
          message: message,
          details: details,
          timestamp: new Date(),
          confidence: details?.confidence || 0.7
        });
      } catch (error) {
        console.warn('SOAR system not available:', error.message);
      }
      
      // Processar com sistema UEBA para análise comportamental
      try {
        const { default: uebaSystem } = await Promise.resolve().then(() => uebaSystem$1);
        await uebaSystem.processActivity({
          type: event_type,
          severity: severity,
          client_ip: client_ip,
          user_agent: details?.userAgent,
          message: message,
          path: details?.path || details?.url,
          method: details?.method || 'GET',
          status: details?.status,
          timestamp: new Date(),
          details: details
        });
      } catch (error) {
        console.warn('UEBA system not available:', error.message);
      }
      
      // Enriquecer com Threat Intelligence se disponível
      try {
        const threatIntelligence = await Promise.resolve().then(() => threatIntelligence$1);
        const enrichedEvent = await threatIntelligence.default.enrichSecurityEvent({
          type: event_type,
          severity: severity,
          client_ip: client_ip,
          clientIP: client_ip,
          user_agent: details?.userAgent,
          message: message,
          timestamp: new Date(),
          details: details
        });
        
        // Se encontrou ameaças conhecidas, aumentar severidade e adicionar contexto
        if (enrichedEvent.threatIndicators.length > 0) {
          console.log(`🚨 Threat Intelligence Alert: ${enrichedEvent.threatIndicators.length} indicators found`);
          
          // Atualizar severidade se necessário
          if (enrichedEvent.finalSeverity !== severity) {
            console.log(`📈 Severity escalated from ${severity} to ${enrichedEvent.finalSeverity}`);
            eventData.severity = enrichedEvent.finalSeverity;
          }
          
          // Adicionar indicadores às details
          eventData.details.threatIntelligence = {
            riskScore: enrichedEvent.riskScore,
            indicators: enrichedEvent.threatIndicators,
            recommendations: enrichedEvent.recommendations,
            context: enrichedEvent.context
          };
          
          // Log adicional para ameaças críticas
          if (enrichedEvent.riskScore >= 0.8) {
            console.log(`🔥 HIGH RISK THREAT DETECTED - Risk Score: ${enrichedEvent.riskScore.toFixed(3)}`);
            enrichedEvent.threatIndicators.forEach(indicator => {
              console.log(`   🎯 ${indicator}`);
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Threat Intelligence processing failed:', error.message);
      }
      
      // Broadcast evento em tempo real
      this.broadcast({
        type: 'security_event',
        data: eventData,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error processing security event:', error);
    }
  }

  // Verificar regras de alerta
  async checkAlertRules(clientIP, eventType, events) {
    const now = Date.now();
    
    // Verificar IP suspeito
    if (eventType.includes('suspicious')) {
      const rule = this.alertRules.suspiciousIP;
      const recentSuspicious = events.filter(e => 
        now - e.timestamp < rule.timeWindow && 
        e.event_type.includes('suspicious')
      );
      
      if (recentSuspicious.length >= rule.threshold) {
        await this.createAlert({
          type: 'suspicious_ip',
          title: `Suspicious Activity from IP ${clientIP}`,
          description: `${recentSuspicious.length} suspicious events detected in ${rule.timeWindow / 60000} minutes`,
          severity: rule.severity,
          clientIP,
          affectedResources: recentSuspicious.map(e => e.details?.url).filter(Boolean),
          recommendedActions: [
            'Block IP address',
            'Investigate user activity',
            'Review access logs',
            'Check for data exfiltration'
          ]
        });
      }
    }
    
    // Verificar tentativas de directory traversal
    if (eventType.includes('404') && events.some(e => e.details?.suspiciousType === 'Directory Traversal')) {
      const rule = this.alertRules.directoryTraversal;
      const traversalAttempts = events.filter(e => 
        now - e.timestamp < rule.timeWindow && 
        e.details?.suspiciousType === 'Directory Traversal'
      );
      
      if (traversalAttempts.length >= rule.threshold) {
        await this.createAlert({
          type: 'directory_traversal',
          title: `Directory Traversal Attack from ${clientIP}`,
          description: `${traversalAttempts.length} directory traversal attempts detected`,
          severity: rule.severity,
          clientIP,
          affectedResources: traversalAttempts.map(e => e.details?.url).filter(Boolean),
          recommendedActions: [
            'Block IP immediately',
            'Review file system access',
            'Check for unauthorized file access',
            'Strengthen input validation'
          ]
        });
      }
    }
    
    // Verificar scans de admin
    if (events.some(e => e.details?.suspiciousType?.includes('Admin'))) {
      const rule = this.alertRules.adminScan;
      const adminScans = events.filter(e => 
        now - e.timestamp < rule.timeWindow && 
        e.details?.suspiciousType?.includes('Admin')
      );
      
      if (adminScans.length >= rule.threshold) {
        await this.createAlert({
          type: 'admin_scan',
          title: `Admin Panel Scanning from ${clientIP}`,
          description: `${adminScans.length} admin panel access attempts detected`,
          severity: rule.severity,
          clientIP,
          affectedResources: adminScans.map(e => e.details?.url).filter(Boolean),
          recommendedActions: [
            'Monitor IP activity',
            'Review admin access logs',
            'Strengthen admin authentication',
            'Consider IP whitelisting'
          ]
        });
      }
    }
  }

  // Criar alerta de segurança
  async createAlert(alertData) {
    try {
      // Salvar no banco de dados
      await mysqlSecurityLogger.createSecurityAlert({
        alertType: alertData.type,
        title: alertData.title,
        description: alertData.description,
        severity: alertData.severity,
        clientIP: alertData.clientIP,
        affectedResources: alertData.affectedResources,
        recommendedActions: alertData.recommendedActions
      });
      
      // Broadcast alerta em tempo real
      this.broadcast({
        type: 'security_alert',
        data: {
          ...alertData,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          status: 'new'
        }
      });
      
      // Enviar notificação push (se configurado)
      await this.sendPushNotification(alertData);
      
      console.log(`🚨 Security alert created: ${alertData.title}`);
      
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  // Enviar notificação push
  async sendPushNotification(alertData) {
    try {
      // Implementar integração com serviços de push notification
      // Por exemplo: Firebase, Pusher, ou webhook personalizado
      
      const notification = {
        title: `🚨 Security Alert: ${alertData.severity.toUpperCase()}`,
        body: alertData.title,
        data: {
          type: alertData.type,
          severity: alertData.severity,
          clientIP: alertData.clientIP,
          timestamp: new Date().toISOString()
        }
      };
      
      // Webhook para Slack/Discord/Teams (exemplo)
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 **${notification.title}**\n${notification.body}\n**IP:** ${alertData.clientIP}\n**Time:** ${new Date().toLocaleString()}`
          })
        });
      }
      
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Obter estatísticas de alertas
  async getAlertStats() {
    try {
      return await mysqlSecurityLogger.getAlertStats();
    } catch (error) {
      console.error('Error getting alert stats:', error);
      return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
    }
  }

  // Limpar cache de eventos antigos
  cleanupOldEvents() {
    const now = Date.now();
    const maxAge = Math.max(...Object.values(this.alertRules).map(rule => rule.timeWindow));
    
    for (const [key, events] of this.recentEvents.entries()) {
      const filteredEvents = events.filter(e => now - e.timestamp < maxAge);
      if (filteredEvents.length === 0) {
        this.recentEvents.delete(key);
      } else {
        this.recentEvents.set(key, filteredEvents);
      }
    }
  }

  // Iniciar limpeza automática
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupOldEvents();
    }, 5 * 60 * 1000); // Limpar a cada 5 minutos
  }

  // Processar alerta de correlação
  async processCorrelationAlert(attackPattern) {
    const correlationAlert = {
      id: `correlation_${attackPattern.id}`,
      type: 'ATTACK_PATTERN',
      severity: attackPattern.severity,
      title: `🎯 ${attackPattern.ruleName}`,
      description: `${attackPattern.description}\n\nConfidence: ${(attackPattern.confidence * 100).toFixed(1)}%\nEvents: ${attackPattern.events.length}\nDuration: ${this.formatDuration(attackPattern.endTime - attackPattern.startTime)}`,
      clientIP: attackPattern.clientIP,
      timestamp: attackPattern.detectedAt.toISOString(),
      details: {
        correlationId: attackPattern.id,
        confidence: attackPattern.confidence,
        events: attackPattern.events,
        pattern: attackPattern.ruleName
      }
    };
    
    await this.createAlert(correlationAlert);
    
    console.log(`🎯 CORRELATION ALERT: ${attackPattern.ruleName} from ${attackPattern.clientIP}`);
  }
  
  // Formatar duração
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Parar servidor
  stop() {
    if (this.wss) {
      this.wss.close();
      console.log('🔌 Real-Time Alerts WebSocket server stopped');
    }
  }
}

// Instância singleton
const realTimeAlerts = new RealTimeAlertsSystem();

const realTimeAlerts$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    RealTimeAlertsSystem,
    default: realTimeAlerts,
    realTimeAlerts
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * Sistema de Correlação de Eventos de Segurança
 * Detecta ataques multi-etapas e padrões suspeitos complexos
 */


const __filename$3 = fileURLToPath(import.meta.url);
path.dirname(__filename$3);

class EventCorrelationEngine {
    constructor() {
        this.correlationRules = new Map();
        this.eventBuffer = new Map(); // IP -> eventos recentes
        this.attackPatterns = new Map();
        this.suspiciousSequences = new Map();
        
        this.initializeCorrelationRules();
        
        // Limpar buffer a cada 30 minutos
        setInterval(() => this.cleanupEventBuffer(), 30 * 60 * 1000);
    }
    
    initializeCorrelationRules() {
        // Regra 1: Reconnaissance -> Exploitation
        this.correlationRules.set('recon_to_exploit', {
            name: 'Reconnaissance to Exploitation',
            pattern: ['404_scan', 'admin_access', 'exploit_attempt'],
            timeWindow: 3600, // 1 hora
            severity: 'high',
            description: 'Detected reconnaissance followed by exploitation attempt'
        });
        
        // Regra 2: Brute Force Escalation
        this.correlationRules.set('brute_force_escalation', {
            name: 'Brute Force Escalation',
            pattern: ['failed_login', 'failed_login', 'successful_login', 'privilege_escalation'],
            timeWindow: 1800, // 30 minutos
            severity: 'critical',
            description: 'Brute force attack followed by privilege escalation'
        });
        
        // Regra 3: Data Exfiltration Pattern
        this.correlationRules.set('data_exfiltration', {
            name: 'Data Exfiltration Pattern',
            pattern: ['database_access', 'large_download', 'suspicious_upload'],
            timeWindow: 7200, // 2 horas
            severity: 'critical',
            description: 'Potential data exfiltration detected'
        });
        
        // Regra 4: Web Shell Upload
        this.correlationRules.set('web_shell_upload', {
            name: 'Web Shell Upload Attack',
            pattern: ['file_upload', 'suspicious_file_access', 'remote_code_execution'],
            timeWindow: 900, // 15 minutos
            severity: 'critical',
            description: 'Web shell upload and execution detected'
        });
        
        // Regra 5: SQL Injection Chain
        this.correlationRules.set('sql_injection_chain', {
            name: 'SQL Injection Attack Chain',
            pattern: ['sql_injection_attempt', 'database_error', 'data_extraction'],
            timeWindow: 1200, // 20 minutos
            severity: 'high',
            description: 'SQL injection attack chain detected'
        });
    }
    
    async processEvent(eventData) {
        const clientIP = eventData.client_ip || eventData.clientIP;
        if (!clientIP) return;
        
        // Adicionar evento ao buffer
        if (!this.eventBuffer.has(clientIP)) {
            this.eventBuffer.set(clientIP, []);
        }
        
        const ipEvents = this.eventBuffer.get(clientIP);
        ipEvents.push({
            ...eventData,
            timestamp: new Date(eventData.timestamp || Date.now())
        });
        
        // Manter apenas eventos das últimas 4 horas
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        this.eventBuffer.set(clientIP, 
            ipEvents.filter(event => event.timestamp > fourHoursAgo)
        );
        
        // Verificar correlações
        await this.checkCorrelations(clientIP);
    }
    
    async checkCorrelations(clientIP) {
        const ipEvents = this.eventBuffer.get(clientIP) || [];
        if (ipEvents.length < 2) return;
        
        for (const [ruleId, rule] of this.correlationRules) {
            const correlation = this.matchPattern(ipEvents, rule);
            if (correlation) {
                await this.handleCorrelationMatch(clientIP, ruleId, rule, correlation);
            }
        }
    }
    
    matchPattern(events, rule) {
        const { pattern, timeWindow } = rule;
        const now = new Date();
        const windowStart = new Date(now.getTime() - timeWindow * 1000);
        
        // Filtrar eventos dentro da janela de tempo
        const recentEvents = events.filter(event => 
            event.timestamp >= windowStart
        ).sort((a, b) => a.timestamp - b.timestamp);
        
        if (recentEvents.length < pattern.length) return null;
        
        // Verificar se o padrão existe na sequência
        for (let i = 0; i <= recentEvents.length - pattern.length; i++) {
            let patternMatch = true;
            const matchedEvents = [];
            
            for (let j = 0; j < pattern.length; j++) {
                const event = recentEvents[i + j];
                const expectedType = pattern[j];
                
                if (!this.eventMatchesType(event, expectedType)) {
                    patternMatch = false;
                    break;
                }
                matchedEvents.push(event);
            }
            
            if (patternMatch) {
                return {
                    events: matchedEvents,
                    startTime: matchedEvents[0].timestamp,
                    endTime: matchedEvents[matchedEvents.length - 1].timestamp,
                    confidence: this.calculateConfidence(matchedEvents, rule)
                };
            }
        }
        
        return null;
    }
    
    eventMatchesType(event, expectedType) {
        const eventType = event.event_type || event.type;
        const message = event.message || '';
        
        switch (expectedType) {
            case '404_scan':
                return eventType === '404_ERROR' || message.includes('404');
            case 'admin_access':
                return message.includes('admin') || message.includes('/wp-admin');
            case 'exploit_attempt':
                return message.includes('exploit') || message.includes('payload');
            case 'failed_login':
                return eventType === 'AUTH_FAILED' || message.includes('login failed');
            case 'successful_login':
                return eventType === 'AUTH_SUCCESS' || message.includes('login success');
            case 'privilege_escalation':
                return message.includes('privilege') || message.includes('sudo');
            case 'database_access':
                return message.includes('database') || message.includes('sql');
            case 'large_download':
                return eventType === 'LARGE_DOWNLOAD' || message.includes('download');
            case 'suspicious_upload':
                return eventType === 'FILE_UPLOAD' || message.includes('upload');
            case 'file_upload':
                return eventType === 'FILE_UPLOAD';
            case 'suspicious_file_access':
                return message.includes('.php') || message.includes('.jsp');
            case 'remote_code_execution':
                return message.includes('exec') || message.includes('shell');
            case 'sql_injection_attempt':
                return message.includes('sql injection') || message.includes('UNION SELECT');
            case 'database_error':
                return message.includes('mysql error') || message.includes('sql error');
            case 'data_extraction':
                return message.includes('SELECT') || message.includes('dump');
            default:
                return eventType === expectedType;
        }
    }
    
    calculateConfidence(events, rule) {
        let confidence = 0.5; // Base confidence
        
        // Aumentar confiança baseado em fatores
        if (events.length > rule.pattern.length) confidence += 0.1;
        if (events.some(e => e.severity === 'high' || e.severity === 'critical')) confidence += 0.2;
        
        // Verificar timing entre eventos (mais suspeito se muito rápido)
        const timeDiffs = [];
        for (let i = 1; i < events.length; i++) {
            timeDiffs.push(events[i].timestamp - events[i-1].timestamp);
        }
        
        const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
        if (avgTimeDiff < 60000) confidence += 0.15; // Menos de 1 minuto entre eventos
        
        return Math.min(confidence, 1.0);
    }
    
    async handleCorrelationMatch(clientIP, ruleId, rule, correlation) {
        const correlationId = `${clientIP}_${ruleId}_${Date.now()}`;
        
        // Evitar duplicatas
        if (this.attackPatterns.has(correlationId)) return;
        
        const attackPattern = {
            id: correlationId,
            clientIP,
            ruleName: rule.name,
            severity: rule.severity,
            description: rule.description,
            confidence: correlation.confidence,
            events: correlation.events,
            startTime: correlation.startTime,
            endTime: correlation.endTime,
            detectedAt: new Date()
        };
        
        this.attackPatterns.set(correlationId, attackPattern);
        
        console.log(`🚨 ATTACK PATTERN DETECTED: ${rule.name}`);
        console.log(`   Client IP: ${clientIP}`);
        console.log(`   Confidence: ${(correlation.confidence * 100).toFixed(1)}%`);
        console.log(`   Events: ${correlation.events.length}`);
        
        // Enviar alerta para sistema de alertas em tempo real
        try {
            const { default: realTimeAlerts } = await Promise.resolve().then(() => realTimeAlerts$1);
            await realTimeAlerts.processCorrelationAlert(attackPattern);
        } catch (error) {
            console.warn('⚠️ Could not send correlation alert:', error.message);
        }
        
        // Log para MySQL se disponível
        try {
            const { default: mysqlLogger } = await Promise.resolve().then(() => mysqlSecurityLogger$1);
            await mysqlLogger.logSecurityEvent({
                type: 'ATTACK_PATTERN',
                severity: rule.severity,
                clientIP,
                message: `Attack pattern detected: ${rule.name}`,
                details: {
                    pattern: attackPattern,
                    correlationId,
                    confidence: correlation.confidence
                }
            });
        } catch (error) {
            console.warn('⚠️ Could not log correlation to MySQL:', error.message);
        }
    }
    
    cleanupEventBuffer() {
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
        
        for (const [ip, events] of this.eventBuffer) {
            const recentEvents = events.filter(event => event.timestamp > fourHoursAgo);
            
            if (recentEvents.length === 0) {
                this.eventBuffer.delete(ip);
            } else {
                this.eventBuffer.set(ip, recentEvents);
            }
        }
        
        console.log(`🧹 Event buffer cleanup: ${this.eventBuffer.size} IPs tracked`);
    }
    
    getAttackPatterns(limit = 50) {
        return Array.from(this.attackPatterns.values())
            .sort((a, b) => b.detectedAt - a.detectedAt)
            .slice(0, limit);
    }
    
    getIPStatistics(clientIP) {
        const events = this.eventBuffer.get(clientIP) || [];
        const patterns = Array.from(this.attackPatterns.values())
            .filter(pattern => pattern.clientIP === clientIP);
        
        return {
            totalEvents: events.length,
            attackPatterns: patterns.length,
            riskScore: this.calculateRiskScore(events, patterns),
            lastActivity: events.length > 0 ? events[events.length - 1].timestamp : null
        };
    }
    
    calculateRiskScore(events, patterns) {
        let score = 0;
        
        // Base score por número de eventos
        score += Math.min(events.length * 2, 50);
        
        // Score por padrões de ataque
        patterns.forEach(pattern => {
            switch (pattern.severity) {
                case 'critical': score += 40; break;
                case 'high': score += 25; break;
                case 'medium': score += 15; break;
                case 'low': score += 5; break;
            }
            score += pattern.confidence * 20;
        });
        
        return Math.min(score, 100);
    }
}

// Singleton instance
const eventCorrelation = new EventCorrelationEngine();

const eventCorrelation$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: eventCorrelation
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * SOAR - Security Orchestration, Automation and Response System
 * Automatiza respostas a incidentes de segurança baseado em playbooks
 */


const __filename$2 = fileURLToPath(import.meta.url);
path.dirname(__filename$2);

class SOARSystem {
    constructor() {
        this.playbooks = new Map();
        this.activeIncidents = new Map();
        this.responseHistory = [];
        this.automationRules = new Map();
        
        this.initializePlaybooks();
        this.initializeAutomationRules();
    }
    
    initializePlaybooks() {
        // Playbook 1: Brute Force Response
        this.playbooks.set('brute_force_response', {
            name: 'Brute Force Attack Response',
            triggers: ['brute_force_escalation', 'multiple_failed_logins'],
            severity: ['high', 'critical'],
            steps: [
                { action: 'block_ip', priority: 1, automated: true },
                { action: 'notify_admin', priority: 2, automated: true },
                { action: 'log_incident', priority: 3, automated: true },
                { action: 'analyze_logs', priority: 4, automated: false },
                { action: 'update_firewall', priority: 5, automated: false }
            ],
            cooldown: 300 // 5 minutos
        });
        
        // Playbook 2: SQL Injection Response
        this.playbooks.set('sql_injection_response', {
            name: 'SQL Injection Attack Response',
            triggers: ['sql_injection_chain', 'database_compromise'],
            severity: ['high', 'critical'],
            steps: [
                { action: 'block_ip', priority: 1, automated: true },
                { action: 'isolate_database', priority: 2, automated: false },
                { action: 'backup_database', priority: 3, automated: true },
                { action: 'notify_dba', priority: 4, automated: true },
                { action: 'forensic_analysis', priority: 5, automated: false }
            ],
            cooldown: 600 // 10 minutos
        });
        
        // Playbook 3: Web Shell Detection Response
        this.playbooks.set('web_shell_response', {
            name: 'Web Shell Detection Response',
            triggers: ['web_shell_upload', 'suspicious_file_execution'],
            severity: ['critical'],
            steps: [
                { action: 'quarantine_file', priority: 1, automated: true },
                { action: 'block_ip', priority: 2, automated: true },
                { action: 'scan_filesystem', priority: 3, automated: true },
                { action: 'notify_security_team', priority: 4, automated: true },
                { action: 'incident_response', priority: 5, automated: false }
            ],
            cooldown: 900 // 15 minutos
        });
        
        // Playbook 4: Data Exfiltration Response
        this.playbooks.set('data_exfiltration_response', {
            name: 'Data Exfiltration Response',
            triggers: ['data_exfiltration', 'large_data_transfer'],
            severity: ['critical'],
            steps: [
                { action: 'block_ip', priority: 1, automated: true },
                { action: 'block_outbound_traffic', priority: 2, automated: true },
                { action: 'notify_legal_team', priority: 3, automated: true },
                { action: 'preserve_evidence', priority: 4, automated: false },
                { action: 'compliance_notification', priority: 5, automated: false }
            ],
            cooldown: 1800 // 30 minutos
        });
        
        // Playbook 5: Generic High Severity Response
        this.playbooks.set('generic_high_severity', {
            name: 'Generic High Severity Incident Response',
            triggers: ['*'],
            severity: ['critical'],
            steps: [
                { action: 'log_incident', priority: 1, automated: true },
                { action: 'notify_admin', priority: 2, automated: true },
                { action: 'collect_evidence', priority: 3, automated: true },
                { action: 'manual_investigation', priority: 4, automated: false }
            ],
            cooldown: 180 // 3 minutos
        });
    }
    
    initializeAutomationRules() {
        // Regra 1: Auto-block IPs com múltiplas violações
        this.automationRules.set('auto_block_repeat_offenders', {
            name: 'Auto-block Repeat Offenders',
            condition: (incident) => {
                const ip = incident.clientIP;
                const recentIncidents = this.getRecentIncidentsByIP(ip, 3600); // 1 hora
                return recentIncidents.length >= 3;
            },
            action: 'permanent_ip_block',
            enabled: true
        });
        
        // Regra 2: Escalação automática para incidentes críticos
        this.automationRules.set('auto_escalate_critical', {
            name: 'Auto-escalate Critical Incidents',
            condition: (incident) => {
                return incident.severity === 'critical' && 
                       incident.confidence > 0.8;
            },
            action: 'escalate_to_security_team',
            enabled: true
        });
        
        // Regra 3: Auto-quarentena de arquivos suspeitos
        this.automationRules.set('auto_quarantine_files', {
            name: 'Auto-quarantine Suspicious Files',
            condition: (incident) => {
                return incident.type === 'web_shell_upload' || 
                       incident.details?.suspicious_file;
            },
            action: 'quarantine_suspicious_files',
            enabled: true
        });
    }
    
    async processIncident(incident) {
        // Evitar loop infinito - não processar incidentes do próprio SOAR
        if (incident.type === 'SOAR_INCIDENT' || incident.type === 'AUTOMATED_RESPONSE') {
            return;
        }
        
        console.log(`🚨 SOAR Processing incident: ${incident.type}`);
        
        // Verificar se já existe um incidente ativo para este IP
        const existingIncident = this.getActiveIncidentByIP(incident.clientIP);
        if (existingIncident && this.isInCooldown(existingIncident)) {
            console.log(`⏳ Incident in cooldown for IP ${incident.clientIP}`);
            return;
        }
        
        // Encontrar playbook apropriado
        const playbook = this.findMatchingPlaybook(incident);
        if (!playbook) {
            console.log(`❌ No matching playbook found for incident type: ${incident.type}`);
            return;
        }
        
        console.log(`📋 Using playbook: ${playbook.name}`);
        
        // Criar registro do incidente
        const incidentRecord = {
            id: `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...incident,
            playbook: playbook.name,
            status: 'active',
            startTime: new Date(),
            steps: [],
            automated: true
        };
        
        this.activeIncidents.set(incidentRecord.id, incidentRecord);
        
        // Executar playbook
        await this.executePlaybook(incidentRecord, playbook);
        
        // Aplicar regras de automação
        await this.applyAutomationRules(incidentRecord);
    }
    
    findMatchingPlaybook(incident) {
        // Procurar playbook específico primeiro
        for (const [id, playbook] of this.playbooks) {
            if (playbook.triggers.includes(incident.type) && 
                playbook.severity.includes(incident.severity)) {
                return playbook;
            }
        }
        
        // Fallback para playbook genérico
        if (incident.severity === 'critical') {
            return this.playbooks.get('generic_high_severity');
        }
        
        return null;
    }
    
    async executePlaybook(incident, playbook) {
        console.log(`🎯 Executing playbook: ${playbook.name}`);
        
        for (const step of playbook.steps.sort((a, b) => a.priority - b.priority)) {
            const stepResult = {
                action: step.action,
                automated: step.automated,
                startTime: new Date(),
                status: 'pending'
            };
            
            try {
                if (step.automated) {
                    console.log(`🤖 Executing automated action: ${step.action}`);
                    await this.executeAutomatedAction(step.action, incident);
                    stepResult.status = 'completed';
                    stepResult.result = 'success';
                } else {
                    console.log(`👤 Manual action required: ${step.action}`);
                    await this.createManualTask(step.action, incident);
                    stepResult.status = 'manual_pending';
                    stepResult.result = 'manual_task_created';
                }
                
                stepResult.endTime = new Date();
                incident.steps.push(stepResult);
                
            } catch (error) {
                console.error(`❌ Error executing step ${step.action}:`, error.message);
                stepResult.status = 'failed';
                stepResult.error = error.message;
                stepResult.endTime = new Date();
                incident.steps.push(stepResult);
            }
        }
        
        // Marcar incidente como processado
        incident.status = 'processed';
        incident.endTime = new Date();
        
        console.log(`✅ Playbook execution completed for incident ${incident.id}`);
    }
    
    async executeAutomatedAction(action, incident) {
        switch (action) {
            case 'block_ip':
                await this.blockIP(incident.clientIP, incident);
                break;
                
            case 'notify_admin':
                await this.notifyAdmin(incident);
                break;
                
            case 'log_incident':
                await this.logIncident(incident);
                break;
                
            case 'quarantine_file':
                await this.quarantineFile(incident);
                break;
                
            case 'backup_database':
                await this.backupDatabase(incident);
                break;
                
            case 'scan_filesystem':
                await this.scanFilesystem(incident);
                break;
                
            case 'collect_evidence':
                await this.collectEvidence(incident);
                break;
                
            case 'block_outbound_traffic':
                await this.blockOutboundTraffic(incident.clientIP);
                break;
                
            default:
                console.log(`⚠️ Unknown automated action: ${action}`);
        }
    }
    
    async blockIP(ip, incident) {
        console.log(`🚫 Blocking IP: ${ip}`);
        
        // Simular bloqueio de IP (em produção, integraria com firewall/WAF)
        const blockRecord = {
            ip,
            reason: `SOAR automated block - ${incident.type}`,
            timestamp: new Date(),
            incidentId: incident.id,
            duration: '24h' // Bloqueio temporário
        };
        
        // Log do bloqueio
        try {
            const { default: mysqlLogger } = await Promise.resolve().then(() => mysqlSecurityLogger$1);
            await mysqlLogger.logSecurityEvent({
                type: 'IP_BLOCKED',
                severity: 'high',
                clientIP: ip,
                message: `IP automatically blocked by SOAR system`,
                details: blockRecord
            });
        } catch (error) {
            console.warn('Could not log IP block to MySQL:', error.message);
        }
        
        // Notificar sistema de alertas
        try {
            const { default: realTimeAlerts } = await Promise.resolve().then(() => realTimeAlerts$1);
            await realTimeAlerts.processSecurityEvent({
                type: 'AUTOMATED_RESPONSE',
                severity: 'medium',
                client_ip: ip,
                message: `IP ${ip} automatically blocked`,
                details: blockRecord
            });
        } catch (error) {
            console.warn('Could not send block notification:', error.message);
        }
    }
    
    async notifyAdmin(incident) {
        console.log(`📧 Notifying admin about incident: ${incident.type}`);
        
        const notification = {
            severity: incident.severity,
            subject: `Security Incident: ${incident.type}`,
            message: `
Security incident detected and processed by SOAR system:

Incident ID: ${incident.id}
Type: ${incident.type}
Severity: ${incident.severity}
Client IP: ${incident.clientIP}
Timestamp: ${incident.startTime.toISOString()}
Playbook: ${incident.playbook}

Details: ${JSON.stringify(incident.details, null, 2)}

Automated actions have been taken. Please review the incident for any additional manual steps required.
            `};
        
        // Em produção, enviaria email/SMS/Slack
        console.log('📨 Admin notification:', notification.subject);
    }
    
    async logIncident(incident) {
        console.log(`📝 Logging incident: ${incident.id}`);
        
        try {
            const { default: mysqlLogger } = await Promise.resolve().then(() => mysqlSecurityLogger$1);
            await mysqlLogger.logSecurityEvent({
                type: 'SOAR_INCIDENT',
                severity: incident.severity,
                clientIP: incident.clientIP,
                message: `SOAR incident processed: ${incident.type}`,
                details: {
                    incidentId: incident.id,
                    playbook: incident.playbook,
                    steps: incident.steps,
                    automated: incident.automated
                }
            });
        } catch (error) {
            console.warn('Could not log incident to MySQL:', error.message);
        }
    }
    
    async quarantineFile(incident) {
        console.log(`🔒 Quarantining suspicious files for incident: ${incident.id}`);
        
        // Simular quarentena de arquivo
        const quarantineAction = {
            files: incident.details?.suspicious_files || ['unknown'],
            incidentId: incident.id
        };
        
        console.log('🗂️ Files quarantined:', quarantineAction.files);
    }
    
    async createManualTask(action, incident) {
        console.log(`📋 Creating manual task: ${action}`);
        
        const task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            incidentId: incident.id,
            priority: this.getTaskPriority(incident.severity),
            description: this.getTaskDescription(action, incident)
        };
        
        // Em produção, criaria ticket no sistema de ticketing
        console.log(`🎫 Manual task created: ${task.id} - ${task.description}`);
    }
    
    getTaskDescription(action, incident) {
        const descriptions = {
            'analyze_logs': `Analyze logs for incident ${incident.id} (${incident.type})`,
            'update_firewall': `Update firewall rules based on incident ${incident.id}`,
            'isolate_database': `Isolate database due to incident ${incident.id}`,
            'forensic_analysis': `Perform forensic analysis for incident ${incident.id}`,
            'incident_response': `Execute incident response plan for ${incident.id}`,
            'manual_investigation': `Manual investigation required for incident ${incident.id}`,
            'preserve_evidence': `Preserve evidence for incident ${incident.id}`,
            'compliance_notification': `Send compliance notifications for incident ${incident.id}`
        };
        
        return descriptions[action] || `Manual action required: ${action} for incident ${incident.id}`;
    }
    
    getTaskPriority(severity) {
        switch (severity) {
            case 'critical': return 'urgent';
            case 'high': return 'high';
            case 'medium': return 'medium';
            default: return 'low';
        }
    }
    
    async applyAutomationRules(incident) {
        for (const [ruleId, rule] of this.automationRules) {
            if (!rule.enabled) continue;
            
            try {
                if (rule.condition(incident)) {
                    console.log(`🔧 Applying automation rule: ${rule.name}`);
                    await this.executeAutomatedAction(rule.action, incident);
                }
            } catch (error) {
                console.error(`❌ Error applying automation rule ${ruleId}:`, error.message);
            }
        }
    }
    
    getActiveIncidentByIP(ip) {
        for (const incident of this.activeIncidents.values()) {
            if (incident.clientIP === ip && incident.status === 'active') {
                return incident;
            }
        }
        return null;
    }
    
    isInCooldown(incident) {
        const playbook = this.playbooks.get(incident.playbook);
        if (!playbook) return false;
        
        const cooldownEnd = new Date(incident.startTime.getTime() + playbook.cooldown * 1000);
        return new Date() < cooldownEnd;
    }
    
    getRecentIncidentsByIP(ip, timeWindowSeconds) {
        const cutoff = new Date(Date.now() - timeWindowSeconds * 1000);
        return Array.from(this.activeIncidents.values())
            .filter(incident => 
                incident.clientIP === ip && 
                incident.startTime > cutoff
            );
    }
    
    // Métodos de utilidade para outras ações automatizadas
    async backupDatabase(incident) {
        console.log(`💾 Initiating database backup for incident: ${incident.id}`);
        // Simular backup de banco de dados
    }
    
    async scanFilesystem(incident) {
        console.log(`🔍 Scanning filesystem for incident: ${incident.id}`);
        // Simular scan do sistema de arquivos
    }
    
    async collectEvidence(incident) {
        console.log(`🕵️ Collecting evidence for incident: ${incident.id}`);
        // Simular coleta de evidências
    }
    
    async blockOutboundTraffic(ip) {
        console.log(`🚫 Blocking outbound traffic for IP: ${ip}`);
        // Simular bloqueio de tráfego de saída
    }
    
    // Métodos de consulta e relatórios
    getIncidentStats() {
        const incidents = Array.from(this.activeIncidents.values());
        return {
            total: incidents.length,
            active: incidents.filter(i => i.status === 'active').length,
            processed: incidents.filter(i => i.status === 'processed').length,
            bySeverity: {
                critical: incidents.filter(i => i.severity === 'critical').length,
                high: incidents.filter(i => i.severity === 'high').length,
                medium: incidents.filter(i => i.severity === 'medium').length,
                low: incidents.filter(i => i.severity === 'low').length
            }
        };
    }
    
    getRecentIncidents(limit = 20) {
        return Array.from(this.activeIncidents.values())
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, limit);
    }
}

// Singleton instance
const soarSystem = new SOARSystem();

const soarSystem$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: soarSystem
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * UEBA - User and Entity Behavior Analytics System
 * Detecta anomalias comportamentais de usuários e entidades através de análise de padrões
 */


const __filename$1 = fileURLToPath(import.meta.url);
path.dirname(__filename$1);

class UEBASystem {
    constructor() {
        this.userProfiles = new Map();
        this.entityProfiles = new Map();
        this.behaviorBaselines = new Map();
        this.anomalyThresholds = {
            low: 0.3,
            medium: 0.5,
            high: 0.7,
            critical: 0.9
        };
        this.learningPeriod = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
        this.analysisWindow = 24 * 60 * 60 * 1000; // 24 horas em ms
        
        this.initializeBehaviorModels();
    }
    
    initializeBehaviorModels() {
        // Modelos de comportamento para análise
        this.behaviorModels = {
            // Padrões de acesso temporal
            temporal: {
                name: 'Temporal Access Patterns',
                weight: 0.25,
                analyze: (user, activity) => this.analyzeTemporalPattern(user, activity)
            },
            
            // Padrões de localização geográfica
            geolocation: {
                name: 'Geolocation Patterns',
                weight: 0.20,
                analyze: (user, activity) => this.analyzeGeolocationPattern(user, activity)
            },
            
            // Padrões de recursos acessados
            resource: {
                name: 'Resource Access Patterns',
                weight: 0.20,
                analyze: (user, activity) => this.analyzeResourcePattern(user, activity)
            },
            
            // Padrões de volume de atividade
            volume: {
                name: 'Activity Volume Patterns',
                weight: 0.15,
                analyze: (user, activity) => this.analyzeVolumePattern(user, activity)
            },
            
            // Padrões de dispositivos/user agents
            device: {
                name: 'Device/User Agent Patterns',
                weight: 0.10,
                analyze: (user, activity) => this.analyzeDevicePattern(user, activity)
            },
            
            // Padrões de sequência de ações
            sequence: {
                name: 'Action Sequence Patterns',
                weight: 0.10,
                analyze: (user, activity) => this.analyzeSequencePattern(user, activity)
            }
        };
    }
    
    async processActivity(activity) {
        const userId = this.extractUserId(activity);
        const entityId = this.extractEntityId(activity);
        
        console.log(`🔍 UEBA analyzing activity for user: ${userId}`);
        
        // Processar atividade do usuário
        if (userId) {
            await this.processUserActivity(userId, activity);
        }
        
        // Processar atividade da entidade
        if (entityId) {
            await this.processEntityActivity(entityId, activity);
        }
    }
    
    async processUserActivity(userId, activity) {
        // Obter ou criar perfil do usuário
        let userProfile = this.userProfiles.get(userId);
        if (!userProfile) {
            userProfile = this.createUserProfile(userId);
            this.userProfiles.set(userId, userProfile);
        }
        
        // Adicionar atividade ao histórico
        userProfile.activities.push({
            ...activity,
            timestamp: new Date(),
            processed: false
        });
        
        // Limitar histórico (manter apenas últimos 1000 eventos)
        if (userProfile.activities.length > 1000) {
            userProfile.activities = userProfile.activities.slice(-1e3);
        }
        
        // Verificar se está no período de aprendizado
        const isLearning = this.isInLearningPeriod(userProfile);
        
        if (isLearning) {
            console.log(`📚 Learning mode for user ${userId}`);
            await this.updateUserBaseline(userProfile, activity);
        } else {
            // Analisar anomalias
            const anomalyScore = await this.analyzeUserAnomaly(userProfile, activity);
            
            if (anomalyScore > this.anomalyThresholds.low) {
                await this.handleUserAnomaly(userId, activity, anomalyScore);
            }
        }
        
        // Atualizar estatísticas do perfil
        this.updateUserStatistics(userProfile, activity);
    }
    
    createUserProfile(userId) {
        return {
            userId,
            createdAt: new Date(),
            activities: [],
            baseline: {
                temporal: { hours: new Array(24).fill(0), days: new Array(7).fill(0) },
                geolocation: { countries: new Map(), cities: new Map() },
                resources: { paths: new Map(), methods: new Map() },
                volume: { hourly: [], daily: [] },
                devices: { userAgents: new Map(), ips: new Map() },
                sequences: { patterns: new Map() }
            },
            statistics: {
                totalActivities: 0,
                lastActivity: null,
                averageSessionDuration: 0,
                commonHours: [],
                commonLocations: [],
                riskScore: 0
            },
            anomalies: []
        };
    }
    
    async analyzeUserAnomaly(userProfile, activity) {
        let totalScore = 0;
        let totalWeight = 0;
        const anomalyDetails = {};
        
        // Analisar cada modelo de comportamento
        for (const [modelName, model] of Object.entries(this.behaviorModels)) {
            try {
                const score = await model.analyze(userProfile, activity);
                anomalyDetails[modelName] = {
                    score,
                    weight: model.weight,
                    contribution: score * model.weight
                };
                
                totalScore += score * model.weight;
                totalWeight += model.weight;
            } catch (error) {
                console.warn(`Error in ${modelName} analysis:`, error.message);
            }
        }
        
        const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        
        console.log(`🎯 Anomaly score for ${userProfile.userId}: ${finalScore.toFixed(3)}`);
        
        return {
            score: finalScore,
            details: anomalyDetails,
            timestamp: new Date()
        };
    }
    
    analyzeTemporalPattern(userProfile, activity) {
        const activityTime = new Date(activity.timestamp || Date.now());
        const hour = activityTime.getHours();
        const day = activityTime.getDay();
        
        const baseline = userProfile.baseline.temporal;
        
        // Calcular desvio do padrão horário normal
        const hourlyTotal = baseline.hours.reduce((sum, count) => sum + count, 0);
        const expectedHourlyActivity = hourlyTotal > 0 ? baseline.hours[hour] / hourlyTotal : 0;
        
        // Calcular desvio do padrão diário normal
        const dailyTotal = baseline.days.reduce((sum, count) => sum + count, 0);
        const expectedDailyActivity = dailyTotal > 0 ? baseline.days[day] / dailyTotal : 0;
        
        // Atividade fora do horário normal (madrugada) é mais suspeita
        let temporalScore = 0;
        if (hour >= 0 && hour <= 5) {
            temporalScore += 0.3; // Atividade na madrugada
        }
        
        // Se a atividade é muito rara neste horário/dia
        if (expectedHourlyActivity < 0.05) temporalScore += 0.4;
        if (expectedDailyActivity < 0.1) temporalScore += 0.3;
        
        return Math.min(temporalScore, 1.0);
    }
    
    analyzeGeolocationPattern(userProfile, activity) {
        const clientIP = activity.client_ip || activity.clientIP;
        if (!clientIP) return 0;
        
        // Simular análise de geolocalização baseada no IP
        const location = this.getLocationFromIP(clientIP);
        const baseline = userProfile.baseline.geolocation;
        
        let geoScore = 0;
        
        // Verificar se é um país novo
        if (!baseline.countries.has(location.country)) {
            geoScore += 0.6; // País completamente novo
        } else {
            const countryFreq = baseline.countries.get(location.country) || 0;
            if (countryFreq < 5) {
                geoScore += 0.3; // País raro
            }
        }
        
        // Verificar se é uma cidade nova
        if (!baseline.cities.has(location.city)) {
            geoScore += 0.4; // Cidade nova
        }
        
        // IPs privados são menos suspeitos
        if (this.isPrivateIP(clientIP)) {
            geoScore *= 0.5;
        }
        
        return Math.min(geoScore, 1.0);
    }
    
    analyzeResourcePattern(userProfile, activity) {
        const path = activity.path || activity.url || '';
        const method = activity.method || 'GET';
        
        const baseline = userProfile.baseline.resources;
        
        let resourceScore = 0;
        
        // Verificar se é um recurso novo
        if (!baseline.paths.has(path)) {
            resourceScore += 0.4; // Recurso novo
        } else {
            const pathFreq = baseline.paths.get(path) || 0;
            if (pathFreq < 3) {
                resourceScore += 0.2; // Recurso raro
            }
        }
        
        // Métodos não-GET são mais suspeitos
        if (method !== 'GET') {
            resourceScore += 0.3;
        }
        
        // Recursos administrativos são mais sensíveis
        if (path.includes('/admin') || path.includes('/api')) {
            resourceScore += 0.2;
        }
        
        return Math.min(resourceScore, 1.0);
    }
    
    analyzeVolumePattern(userProfile, activity) {
        const now = new Date();
        const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
        
        // Contar atividades na última hora
        const recentActivities = userProfile.activities.filter(act => 
            new Date(act.timestamp) >= hourStart
        ).length;
        
        const baseline = userProfile.baseline.volume;
        const avgHourlyActivity = baseline.hourly.length > 0 ? 
            baseline.hourly.reduce((sum, count) => sum + count, 0) / baseline.hourly.length : 1;
        
        let volumeScore = 0;
        
        // Volume muito acima do normal
        if (recentActivities > avgHourlyActivity * 3) {
            volumeScore += 0.6;
        } else if (recentActivities > avgHourlyActivity * 2) {
            volumeScore += 0.3;
        }
        
        // Rajadas de atividade (muitas atividades em pouco tempo)
        const last5Minutes = userProfile.activities.filter(act => 
            new Date(act.timestamp) >= new Date(now.getTime() - 5 * 60 * 1000)
        ).length;
        
        if (last5Minutes > 10) {
            volumeScore += 0.4;
        }
        
        return Math.min(volumeScore, 1.0);
    }
    
    analyzeDevicePattern(userProfile, activity) {
        const userAgent = activity.user_agent || activity.userAgent || '';
        const clientIP = activity.client_ip || activity.clientIP || '';
        
        const baseline = userProfile.baseline.devices;
        
        let deviceScore = 0;
        
        // User Agent novo
        if (userAgent && !baseline.userAgents.has(userAgent)) {
            deviceScore += 0.5;
        }
        
        // IP novo
        if (clientIP && !baseline.ips.has(clientIP)) {
            deviceScore += 0.3;
        }
        
        // User Agents suspeitos
        const suspiciousUAs = ['curl', 'wget', 'python', 'bot', 'crawler', 'scanner'];
        if (suspiciousUAs.some(ua => userAgent.toLowerCase().includes(ua))) {
            deviceScore += 0.4;
        }
        
        return Math.min(deviceScore, 1.0);
    }
    
    analyzeSequencePattern(userProfile, activity) {
        // Analisar últimas 5 atividades para detectar padrões suspeitos
        const recentActivities = userProfile.activities.slice(-5);
        
        let sequenceScore = 0;
        
        // Sequência de falhas de autenticação
        const authFailures = recentActivities.filter(act => 
            act.type === 'auth_failure' || act.message?.includes('failed')
        ).length;
        
        if (authFailures >= 3) {
            sequenceScore += 0.6;
        }
        
        // Sequência de acessos a recursos sensíveis
        const sensitiveAccess = recentActivities.filter(act => 
            act.path?.includes('/admin') || act.path?.includes('/api')
        ).length;
        
        if (sensitiveAccess >= 3) {
            sequenceScore += 0.4;
        }
        
        // Padrão de reconhecimento (muitos 404s)
        const notFoundErrors = recentActivities.filter(act => 
            act.status === 404 || act.message?.includes('404')
        ).length;
        
        if (notFoundErrors >= 4) {
            sequenceScore += 0.5;
        }
        
        return Math.min(sequenceScore, 1.0);
    }
    
    async handleUserAnomaly(userId, activity, anomalyResult) {
        const severity = this.calculateSeverity(anomalyResult.score);
        
        console.log(`🚨 User anomaly detected: ${userId} - Score: ${anomalyResult.score.toFixed(3)} - Severity: ${severity}`);
        
        // Criar evento de anomalia
        const anomalyEvent = {
            type: 'USER_BEHAVIOR_ANOMALY',
            severity,
            userId,
            anomalyScore: anomalyResult.score,
            details: {
                originalActivity: activity,
                anomalyAnalysis: anomalyResult.details,
                behaviorModels: Object.keys(this.behaviorModels)
            },
            timestamp: new Date()
        };
        
        // Adicionar à lista de anomalias do usuário
        const userProfile = this.userProfiles.get(userId);
        if (userProfile) {
            userProfile.anomalies.push(anomalyEvent);
            userProfile.statistics.riskScore = Math.max(
                userProfile.statistics.riskScore,
                anomalyResult.score
            );
            
            // Manter apenas últimas 50 anomalias
            if (userProfile.anomalies.length > 50) {
                userProfile.anomalies = userProfile.anomalies.slice(-50);
            }
        }
        
        // Enviar para sistema de alertas
        try {
            const { default: realTimeAlerts } = await Promise.resolve().then(() => realTimeAlerts$1);
            await realTimeAlerts.processSecurityEvent({
                type: 'USER_BEHAVIOR_ANOMALY',
                severity,
                client_ip: activity.client_ip || activity.clientIP,
                user_agent: activity.user_agent || activity.userAgent,
                message: `Anomalous behavior detected for user ${userId}`,
                details: {
                    userId,
                    anomalyScore: anomalyResult.score,
                    topContributors: this.getTopAnomalyContributors(anomalyResult.details),
                    riskLevel: severity
                }
            });
        } catch (error) {
            console.warn('Could not send anomaly alert:', error.message);
        }
        
        // Log no MySQL se disponível
        try {
            const { default: mysqlLogger } = await Promise.resolve().then(() => mysqlSecurityLogger$1);
            await mysqlLogger.logSecurityEvent({
                type: 'USER_BEHAVIOR_ANOMALY',
                severity,
                clientIP: activity.client_ip || activity.clientIP,
                message: `UEBA detected anomalous behavior for user ${userId}`,
                details: anomalyEvent
            });
        } catch (error) {
            console.warn('Could not log anomaly to MySQL:', error.message);
        }
    }
    
    getTopAnomalyContributors(anomalyDetails) {
        return Object.entries(anomalyDetails)
            .sort((a, b) => b[1].contribution - a[1].contribution)
            .slice(0, 3)
            .map(([model, data]) => ({
                model,
                score: data.score,
                contribution: data.contribution
            }));
    }
    
    calculateSeverity(score) {
        if (score >= this.anomalyThresholds.critical) return 'critical';
        if (score >= this.anomalyThresholds.high) return 'high';
        if (score >= this.anomalyThresholds.medium) return 'medium';
        return 'low';
    }
    
    async updateUserBaseline(userProfile, activity) {
        const baseline = userProfile.baseline;
        const activityTime = new Date(activity.timestamp || Date.now());
        
        // Atualizar baseline temporal
        baseline.temporal.hours[activityTime.getHours()]++;
        baseline.temporal.days[activityTime.getDay()]++;
        
        // Atualizar baseline de geolocalização
        const clientIP = activity.client_ip || activity.clientIP;
        if (clientIP) {
            const location = this.getLocationFromIP(clientIP);
            baseline.geolocation.countries.set(
                location.country,
                (baseline.geolocation.countries.get(location.country) || 0) + 1
            );
            baseline.geolocation.cities.set(
                location.city,
                (baseline.geolocation.cities.get(location.city) || 0) + 1
            );
        }
        
        // Atualizar baseline de recursos
        const path = activity.path || activity.url || '';
        const method = activity.method || 'GET';
        if (path) {
            baseline.resources.paths.set(
                path,
                (baseline.resources.paths.get(path) || 0) + 1
            );
        }
        baseline.resources.methods.set(
            method,
            (baseline.resources.methods.get(method) || 0) + 1
        );
        
        // Atualizar baseline de dispositivos
        const userAgent = activity.user_agent || activity.userAgent;
        if (userAgent) {
            baseline.devices.userAgents.set(
                userAgent,
                (baseline.devices.userAgents.get(userAgent) || 0) + 1
            );
        }
        if (clientIP) {
            baseline.devices.ips.set(
                clientIP,
                (baseline.devices.ips.get(clientIP) || 0) + 1
            );
        }
    }
    
    // Métodos utilitários
    extractUserId(activity) {
        return activity.userId || 
               activity.user_id || 
               activity.username || 
               activity.client_ip || 
               activity.clientIP || 
               'anonymous';
    }
    
    extractEntityId(activity) {
        return activity.entityId || 
               activity.resource || 
               activity.path || 
               activity.url;
    }
    
    isInLearningPeriod(userProfile) {
        const profileAge = Date.now() - userProfile.createdAt.getTime();
        return profileAge < this.learningPeriod || userProfile.activities.length < 100;
    }
    
    getLocationFromIP(ip) {
        // Simulação simples de geolocalização
        if (this.isPrivateIP(ip)) {
            return { country: 'Local', city: 'Private Network' };
        }
        
        // Simulação baseada no primeiro octeto
        const firstOctet = parseInt(ip.split('.')[0]);
        if (firstOctet >= 1 && firstOctet <= 50) {
            return { country: 'United States', city: 'New York' };
        } else if (firstOctet >= 51 && firstOctet <= 100) {
            return { country: 'Brazil', city: 'São Paulo' };
        } else if (firstOctet >= 101 && firstOctet <= 150) {
            return { country: 'Germany', city: 'Berlin' };
        } else {
            return { country: 'Unknown', city: 'Unknown' };
        }
    }
    
    isPrivateIP(ip) {
        const privateRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^127\./
        ];
        return privateRanges.some(range => range.test(ip));
    }
    
    updateUserStatistics(userProfile, activity) {
        userProfile.statistics.totalActivities++;
        userProfile.statistics.lastActivity = new Date();
        
        // Atualizar horários comuns
        const hour = new Date(activity.timestamp || Date.now()).getHours();
        if (!userProfile.statistics.commonHours.includes(hour)) {
            userProfile.statistics.commonHours.push(hour);
        }
    }
    
    // Métodos de consulta e relatórios
    getUserRiskProfiles(limit = 20) {
        return Array.from(this.userProfiles.values())
            .sort((a, b) => b.statistics.riskScore - a.statistics.riskScore)
            .slice(0, limit)
            .map(profile => ({
                userId: profile.userId,
                riskScore: profile.statistics.riskScore,
                totalActivities: profile.statistics.totalActivities,
                anomaliesCount: profile.anomalies.length,
                lastActivity: profile.statistics.lastActivity,
                isLearning: this.isInLearningPeriod(profile)
            }));
    }
    
    getAnomalyStats() {
        let totalAnomalies = 0;
        let severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
        
        for (const profile of this.userProfiles.values()) {
            totalAnomalies += profile.anomalies.length;
            for (const anomaly of profile.anomalies) {
                severityCount[anomaly.severity]++;
            }
        }
        
        return {
            totalUsers: this.userProfiles.size,
            totalAnomalies,
            bySeverity: severityCount,
            averageRiskScore: this.calculateAverageRiskScore()
        };
    }
    
    calculateAverageRiskScore() {
        if (this.userProfiles.size === 0) return 0;
        
        const totalRisk = Array.from(this.userProfiles.values())
            .reduce((sum, profile) => sum + profile.statistics.riskScore, 0);
        
        return totalRisk / this.userProfiles.size;
    }
    
    async processEntityActivity(entityId, activity) {
        // Implementação básica para análise de entidades
        // Pode ser expandida para analisar comportamento de sistemas, APIs, etc.
        console.log(`🏢 Processing entity activity: ${entityId}`);
    }
}

// Singleton instance
const uebaSystem = new UEBASystem();

const uebaSystem$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: uebaSystem
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * Threat Intelligence Integration System
 * Integra com feeds externos de threat intelligence para enriquecer análises de segurança
 */


const __filename = fileURLToPath(import.meta.url);
path.dirname(__filename);

class ThreatIntelligenceSystem {
    constructor() {
        this.threatFeeds = new Map();
        this.ipReputationCache = new Map();
        this.domainReputationCache = new Map();
        this.hashReputationCache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
        this.threatCategories = {
            malware: { severity: 'critical', weight: 1.0 },
            botnet: { severity: 'high', weight: 0.9 },
            phishing: { severity: 'high', weight: 0.8 },
            spam: { severity: 'medium', weight: 0.5 },
            scanner: { severity: 'medium', weight: 0.6 },
            tor: { severity: 'low', weight: 0.3 },
            proxy: { severity: 'low', weight: 0.2 }
        };
        
        this.initializeThreatFeeds();
        this.loadLocalThreatData();
    }
    
    initializeThreatFeeds() {
        // Configurar feeds de threat intelligence
        // Em produção, estes seriam feeds reais como AbuseIPDB, VirusTotal, etc.
        
        this.threatFeeds.set('malicious_ips', {
            name: 'Malicious IP Database',
            type: 'ip_reputation',
            url: 'https://api.example-threat-feed.com/ips',
            apiKey: process.env.THREAT_INTEL_API_KEY,
            updateInterval: 6 * 60 * 60 * 1000, // 6 horas
            lastUpdate: null,
            enabled: true,
            priority: 'high'
        });
        
        this.threatFeeds.set('malware_domains', {
            name: 'Malware Domain List',
            type: 'domain_reputation',
            url: 'https://api.example-malware-domains.com/domains',
            apiKey: process.env.MALWARE_DOMAIN_API_KEY,
            updateInterval: 12 * 60 * 60 * 1000, // 12 horas
            lastUpdate: null,
            enabled: true,
            priority: 'high'
        });
        
        this.threatFeeds.set('file_hashes', {
            name: 'Malicious File Hashes',
            type: 'hash_reputation',
            url: 'https://api.example-hash-db.com/hashes',
            apiKey: process.env.HASH_DB_API_KEY,
            updateInterval: 24 * 60 * 60 * 1000, // 24 horas
            lastUpdate: null,
            enabled: true,
            priority: 'medium'
        });
        
        this.threatFeeds.set('tor_nodes', {
            name: 'Tor Exit Nodes',
            type: 'ip_reputation',
            url: 'https://check.torproject.org/torbulkexitlist',
            apiKey: null, // Público
            updateInterval: 24 * 60 * 60 * 1000, // 24 horas
            lastUpdate: null,
            enabled: true,
            priority: 'low'
        });
    }
    
    async loadLocalThreatData() {
        // Carregar dados locais de threat intelligence
        // Simulação de dados conhecidos
        
        const knownMaliciousIPs = [
            { ip: '198.51.100.10', category: 'botnet', confidence: 0.95, source: 'local_db' },
            { ip: '203.0.113.45', category: 'scanner', confidence: 0.8, source: 'local_db' },
            { ip: '192.0.2.100', category: 'malware', confidence: 0.9, source: 'local_db' },
            { ip: '198.51.100.25', category: 'phishing', confidence: 0.85, source: 'local_db' },
            { ip: '203.0.113.75', category: 'spam', confidence: 0.7, source: 'local_db' }
        ];
        
        const knownMaliciousDomains = [
            { domain: 'malicious-site.example', category: 'malware', confidence: 0.95, source: 'local_db' },
            { domain: 'phishing-bank.example', category: 'phishing', confidence: 0.9, source: 'local_db' },
            { domain: 'spam-sender.example', category: 'spam', confidence: 0.75, source: 'local_db' }
        ];
        
        const knownMaliciousHashes = [
            { hash: 'a1b2c3d4e5f6789012345678901234567890abcd', category: 'malware', confidence: 0.98, source: 'local_db' },
            { hash: 'fedcba0987654321098765432109876543210fedcb', category: 'trojan', confidence: 0.92, source: 'local_db' }
        ];
        
        // Carregar no cache
        for (const ipData of knownMaliciousIPs) {
            this.ipReputationCache.set(ipData.ip, {
                ...ipData,
                timestamp: new Date(),
                expires: new Date(Date.now() + this.cacheExpiry)
            });
        }
        
        for (const domainData of knownMaliciousDomains) {
            this.domainReputationCache.set(domainData.domain, {
                ...domainData,
                timestamp: new Date(),
                expires: new Date(Date.now() + this.cacheExpiry)
            });
        }
        
        for (const hashData of knownMaliciousHashes) {
            this.hashReputationCache.set(hashData.hash, {
                ...hashData,
                timestamp: new Date(),
                expires: new Date(Date.now() + this.cacheExpiry)
            });
        }
        
        console.log(`📊 Loaded ${knownMaliciousIPs.length} malicious IPs, ${knownMaliciousDomains.length} domains, ${knownMaliciousHashes.length} hashes`);
    }
    
    async checkIPReputation(ip) {
        console.log(`🔍 Checking IP reputation: ${ip}`);
        
        // Verificar cache primeiro
        const cached = this.ipReputationCache.get(ip);
        if (cached && cached.expires > new Date()) {
            console.log(`💾 Cache hit for IP ${ip}: ${cached.category} (${cached.confidence})`);
            return this.formatThreatResult(cached);
        }
        
        // Simular consulta a feeds externos
        const reputation = await this.queryExternalIPFeeds(ip);
        
        if (reputation) {
            // Armazenar no cache
            this.ipReputationCache.set(ip, {
                ...reputation,
                timestamp: new Date(),
                expires: new Date(Date.now() + this.cacheExpiry)
            });
            
            return this.formatThreatResult(reputation);
        }
        
        return null;
    }
    
    async checkDomainReputation(domain) {
        console.log(`🔍 Checking domain reputation: ${domain}`);
        
        const cached = this.domainReputationCache.get(domain);
        if (cached && cached.expires > new Date()) {
            console.log(`💾 Cache hit for domain ${domain}: ${cached.category} (${cached.confidence})`);
            return this.formatThreatResult(cached);
        }
        
        const reputation = await this.queryExternalDomainFeeds(domain);
        
        if (reputation) {
            this.domainReputationCache.set(domain, {
                ...reputation,
                timestamp: new Date(),
                expires: new Date(Date.now() + this.cacheExpiry)
            });
            
            return this.formatThreatResult(reputation);
        }
        
        return null;
    }
    
    async checkHashReputation(hash) {
        console.log(`🔍 Checking hash reputation: ${hash}`);
        
        const cached = this.hashReputationCache.get(hash);
        if (cached && cached.expires > new Date()) {
            console.log(`💾 Cache hit for hash ${hash}: ${cached.category} (${cached.confidence})`);
            return this.formatThreatResult(cached);
        }
        
        const reputation = await this.queryExternalHashFeeds(hash);
        
        if (reputation) {
            this.hashReputationCache.set(hash, {
                ...reputation,
                timestamp: new Date(),
                expires: new Date(Date.now() + this.cacheExpiry)
            });
            
            return this.formatThreatResult(reputation);
        }
        
        return null;
    }
    
    async queryExternalIPFeeds(ip) {
        // Simular consulta a feeds externos
        // Em produção, faria requisições HTTP reais para APIs de threat intelligence
        
        // Simular alguns IPs conhecidos como maliciosos
        const simulatedThreats = {
            '198.51.100.10': { category: 'botnet', confidence: 0.95, source: 'external_feed_1' },
            '203.0.113.45': { category: 'scanner', confidence: 0.8, source: 'external_feed_2' },
            '192.0.2.100': { category: 'malware', confidence: 0.9, source: 'external_feed_1' },
            '10.0.0.1': { category: 'tor', confidence: 0.6, source: 'tor_project' }
        };
        
        // Simular delay de rede
        await this.sleep(100);
        
        return simulatedThreats[ip] || null;
    }
    
    async queryExternalDomainFeeds(domain) {
        // Simular consulta a feeds de domínios maliciosos
        const simulatedThreats = {
            'malicious-site.example': { category: 'malware', confidence: 0.95, source: 'domain_feed_1' },
            'phishing-bank.example': { category: 'phishing', confidence: 0.9, source: 'domain_feed_2' },
            'spam-sender.example': { category: 'spam', confidence: 0.75, source: 'domain_feed_1' }
        };
        
        await this.sleep(150);
        
        return simulatedThreats[domain] || null;
    }
    
    async queryExternalHashFeeds(hash) {
        // Simular consulta a feeds de hashes maliciosos
        const simulatedThreats = {
            'a1b2c3d4e5f6789012345678901234567890abcd': { category: 'malware', confidence: 0.98, source: 'hash_feed_1' },
            'fedcba0987654321098765432109876543210fedcb': { category: 'trojan', confidence: 0.92, source: 'hash_feed_2' }
        };
        
        await this.sleep(200);
        
        return simulatedThreats[hash] || null;
    }
    
    formatThreatResult(reputation) {
        const categoryInfo = this.threatCategories[reputation.category] || 
                           { severity: 'medium', weight: 0.5 };
        
        return {
            isThreat: true,
            category: reputation.category,
            severity: categoryInfo.severity,
            confidence: reputation.confidence,
            weight: categoryInfo.weight,
            source: reputation.source,
            timestamp: reputation.timestamp,
            riskScore: reputation.confidence * categoryInfo.weight
        };
    }
    
    async enrichSecurityEvent(event) {
        console.log(`🔬 Enriching security event with threat intelligence`);
        
        const enrichment = {
            originalEvent: event,
            threatIntelligence: {},
            riskScore: 0,
            threatIndicators: [],
            recommendations: []
        };
        
        // Verificar IP de origem
        const clientIP = event.client_ip || event.clientIP;
        if (clientIP) {
            const ipThreat = await this.checkIPReputation(clientIP);
            if (ipThreat) {
                enrichment.threatIntelligence.ip = ipThreat;
                enrichment.riskScore += ipThreat.riskScore;
                enrichment.threatIndicators.push(`Malicious IP: ${clientIP} (${ipThreat.category})`);
                enrichment.recommendations.push(`Block IP ${clientIP} - Known ${ipThreat.category}`);
            }
        }
        
        // Verificar domínios mencionados
        const domains = this.extractDomains(event);
        for (const domain of domains) {
            const domainThreat = await this.checkDomainReputation(domain);
            if (domainThreat) {
                enrichment.threatIntelligence.domains = enrichment.threatIntelligence.domains || [];
                enrichment.threatIntelligence.domains.push({ domain, threat: domainThreat });
                enrichment.riskScore += domainThreat.riskScore * 0.8; // Peso menor que IP
                enrichment.threatIndicators.push(`Malicious domain: ${domain} (${domainThreat.category})`);
                enrichment.recommendations.push(`Block domain ${domain} - Known ${domainThreat.category}`);
            }
        }
        
        // Verificar hashes de arquivos
        const hashes = this.extractHashes(event);
        for (const hash of hashes) {
            const hashThreat = await this.checkHashReputation(hash);
            if (hashThreat) {
                enrichment.threatIntelligence.hashes = enrichment.threatIntelligence.hashes || [];
                enrichment.threatIntelligence.hashes.push({ hash, threat: hashThreat });
                enrichment.riskScore += hashThreat.riskScore;
                enrichment.threatIndicators.push(`Malicious file: ${hash} (${hashThreat.category})`);
                enrichment.recommendations.push(`Quarantine file with hash ${hash} - Known ${hashThreat.category}`);
            }
        }
        
        // Calcular severidade final baseada no risk score
        enrichment.finalSeverity = this.calculateFinalSeverity(enrichment.riskScore, event.severity);
        
        // Adicionar contexto adicional
        enrichment.context = await this.addThreatContext(enrichment);
        
        console.log(`📊 Enrichment complete - Risk Score: ${enrichment.riskScore.toFixed(3)}, Indicators: ${enrichment.threatIndicators.length}`);
        
        return enrichment;
    }
    
    extractDomains(event) {
        const domains = [];
        const text = JSON.stringify(event).toLowerCase();
        
        // Regex simples para extrair domínios
        const domainRegex = /([a-z0-9-]+\.)+[a-z]{2,}/g;
        const matches = text.match(domainRegex);
        
        if (matches) {
            domains.push(...matches.filter(domain => 
                !domain.includes('localhost') && 
                !domain.includes('127.0.0.1') &&
                domain.length > 4
            ));
        }
        
        return [...new Set(domains)]; // Remove duplicatas
    }
    
    extractHashes(event) {
        const hashes = [];
        const text = JSON.stringify(event);
        
        // Regex para diferentes tipos de hash
        const hashRegexes = [
            /\b[a-f0-9]{32}\b/gi, // MD5
            /\b[a-f0-9]{40}\b/gi, // SHA1
            /\b[a-f0-9]{64}\b/gi  // SHA256
        ];
        
        for (const regex of hashRegexes) {
            const matches = text.match(regex);
            if (matches) {
                hashes.push(...matches);
            }
        }
        
        return [...new Set(hashes)];
    }
    
    calculateFinalSeverity(riskScore, originalSeverity) {
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        const originalLevel = severityLevels[originalSeverity] || 1;
        
        let finalLevel = originalLevel;
        
        // Aumentar severidade baseado no risk score
        if (riskScore >= 0.9) {
            finalLevel = Math.max(finalLevel, 4); // Critical
        } else if (riskScore >= 0.7) {
            finalLevel = Math.max(finalLevel, 3); // High
        } else if (riskScore >= 0.5) {
            finalLevel = Math.max(finalLevel, 2); // Medium
        }
        
        const levelNames = ['', 'low', 'medium', 'high', 'critical'];
        return levelNames[finalLevel];
    }
    
    async addThreatContext(enrichment) {
        const context = {
            attackPatterns: [],
            mitreTactics: [],
            geolocation: null,
            historicalActivity: null
        };
        
        // Identificar padrões de ataque baseado nos indicadores
        if (enrichment.threatIndicators.some(i => i.includes('botnet'))) {
            context.attackPatterns.push('Botnet Activity');
            context.mitreTactics.push('Command and Control');
        }
        
        if (enrichment.threatIndicators.some(i => i.includes('scanner'))) {
            context.attackPatterns.push('Network Reconnaissance');
            context.mitreTactics.push('Discovery');
        }
        
        if (enrichment.threatIndicators.some(i => i.includes('phishing'))) {
            context.attackPatterns.push('Phishing Campaign');
            context.mitreTactics.push('Initial Access');
        }
        
        if (enrichment.threatIndicators.some(i => i.includes('malware'))) {
            context.attackPatterns.push('Malware Distribution');
            context.mitreTactics.push('Execution', 'Persistence');
        }
        
        return context;
    }
    
    async updateThreatFeeds() {
        console.log('🔄 Updating threat intelligence feeds...');
        
        for (const [feedId, feed] of this.threatFeeds) {
            if (!feed.enabled) continue;
            
            const shouldUpdate = !feed.lastUpdate || 
                               (Date.now() - feed.lastUpdate.getTime()) > feed.updateInterval;
            
            if (shouldUpdate) {
                try {
                    console.log(`📡 Updating feed: ${feed.name}`);
                    await this.updateSingleFeed(feedId, feed);
                    feed.lastUpdate = new Date();
                } catch (error) {
                    console.error(`❌ Failed to update feed ${feed.name}:`, error.message);
                }
            }
        }
        
        console.log('✅ Threat feed update completed');
    }
    
    async updateSingleFeed(feedId, feed) {
        // Simular atualização de feed
        // Em produção, faria requisições HTTP para APIs reais
        
        console.log(`   Fetching data from ${feed.url}`);
        await this.sleep(500); // Simular delay de rede
        
        // Simular dados atualizados
        const mockData = {
            records: Math.floor(Math.random() * 1000) + 100,
            newThreats: Math.floor(Math.random() * 50)
        };
        
        console.log(`   Updated ${feed.name}: ${mockData.records} records, ${mockData.newThreats} new threats`);
    }
    
    // Métodos de utilidade e relatórios
    getThreatStats() {
        return {
            ipCache: {
                total: this.ipReputationCache.size,
                malicious: Array.from(this.ipReputationCache.values()).length
            },
            domainCache: {
                total: this.domainReputationCache.size,
                malicious: Array.from(this.domainReputationCache.values()).length
            },
            hashCache: {
                total: this.hashReputationCache.size,
                malicious: Array.from(this.hashReputationCache.values()).length
            },
            feeds: {
                total: this.threatFeeds.size,
                enabled: Array.from(this.threatFeeds.values()).filter(f => f.enabled).length
            }
        };
    }
    
    getTopThreats(limit = 10) {
        const allThreats = [];
        
        // Coletar de todos os caches
        for (const [ip, data] of this.ipReputationCache) {
            allThreats.push({ type: 'ip', value: ip, ...data });
        }
        
        for (const [domain, data] of this.domainReputationCache) {
            allThreats.push({ type: 'domain', value: domain, ...data });
        }
        
        for (const [hash, data] of this.hashReputationCache) {
            allThreats.push({ type: 'hash', value: hash, ...data });
        }
        
        // Ordenar por confidence e retornar top N
        return allThreats
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, limit);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
const threatIntelligence = new ThreatIntelligenceSystem();

const threatIntelligence$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: threatIntelligence
}, Symbol.toStringTag, { value: 'Module' }));

export { AISecurityEngine as A, sendEmail as a, logBotDetection as b, logSpamAttempt as c, generateSecurityReport as d, getSecurityStats as g, logAIThreat as l, mysqlSecurityLogger as m, rateLimit as r, securityLogger as s, validateInput as v };
