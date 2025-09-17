import pool from './src/lib/database-mysql.js';

async function checkTable() {
  try {
    const [rows] = await pool.execute('DESCRIBE chat_conversations');
    console.log('Colunas da tabela chat_conversations:');
    rows.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkTable();