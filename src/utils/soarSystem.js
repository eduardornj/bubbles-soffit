/**
 * SOAR - Security Orchestration, Automation and Response System
 * Automatiza respostas a incidentes de segurança baseado em playbooks
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            const { default: mysqlLogger } = await import('./mysqlSecurityLogger.js');
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
            const { default: realTimeAlerts } = await import('./realTimeAlerts.js');
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
            type: 'security_incident',
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
            `,
            timestamp: new Date()
        };
        
        // Em produção, enviaria email/SMS/Slack
        console.log('📨 Admin notification:', notification.subject);
    }
    
    async logIncident(incident) {
        console.log(`📝 Logging incident: ${incident.id}`);
        
        try {
            const { default: mysqlLogger } = await import('./mysqlSecurityLogger.js');
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
            action: 'file_quarantine',
            files: incident.details?.suspicious_files || ['unknown'],
            timestamp: new Date(),
            incidentId: incident.id
        };
        
        console.log('🗂️ Files quarantined:', quarantineAction.files);
    }
    
    async createManualTask(action, incident) {
        console.log(`📋 Creating manual task: ${action}`);
        
        const task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            action,
            incidentId: incident.id,
            status: 'pending',
            createdAt: new Date(),
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
export default soarSystem;