/**
 * Teste do Sistema UEBA (User and Entity Behavior Analytics)
 * Simula diferentes padrões de comportamento de usuários e testa a detecção de anomalias
 */

import uebaSystem from './src/utils/uebaSystem.js';

async function testUEBASystem() {
    console.log('🚀 Iniciando testes do Sistema UEBA\n');
    
    // Simular período de aprendizado para usuário normal
    console.log('=== FASE 1: Período de Aprendizado - Usuário Normal ===');
    const normalUser = 'user_john_doe';
    
    // Simular atividades normais durante horário comercial
    for (let i = 0; i < 50; i++) {
        const hour = 9 + (i % 8); // Horário comercial 9h-17h
        const activity = {
            userId: normalUser,
            type: 'web_access',
            client_ip: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            path: i % 3 === 0 ? '/dashboard' : i % 3 === 1 ? '/reports' : '/profile',
            method: 'GET',
            status: 200,
            timestamp: new Date(Date.now() - (50 - i) * 60 * 60 * 1000 + hour * 60 * 60 * 1000)
        };
        
        await uebaSystem.processActivity(activity);
    }
    
    console.log(`✅ Período de aprendizado concluído para ${normalUser}`);
    await sleep(1000);
    
    // Teste 1: Atividade normal (não deve gerar anomalia)
    console.log('\n=== TESTE 1: Atividade Normal ===');
    await uebaSystem.processActivity({
        userId: normalUser,
        type: 'web_access',
        client_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        path: '/dashboard',
        method: 'GET',
        status: 200,
        timestamp: new Date()
    });
    
    await sleep(1000);
    
    // Teste 2: Anomalia Temporal (acesso na madrugada)
    console.log('\n=== TESTE 2: Anomalia Temporal - Acesso na Madrugada ===');
    const midnightTime = new Date();
    midnightTime.setHours(2, 30, 0, 0); // 2:30 AM
    
    await uebaSystem.processActivity({
        userId: normalUser,
        type: 'web_access',
        client_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        path: '/admin/users',
        method: 'GET',
        status: 200,
        timestamp: midnightTime
    });
    
    await sleep(1000);
    
    // Teste 3: Anomalia Geográfica (novo país)
    console.log('\n=== TESTE 3: Anomalia Geográfica - Novo País ===');
    await uebaSystem.processActivity({
        userId: normalUser,
        type: 'web_access',
        client_ip: '203.0.113.45', // IP externo simulado
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        path: '/dashboard',
        method: 'GET',
        status: 200,
        timestamp: new Date()
    });
    
    await sleep(1000);
    
    // Teste 4: Anomalia de Dispositivo (User Agent suspeito)
    console.log('\n=== TESTE 4: Anomalia de Dispositivo - User Agent Suspeito ===');
    await uebaSystem.processActivity({
        userId: normalUser,
        type: 'web_access',
        client_ip: '192.168.1.100',
        user_agent: 'curl/7.68.0',
        path: '/api/users',
        method: 'GET',
        status: 200,
        timestamp: new Date()
    });
    
    await sleep(1000);
    
    // Teste 5: Anomalia de Volume (muitas requisições)
    console.log('\n=== TESTE 5: Anomalia de Volume - Rajada de Requisições ===');
    for (let i = 0; i < 15; i++) {
        await uebaSystem.processActivity({
            userId: normalUser,
            type: 'web_access',
            client_ip: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            path: `/api/data/${i}`,
            method: 'GET',
            status: 200,
            timestamp: new Date()
        });
        await sleep(100); // Pequeno delay entre requisições
    }
    
    await sleep(1000);
    
    // Teste 6: Anomalia de Sequência (múltiplas falhas de autenticação)
    console.log('\n=== TESTE 6: Anomalia de Sequência - Falhas de Autenticação ===');
    for (let i = 0; i < 5; i++) {
        await uebaSystem.processActivity({
            userId: normalUser,
            type: 'auth_failure',
            client_ip: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            path: '/login',
            method: 'POST',
            status: 401,
            message: 'Authentication failed',
            timestamp: new Date()
        });
        await sleep(200);
    }
    
    await sleep(1000);
    
    // Teste 7: Usuário Completamente Novo (deve estar em modo de aprendizado)
    console.log('\n=== TESTE 7: Usuário Novo - Modo de Aprendizado ===');
    const newUser = 'user_jane_smith';
    
    await uebaSystem.processActivity({
        userId: newUser,
        type: 'web_access',
        client_ip: '10.0.0.50',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        path: '/welcome',
        method: 'GET',
        status: 200,
        timestamp: new Date()
    });
    
    await sleep(1000);
    
    // Teste 8: Ataque Simulado - Reconhecimento
    console.log('\n=== TESTE 8: Ataque Simulado - Reconhecimento ===');
    const attackerUser = 'attacker_bot';
    
    // Simular reconhecimento com muitos 404s
    const reconPaths = [
        '/admin', '/administrator', '/wp-admin', '/phpmyadmin',
        '/backup', '/config', '/database', '/secret', '/hidden'
    ];
    
    for (const path of reconPaths) {
        await uebaSystem.processActivity({
            userId: attackerUser,
            type: 'web_access',
            client_ip: '198.51.100.10',
            user_agent: 'Mozilla/5.0 (compatible; SecurityScanner/1.0)',
            path: path,
            method: 'GET',
            status: 404,
            timestamp: new Date()
        });
        await sleep(100);
    }
    
    await sleep(2000);
    
    // Exibir estatísticas e relatórios
    console.log('\n=== RELATÓRIOS FINAIS DO UEBA ===');
    
    // Estatísticas gerais
    const stats = uebaSystem.getAnomalyStats();
    console.log('📊 Estatísticas de Anomalias:');
    console.log(`   Total de usuários: ${stats.totalUsers}`);
    console.log(`   Total de anomalias: ${stats.totalAnomalies}`);
    console.log(`   Score de risco médio: ${stats.averageRiskScore.toFixed(3)}`);
    console.log('\n📈 Por Severidade:');
    console.log(`   Críticas: ${stats.bySeverity.critical}`);
    console.log(`   Altas: ${stats.bySeverity.high}`);
    console.log(`   Médias: ${stats.bySeverity.medium}`);
    console.log(`   Baixas: ${stats.bySeverity.low}`);
    
    // Perfis de risco
    console.log('\n=== PERFIS DE RISCO DOS USUÁRIOS ===');
    const riskProfiles = uebaSystem.getUserRiskProfiles(10);
    riskProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.userId}`);
        console.log(`   Score de Risco: ${profile.riskScore.toFixed(3)}`);
        console.log(`   Total de Atividades: ${profile.totalActivities}`);
        console.log(`   Anomalias Detectadas: ${profile.anomaliesCount}`);
        console.log(`   Última Atividade: ${profile.lastActivity?.toISOString() || 'N/A'}`);
        console.log(`   Em Aprendizado: ${profile.isLearning ? 'Sim' : 'Não'}`);
        console.log('');
    });
    
    // Demonstrar análise detalhada de um usuário
    console.log('=== ANÁLISE DETALHADA - Usuário Normal ===');
    const userProfile = uebaSystem.userProfiles.get(normalUser);
    if (userProfile) {
        console.log(`👤 Usuário: ${userProfile.userId}`);
        console.log(`📅 Criado em: ${userProfile.createdAt.toISOString()}`);
        console.log(`📊 Total de atividades: ${userProfile.statistics.totalActivities}`);
        console.log(`⚠️ Anomalias detectadas: ${userProfile.anomalies.length}`);
        console.log(`🎯 Score de risco atual: ${userProfile.statistics.riskScore.toFixed(3)}`);
        
        if (userProfile.anomalies.length > 0) {
            console.log('\n🔍 Últimas anomalias:');
            userProfile.anomalies.slice(-3).forEach((anomaly, index) => {
                console.log(`   ${index + 1}. ${anomaly.type} - ${anomaly.severity}`);
                console.log(`      Score: ${anomaly.anomalyScore.toFixed(3)}`);
                console.log(`      Timestamp: ${anomaly.timestamp.toISOString()}`);
            });
        }
        
        // Mostrar baseline aprendido
        console.log('\n📚 Baseline Comportamental:');
        console.log(`   Horários mais ativos: ${userProfile.baseline.temporal.hours.map((count, hour) => count > 5 ? hour : null).filter(h => h !== null).join(', ')}h`);
        console.log(`   Recursos mais acessados: ${Array.from(userProfile.baseline.resources.paths.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([path]) => path).join(', ')}`);
        console.log(`   IPs conhecidos: ${userProfile.baseline.devices.ips.size}`);
        console.log(`   User Agents conhecidos: ${userProfile.baseline.devices.userAgents.size}`);
    }
    
    console.log('\n✅ Teste do Sistema UEBA concluído com sucesso!');
    console.log('\n💡 O sistema UEBA agora está monitorando comportamentos e detectando anomalias em tempo real.');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar testes
testUEBASystem().catch(console.error);