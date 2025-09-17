import mysql from 'mysql2/promise';

async function checkIPData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Cocacola10',
    database: 'bubbles_enterprise'
  });

  try {
    console.log('🔍 Verificando dados de IP na tabela logs_error...\n');

    // Verificar estrutura da tabela
    console.log('📋 Estrutura da tabela logs_error:');
    const [structure] = await connection.execute('DESCRIBE logs_error');
    structure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n📊 Análise dos dados de IP:');

    // Contar registros por tipo de IP
    const [ipStats] = await connection.execute(`
      SELECT 
        CASE 
          WHEN client_ip IS NULL THEN 'NULL'
          WHEN client_ip = '' THEN 'EMPTY'
          WHEN client_ip = 'Unknown' THEN 'UNKNOWN'
          ELSE 'VALID'
        END as ip_type,
        COUNT(*) as count
      FROM logs_error 
      GROUP BY ip_type
      ORDER BY count DESC
    `);

    ipStats.forEach(stat => {
      console.log(`  - ${stat.ip_type}: ${stat.count} registros`);
    });

    // Mostrar exemplos de IPs únicos
    console.log('\n🌐 Exemplos de IPs únicos:');
    const [uniqueIPs] = await connection.execute(`
      SELECT DISTINCT client_ip, COUNT(*) as count
      FROM logs_error 
      WHERE client_ip IS NOT NULL AND client_ip != ''
      GROUP BY client_ip
      ORDER BY count DESC
      LIMIT 10
    `);

    uniqueIPs.forEach(ip => {
      console.log(`  - ${ip.client_ip || 'NULL'}: ${ip.count} ocorrências`);
    });

    // Verificar registros recentes com detalhes
    console.log('\n📝 Últimos 5 registros com detalhes de IP:');
    const [recentLogs] = await connection.execute(`
      SELECT id, timestamp, client_ip, requested_path, user_agent, method
      FROM logs_error 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);

    recentLogs.forEach(log => {
      console.log(`  - ID: ${log.id}`);
      console.log(`    Timestamp: ${log.timestamp}`);
      console.log(`    IP: ${log.client_ip || 'NULL'}`);
      console.log(`    Path: ${log.requested_path || 'NULL'}`);
      console.log(`    Method: ${log.method || 'NULL'}`);
      console.log(`    User Agent: ${log.user_agent ? log.user_agent.substring(0, 50) + '...' : 'NULL'}`);
      console.log('');
    });

    // Verificar se há algum padrão nos IPs nulos
    console.log('🔍 Análise de padrões em IPs nulos/vazios:');
    const [nullIPAnalysis] = await connection.execute(`
      SELECT 
        method,
        COUNT(*) as count,
        MIN(timestamp) as first_occurrence,
        MAX(timestamp) as last_occurrence
      FROM logs_error 
      WHERE client_ip IS NULL OR client_ip = '' OR client_ip = 'Unknown'
      GROUP BY method
      ORDER BY count DESC
    `);

    nullIPAnalysis.forEach(analysis => {
      console.log(`  - Método ${analysis.method || 'NULL'}: ${analysis.count} registros`);
      console.log(`    Primeiro: ${analysis.first_occurrence}`);
      console.log(`    Último: ${analysis.last_occurrence}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar dados de IP:', error);
  } finally {
    await connection.end();
    console.log('\n✅ Verificação concluída!');
  }
}

checkIPData();