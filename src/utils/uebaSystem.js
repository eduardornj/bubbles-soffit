/**
 * UEBA - User and Entity Behavior Analytics System
 * Detecta anomalias comportamentais de usuários e entidades através de análise de padrões
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            userProfile.activities = userProfile.activities.slice(-1000);
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
            const { default: realTimeAlerts } = await import('./realTimeAlerts.js');
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
            const { default: mysqlLogger } = await import('./mysqlSecurityLogger.js');
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
export default uebaSystem;