import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Cocacola10',
  database: 'bubbles_enterprise'
};

async function checkLogsTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Verificando tabela logs_error...');
    
    // Verificar se a tabela existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'logs_error'");
    
    if (tables.length === 0) {
      console.log('❌ Tabela logs_error NÃO existe!');
      
      // Verificar outras tabelas de logs
      console.log('\n🔍 Verificando outras tabelas de logs...');
      const [allTables] = await connection.execute("SHOW TABLES");
      console.log('📋 Tabelas disponíveis:');
      allTables.forEach(table => {
        const tableName = Object.values(table)[0];
        if (tableName.includes('log') || tableName.includes('error')) {
          console.log(`- ${tableName}`);
        }
      });
      
    } else {
      console.log('✅ Tabela logs_error existe!');
      
      // Verificar estrutura da tabela
      console.log('\n📋 Estrutura da tabela:');
      const [structure] = await connection.execute('DESCRIBE logs_error');
      structure.forEach(field => {
        console.log(`- ${field.Field}: ${field.Type}`);
      });
      
      // Contar registros
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM logs_error');
      console.log(`\n📊 Total de registros: ${count[0].total}`);
      
      if (count[0].total > 0) {
        // Mostrar alguns exemplos
        console.log('\n📝 Exemplos de registros:');
        const [examples] = await connection.execute('SELECT * FROM logs_error LIMIT 5');
        examples.forEach((row, index) => {
          console.log(`${index + 1}. Erro ${row.error_code} - ${row.requested_path} - IP: ${row.client_ip} - ${row.timestamp}`);
        });
      } else {
        console.log('\n⚠️ A tabela existe mas está vazia!');
      }
    }
    
    await connection.end();
    console.log('\n✅ Verificação concluída');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkLogsTable();