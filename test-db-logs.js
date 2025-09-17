import mysql from 'mysql2/promise';

async function testDatabase() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Cocacola10',
      database: 'bubbles_enterprise'
    });
    
    console.log('✅ Conexão com banco estabelecida');
    
    // Verificar se tabela logs_error existe
    const [tables] = await conn.execute('SHOW TABLES LIKE "logs_error"');
    console.log('📊 Tabela logs_error existe:', tables.length > 0);
    
    if (tables.length > 0) {
      // Contar registros
      const [count] = await conn.execute('SELECT COUNT(*) as total FROM logs_error');
      console.log('📈 Total de registros na tabela:', count[0].total);
      
      // Mostrar alguns registros
      const [sample] = await conn.execute('SELECT * FROM logs_error ORDER BY timestamp DESC LIMIT 5');
      console.log('🔍 Últimos 5 registros:');
      sample.forEach((row, index) => {
        console.log(`  ${index + 1}. [${row.error_code}] ${row.requested_path} - ${row.client_ip} (${row.timestamp})`);
      });
    } else {
      console.log('❌ Tabela logs_error não existe!');
      
      // Mostrar todas as tabelas disponíveis
      const [allTables] = await conn.execute('SHOW TABLES');
      console.log('📋 Tabelas disponíveis:');
      allTables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
    }
    
    await conn.end();
    console.log('✅ Teste concluído');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testDatabase();