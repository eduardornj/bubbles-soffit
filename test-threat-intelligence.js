/**
 * Teste do Sistema de Threat Intelligence
 * Demonstra a detecção e enriquecimento de eventos com dados de ameaças conhecidas
 */

import threatIntelligence from './src/utils/threatIntelligence.js';

async function testThreatIntelligence() {
    console.log('🔬 === TESTE DO SISTEMA DE THREAT INTELLIGENCE ===\n');
    
    // Aguardar inicialização
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📊 Estatísticas iniciais:');
    const initialStats = threatIntelligence.getThreatStats();
    console.log(JSON.stringify(initialStats, null, 2));
    console.log();
    
    // Teste 1: Verificação de IP malicioso conhecido
    console.log('🧪 TESTE 1: Verificação de IP malicioso conhecido');
    console.log('=' .repeat(50));
    
    const maliciousIP = '198.51.100.10';
    const ipResult = await threatIntelligence.checkIPReputation(maliciousIP);
    
    if (ipResult) {
        console.log(`✅ IP ${maliciousIP} identificado como ameaça:`);
        console.log(`   Categoria: ${ipResult.category}`);
        console.log(`   Severidade: ${ipResult.severity}`);
        console.log(`   Confiança: ${ipResult.confidence}`);
        console.log(`   Risk Score: ${ipResult.riskScore}`);
        console.log(`   Fonte: ${ipResult.source}`);
    } else {
        console.log(`❌ IP ${maliciousIP} não encontrado como ameaça`);
    }
    console.log();
    
    // Teste 2: Verificação de IP limpo
    console.log('🧪 TESTE 2: Verificação de IP limpo');
    console.log('=' .repeat(50));
    
    const cleanIP = '8.8.8.8';
    const cleanResult = await threatIntelligence.checkIPReputation(cleanIP);
    
    if (cleanResult) {
        console.log(`⚠️ IP ${cleanIP} identificado como ameaça (falso positivo?)`);
    } else {
        console.log(`✅ IP ${cleanIP} está limpo`);
    }
    console.log();
    
    // Teste 3: Verificação de domínio malicioso
    console.log('🧪 TESTE 3: Verificação de domínio malicioso');
    console.log('=' .repeat(50));
    
    const maliciousDomain = 'malicious-site.example';
    const domainResult = await threatIntelligence.checkDomainReputation(maliciousDomain);
    
    if (domainResult) {
        console.log(`✅ Domínio ${maliciousDomain} identificado como ameaça:`);
        console.log(`   Categoria: ${domainResult.category}`);
        console.log(`   Severidade: ${domainResult.severity}`);
        console.log(`   Confiança: ${domainResult.confidence}`);
        console.log(`   Risk Score: ${domainResult.riskScore}`);
    } else {
        console.log(`❌ Domínio ${maliciousDomain} não encontrado como ameaça`);
    }
    console.log();
    
    // Teste 4: Verificação de hash malicioso
    console.log('🧪 TESTE 4: Verificação de hash malicioso');
    console.log('=' .repeat(50));
    
    const maliciousHash = 'a1b2c3d4e5f6789012345678901234567890abcd';
    const hashResult = await threatIntelligence.checkHashReputation(maliciousHash);
    
    if (hashResult) {
        console.log(`✅ Hash ${maliciousHash} identificado como ameaça:`);
        console.log(`   Categoria: ${hashResult.category}`);
        console.log(`   Severidade: ${hashResult.severity}`);
        console.log(`   Confiança: ${hashResult.confidence}`);
        console.log(`   Risk Score: ${hashResult.riskScore}`);
    } else {
        console.log(`❌ Hash ${maliciousHash} não encontrado como ameaça`);
    }
    console.log();
    
    // Teste 5: Enriquecimento de evento de segurança simples
    console.log('🧪 TESTE 5: Enriquecimento de evento simples');
    console.log('=' .repeat(50));
    
    const simpleEvent = {
        type: 'login_attempt',
        severity: 'medium',
        client_ip: '203.0.113.45', // IP scanner conhecido
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        message: 'Failed login attempt',
        timestamp: new Date(),
        details: {
            username: 'admin',
            attempts: 5
        }
    };
    
    const enrichedSimple = await threatIntelligence.enrichSecurityEvent(simpleEvent);
    
    console.log(`📊 Evento original: ${simpleEvent.type} (${simpleEvent.severity})`);
    console.log(`📈 Risk Score: ${enrichedSimple.riskScore.toFixed(3)}`);
    console.log(`🎯 Indicadores encontrados: ${enrichedSimple.threatIndicators.length}`);
    
    if (enrichedSimple.threatIndicators.length > 0) {
        enrichedSimple.threatIndicators.forEach(indicator => {
            console.log(`   • ${indicator}`);
        });
        
        console.log(`📋 Recomendações:`);
        enrichedSimple.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
        });
        
        console.log(`🔍 Contexto:`);
        if (enrichedSimple.context.attackPatterns.length > 0) {
            console.log(`   Padrões de ataque: ${enrichedSimple.context.attackPatterns.join(', ')}`);
        }
        if (enrichedSimple.context.mitreTactics.length > 0) {
            console.log(`   MITRE ATT&CK: ${enrichedSimple.context.mitreTactics.join(', ')}`);
        }
    }
    console.log();
    
    // Teste 6: Enriquecimento de evento complexo com múltiplas ameaças
    console.log('🧪 TESTE 6: Enriquecimento de evento complexo');
    console.log('=' .repeat(50));
    
    const complexEvent = {
        type: 'file_upload',
        severity: 'low',
        client_ip: '192.0.2.100', // IP malware conhecido
        user_agent: 'curl/7.68.0',
        message: 'Suspicious file upload detected',
        timestamp: new Date(),
        details: {
            filename: 'malware.exe',
            filesize: 1024000,
            hash: 'a1b2c3d4e5f6789012345678901234567890abcd', // Hash malicioso conhecido
            destination: '/uploads/',
            referrer: 'https://phishing-bank.example/download', // Domínio malicioso
            upload_path: '/var/www/uploads/malware.exe'
        }
    };
    
    const enrichedComplex = await threatIntelligence.enrichSecurityEvent(complexEvent);
    
    console.log(`📊 Evento original: ${complexEvent.type} (${complexEvent.severity})`);
    console.log(`📈 Risk Score: ${enrichedComplex.riskScore.toFixed(3)}`);
    console.log(`🔥 Severidade final: ${enrichedComplex.finalSeverity}`);
    console.log(`🎯 Indicadores encontrados: ${enrichedComplex.threatIndicators.length}`);
    
    if (enrichedComplex.threatIndicators.length > 0) {
        console.log(`\n🚨 AMEAÇAS DETECTADAS:`);
        enrichedComplex.threatIndicators.forEach((indicator, index) => {
            console.log(`   ${index + 1}. ${indicator}`);
        });
        
        console.log(`\n📋 RECOMENDAÇÕES DE RESPOSTA:`);
        enrichedComplex.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
        
        console.log(`\n🔍 CONTEXTO DE AMEAÇA:`);
        if (enrichedComplex.context.attackPatterns.length > 0) {
            console.log(`   Padrões de ataque: ${enrichedComplex.context.attackPatterns.join(', ')}`);
        }
        if (enrichedComplex.context.mitreTactics.length > 0) {
            console.log(`   MITRE ATT&CK Tactics: ${enrichedComplex.context.mitreTactics.join(', ')}`);
        }
        
        // Mostrar detalhes das ameaças encontradas
        if (enrichedComplex.threatIntelligence.ip) {
            console.log(`\n🌐 Threat Intelligence - IP:`);
            console.log(`   IP: ${complexEvent.client_ip}`);
            console.log(`   Categoria: ${enrichedComplex.threatIntelligence.ip.category}`);
            console.log(`   Confiança: ${enrichedComplex.threatIntelligence.ip.confidence}`);
            console.log(`   Fonte: ${enrichedComplex.threatIntelligence.ip.source}`);
        }
        
        if (enrichedComplex.threatIntelligence.domains) {
            console.log(`\n🌍 Threat Intelligence - Domínios:`);
            enrichedComplex.threatIntelligence.domains.forEach(domainInfo => {
                console.log(`   Domínio: ${domainInfo.domain}`);
                console.log(`   Categoria: ${domainInfo.threat.category}`);
                console.log(`   Confiança: ${domainInfo.threat.confidence}`);
            });
        }
        
        if (enrichedComplex.threatIntelligence.hashes) {
            console.log(`\n🔐 Threat Intelligence - Hashes:`);
            enrichedComplex.threatIntelligence.hashes.forEach(hashInfo => {
                console.log(`   Hash: ${hashInfo.hash}`);
                console.log(`   Categoria: ${hashInfo.threat.category}`);
                console.log(`   Confiança: ${hashInfo.threat.confidence}`);
            });
        }
    }
    console.log();
    
    // Teste 7: Cache e performance
    console.log('🧪 TESTE 7: Teste de cache e performance');
    console.log('=' .repeat(50));
    
    console.log('🔄 Primeira consulta (sem cache):');
    const start1 = Date.now();
    await threatIntelligence.checkIPReputation('198.51.100.10');
    const time1 = Date.now() - start1;
    console.log(`   Tempo: ${time1}ms`);
    
    console.log('🔄 Segunda consulta (com cache):');
    const start2 = Date.now();
    await threatIntelligence.checkIPReputation('198.51.100.10');
    const time2 = Date.now() - start2;
    console.log(`   Tempo: ${time2}ms`);
    
    console.log(`📊 Melhoria de performance: ${((time1 - time2) / time1 * 100).toFixed(1)}%`);
    console.log();
    
    // Teste 8: Top ameaças
    console.log('🧪 TESTE 8: Top ameaças conhecidas');
    console.log('=' .repeat(50));
    
    const topThreats = threatIntelligence.getTopThreats(5);
    console.log(`🏆 Top ${topThreats.length} ameaças por confiança:`);
    
    topThreats.forEach((threat, index) => {
        console.log(`   ${index + 1}. ${threat.type.toUpperCase()}: ${threat.value}`);
        console.log(`      Categoria: ${threat.category} | Confiança: ${threat.confidence} | Fonte: ${threat.source}`);
    });
    console.log();
    
    // Teste 9: Simulação de atualização de feeds
    console.log('🧪 TESTE 9: Atualização de feeds de threat intelligence');
    console.log('=' .repeat(50));
    
    console.log('🔄 Simulando atualização de feeds...');
    await threatIntelligence.updateThreatFeeds();
    console.log();
    
    // Estatísticas finais
    console.log('📊 ESTATÍSTICAS FINAIS:');
    console.log('=' .repeat(50));
    
    const finalStats = threatIntelligence.getThreatStats();
    console.log(`🌐 IPs maliciosos em cache: ${finalStats.ipCache.malicious}`);
    console.log(`🌍 Domínios maliciosos em cache: ${finalStats.domainCache.malicious}`);
    console.log(`🔐 Hashes maliciosos em cache: ${finalStats.hashCache.malicious}`);
    console.log(`📡 Feeds ativos: ${finalStats.feeds.enabled}/${finalStats.feeds.total}`);
    
    console.log('\n✅ === TESTE DE THREAT INTELLIGENCE CONCLUÍDO ===');
    console.log('\n🔬 O sistema demonstrou capacidade de:');
    console.log('   • Detectar IPs, domínios e hashes maliciosos');
    console.log('   • Enriquecer eventos de segurança com contexto de ameaças');
    console.log('   • Calcular risk scores e escalar severidade automaticamente');
    console.log('   • Fornecer recomendações de resposta baseadas em threat intelligence');
    console.log('   • Mapear ameaças para frameworks como MITRE ATT&CK');
    console.log('   • Utilizar cache para otimizar performance');
    console.log('   • Simular integração com feeds externos de threat intelligence');
}

// Executar teste
testThreatIntelligence().catch(console.error);