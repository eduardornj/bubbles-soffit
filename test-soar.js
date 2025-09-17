/**
 * Teste do Sistema SOAR (Security Orchestration, Automation and Response)
 * Simula diferentes tipos de incidentes de segurança e testa as respostas automatizadas
 */

import soarSystem from './src/utils/soarSystem.js';

async function testSOARSystem() {
    console.log('🚀 Iniciando testes do Sistema SOAR\n');
    
    // Teste 1: Ataque de Brute Force
    console.log('=== TESTE 1: Brute Force Attack ===');
    await soarSystem.processIncident({
        type: 'brute_force_escalation',
        severity: 'high',
        clientIP: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        message: 'Multiple failed login attempts detected',
        details: {
            failed_attempts: 15,
            target_user: 'admin',
            time_window: '5 minutes',
            attack_pattern: 'dictionary_attack'
        },
        timestamp: new Date(),
        confidence: 0.9
    });
    
    await sleep(2000);
    
    // Teste 2: SQL Injection
    console.log('\n=== TESTE 2: SQL Injection Attack ===');
    await soarSystem.processIncident({
        type: 'sql_injection_chain',
        severity: 'critical',
        clientIP: '10.0.0.50',
        userAgent: 'sqlmap/1.6.12',
        message: 'SQL injection attack detected with database compromise',
        details: {
            injection_type: 'union_based',
            affected_tables: ['users', 'admin_accounts'],
            payload: "' UNION SELECT username,password FROM users--",
            database_accessed: true
        },
        timestamp: new Date(),
        confidence: 0.95
    });
    
    await sleep(2000);
    
    // Teste 3: Web Shell Upload
    console.log('\n=== TESTE 3: Web Shell Upload ===');
    await soarSystem.processIncident({
        type: 'web_shell_upload',
        severity: 'critical',
        clientIP: '172.16.0.25',
        userAgent: 'curl/7.68.0',
        message: 'Suspicious file upload detected - potential web shell',
        details: {
            uploaded_file: '/uploads/shell.php',
            file_size: 2048,
            suspicious_functions: ['exec', 'system', 'shell_exec'],
            suspicious_files: ['/uploads/shell.php', '/tmp/backdoor.php']
        },
        timestamp: new Date(),
        confidence: 0.88
    });
    
    await sleep(2000);
    
    // Teste 4: Data Exfiltration
    console.log('\n=== TESTE 4: Data Exfiltration ===');
    await soarSystem.processIncident({
        type: 'data_exfiltration',
        severity: 'critical',
        clientIP: '203.0.113.45',
        userAgent: 'wget/1.20.3',
        message: 'Large data transfer detected - potential data exfiltration',
        details: {
            data_volume: '500MB',
            transfer_duration: '10 minutes',
            destination: 'external_server.com',
            sensitive_data: true,
            file_types: ['database_dump.sql', 'customer_data.csv']
        },
        timestamp: new Date(),
        confidence: 0.92
    });
    
    await sleep(2000);
    
    // Teste 5: Incidente de Severidade Crítica (Generic)
    console.log('\n=== TESTE 5: Generic Critical Incident ===');
    await soarSystem.processIncident({
        type: 'unknown_critical_event',
        severity: 'critical',
        clientIP: '198.51.100.10',
        userAgent: 'Unknown/1.0',
        message: 'Unknown critical security event detected',
        details: {
            anomaly_score: 0.95,
            affected_systems: ['web_server', 'database'],
            indicators: ['unusual_network_traffic', 'privilege_escalation']
        },
        timestamp: new Date(),
        confidence: 0.85
    });
    
    await sleep(3000);
    
    // Teste 6: Múltiplos incidentes do mesmo IP (teste de cooldown)
    console.log('\n=== TESTE 6: Multiple Incidents from Same IP (Cooldown Test) ===');
    const testIP = '192.168.1.200';
    
    // Primeiro incidente
    await soarSystem.processIncident({
        type: 'brute_force_escalation',
        severity: 'high',
        clientIP: testIP,
        userAgent: 'AttackTool/1.0',
        message: 'First brute force attempt',
        details: { attempt: 1 },
        timestamp: new Date(),
        confidence: 0.8
    });
    
    await sleep(1000);
    
    // Segundo incidente (deve estar em cooldown)
    await soarSystem.processIncident({
        type: 'brute_force_escalation',
        severity: 'high',
        clientIP: testIP,
        userAgent: 'AttackTool/1.0',
        message: 'Second brute force attempt (should be in cooldown)',
        details: { attempt: 2 },
        timestamp: new Date(),
        confidence: 0.8
    });
    
    await sleep(2000);
    
    // Exibir estatísticas finais
    console.log('\n=== ESTATÍSTICAS FINAIS DO SOAR ===');
    const stats = soarSystem.getIncidentStats();
    console.log('📊 Estatísticas de Incidentes:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Ativos: ${stats.active}`);
    console.log(`   Processados: ${stats.processed}`);
    console.log('\n📈 Por Severidade:');
    console.log(`   Críticos: ${stats.bySeverity.critical}`);
    console.log(`   Altos: ${stats.bySeverity.high}`);
    console.log(`   Médios: ${stats.bySeverity.medium}`);
    console.log(`   Baixos: ${stats.bySeverity.low}`);
    
    // Exibir incidentes recentes
    console.log('\n=== INCIDENTES RECENTES ===');
    const recentIncidents = soarSystem.getRecentIncidents(5);
    recentIncidents.forEach((incident, index) => {
        console.log(`${index + 1}. ${incident.type} - ${incident.severity} - ${incident.clientIP} - ${incident.status}`);
        console.log(`   Playbook: ${incident.playbook}`);
        console.log(`   Steps: ${incident.steps.length} executed`);
        console.log(`   Duration: ${incident.endTime ? 
            Math.round((incident.endTime - incident.startTime) / 1000) + 's' : 'ongoing'}`);
        console.log('');
    });
    
    console.log('✅ Teste do Sistema SOAR concluído com sucesso!');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar testes
testSOARSystem().catch(console.error);