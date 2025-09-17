import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: 'bubbles_enterprise'
};

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Verificando estrutura da tabela chat_conversations:');
    const [rows] = await connection.execute('DESCRIBE chat_conversations');
    
    console.log('\n📋 Campos da tabela:');
    rows.forEach(row => {
      console.log(`- ${row.Field}: ${row.Type} (${row.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    console.log('\n📊 Dados de exemplo:');
    const [data] = await connection.execute('SELECT id, session_id, client_name, client_email, client_phone, client_address, client_problem, status FROM chat_conversations LIMIT 3');
    
    data.forEach(row => {
      console.log(`ID: ${row.id}, Nome: ${row.client_name || 'N/A'}, Email: ${row.client_email || 'N/A'}, Telefone: ${row.client_phone || 'N/A'}, Status: ${row.status}`);
    });
    
    await connection.end();
    console.log('\n✅ Verificação concluída');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkTableStructure();