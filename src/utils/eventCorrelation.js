/**
 * Sistema de Correlação de Eventos de Segurança
 * Detecta ataques multi-etapas e padrões suspeitos complexos
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            const { default: realTimeAlerts } = await import('./realTimeAlerts.js');
            await realTimeAlerts.processCorrelationAlert(attackPattern);
        } catch (error) {
            console.warn('⚠️ Could not send correlation alert:', error.message);
        }
        
        // Log para MySQL se disponível
        try {
            const { default: mysqlLogger } = await import('./mysqlSecurityLogger.js');
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
export default eventCorrelation;