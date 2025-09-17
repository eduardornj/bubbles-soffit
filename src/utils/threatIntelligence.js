/**
 * Threat Intelligence Integration System
 * Integra com feeds externos de threat intelligence para enriquecer análises de segurança
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            timestamp: new Date(),
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
export default threatIntelligence;