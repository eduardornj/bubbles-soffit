/**
 * Teste do Sistema de Correlação de Eventos
 * Simula ataques multi-etapas para testar a detecção
 */

import './src/utils/mysqlSecurityLogger.js';
import eventCorrelation from './src/utils/eventCorrelation.js';

async function testEventCorrelation() {
    console.log('🧪 Iniciando teste de correlação de eventos...');
    
    const testIP = '192.168.1.100';
    
    // Simular ataque de reconnaissance -> exploitation
    console.log('\n📡 Simulando ataque: Reconnaissance -> Exploitation');
    
    // Evento 1: Scan 404
    await eventCorrelation.processEvent({
        event_type: '404_ERROR',
        severity: 'medium',
        client_ip: testIP,
        user_agent: 'Mozilla/5.0 (compatible; scanner)',
        message: '404 error on /admin/config.php',
        timestamp: new Date(Date.now() - 300000) // 5 minutos atrás
    });
    
    await sleep(1000);
    
    // Evento 2: Tentativa de acesso admin
    await eventCorrelation.processEvent({
        event_type: 'SUSPICIOUS_ACCESS',
        severity: 'high',
        client_ip: testIP,
        user_agent: 'Mozilla/5.0 (compatible; scanner)',
        message: 'Suspicious access attempt to /wp-admin/admin.php',
        timestamp: new Date(Date.now() - 240000) // 4 minutos atrás
    });
    
    await sleep(1000);
    
    // Evento 3: Tentativa de exploit
    await eventCorrelation.processEvent({
        event_type: 'EXPLOIT_ATTEMPT',
        severity: 'critical',
        client_ip: testIP,
        user_agent: 'Mozilla/5.0 (compatible; scanner)',
        message: 'Exploit payload detected in request',
        timestamp: new Date(Date.now() - 180000) // 3 minutos atrás
    });
    
    await sleep(2000);
    
    // Simular ataque de Brute Force -> Escalation
    console.log('\n🔐 Simulando ataque: Brute Force -> Escalation');
    
    const bruteForceIP = '10.0.0.50';
    
    // Múltiplas tentativas de login falhadas
    for (let i = 0; i < 3; i++) {
        await eventCorrelation.processEvent({
            event_type: 'AUTH_FAILED',
            severity: 'medium',
            client_ip: bruteForceIP,
            user_agent: 'curl/7.68.0',
            message: `Login failed for user admin (attempt ${i + 1})`,
            timestamp: new Date(Date.now() - (120000 - i * 30000)) // Espaçados por 30s
        });
        
        await sleep(500);
    }
    
    // Login bem-sucedido
    await eventCorrelation.processEvent({
        event_type: 'AUTH_SUCCESS',
        severity: 'low',
        client_ip: bruteForceIP,
        user_agent: 'curl/7.68.0',
        message: 'Successful login for user admin',
        timestamp: new Date(Date.now() - 60000) // 1 minuto atrás
    });
    
    await sleep(1000);
    
    // Escalação de privilégios
    await eventCorrelation.processEvent({
        event_type: 'PRIVILEGE_ESCALATION',
        severity: 'critical',
        client_ip: bruteForceIP,
        user_agent: 'curl/7.68.0',
        message: 'Privilege escalation attempt detected: sudo command executed',
        timestamp: new Date(Date.now() - 30000) // 30 segundos atrás
    });
    
    await sleep(2000);
    
    // Simular SQL Injection Chain
    console.log('\n💉 Simulando ataque: SQL Injection Chain');
    
    const sqlIP = '203.0.113.15';
    
    // Tentativa de SQL Injection
    await eventCorrelation.processEvent({
        event_type: 'SQL_INJECTION',
        severity: 'high',
        client_ip: sqlIP,
        user_agent: 'sqlmap/1.6.12',
        message: 'SQL injection attempt detected: UNION SELECT payload',
        timestamp: new Date(Date.now() - 900000) // 15 minutos atrás
    });
    
    await sleep(1000);
    
    // Erro de banco de dados
    await eventCorrelation.processEvent({
        event_type: 'DATABASE_ERROR',
        severity: 'medium',
        client_ip: sqlIP,
        user_agent: 'sqlmap/1.6.12',
        message: 'MySQL error: syntax error near UNION SELECT',
        timestamp: new Date(Date.now() - 840000) // 14 minutos atrás
    });
    
    await sleep(1000);
    
    // Extração de dados
    await eventCorrelation.processEvent({
        event_type: 'DATA_EXTRACTION',
        severity: 'critical',
        client_ip: sqlIP,
        user_agent: 'sqlmap/1.6.12',
        message: 'Large SELECT query executed, potential data dump',
        timestamp: new Date(Date.now() - 780000) // 13 minutos atrás
    });
    
    await sleep(3000);
    
    // Mostrar resultados
    console.log('\n📊 Resultados da Correlação:');
    const attackPatterns = eventCorrelation.getAttackPatterns();
    
    if (attackPatterns.length === 0) {
        console.log('❌ Nenhum padrão de ataque detectado');
    } else {
        attackPatterns.forEach((pattern, index) => {
            console.log(`\n🎯 Padrão ${index + 1}: ${pattern.ruleName}`);
            console.log(`   IP: ${pattern.clientIP}`);
            console.log(`   Severidade: ${pattern.severity}`);
            console.log(`   Confiança: ${(pattern.confidence * 100).toFixed(1)}%`);
            console.log(`   Eventos: ${pattern.events.length}`);
            console.log(`   Duração: ${formatDuration(pattern.endTime - pattern.startTime)}`);
            console.log(`   Descrição: ${pattern.description}`);
        });
    }
    
    // Estatísticas por IP
    console.log('\n📈 Estatísticas por IP:');
    [testIP, bruteForceIP, sqlIP].forEach(ip => {
        const stats = eventCorrelation.getIPStatistics(ip);
        console.log(`\n🌐 IP: ${ip}`);
        console.log(`   Eventos: ${stats.totalEvents}`);
        console.log(`   Padrões de Ataque: ${stats.attackPatterns}`);
        console.log(`   Score de Risco: ${stats.riskScore}/100`);
        console.log(`   Última Atividade: ${stats.lastActivity ? stats.lastActivity.toLocaleString() : 'N/A'}`);
    });
    
    console.log('\n✅ Teste de correlação concluído!');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

// Executar teste
testEventCorrelation().catch(console.error);