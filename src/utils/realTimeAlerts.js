// Real-Time Security Alerts System
import { WebSocketServer } from 'ws';
import mysqlSecurityLogger from './mysqlSecurityLogger.js';
import dotenv from 'dotenv';

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
        const { default: eventCorrelation } = await import('./eventCorrelation.js');
        await eventCorrelation.processEvent(eventData);
      } catch (error) {
        console.warn('⚠️ Event correlation not available:', error.message);
      }
      
      // Processar com sistema SOAR para resposta automatizada
      try {
        const { default: soarSystem } = await import('./soarSystem.js');
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
        const { default: uebaSystem } = await import('./uebaSystem.js');
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
        const threatIntelligence = await import('./threatIntelligence.js');
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

export { realTimeAlerts, RealTimeAlertsSystem };
export default realTimeAlerts;