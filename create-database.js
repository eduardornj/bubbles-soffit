import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function createDatabase() {
  try {
    console.log('🔧 Criando banco de dados MySQL...');
    
    // Conectar ao MySQL sem especificar database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.MYSQL_PASSWORD || ''
    });
    
    console.log('✅ Conectado ao MySQL');
    
    // Criar database
    await connection.execute('CREATE DATABASE IF NOT EXISTS bubbles_enterprise');
    console.log('✅ Database "bubbles_enterprise" criado com sucesso');
    
    await connection.end();
    
    // Conectar novamente especificando o database
    const dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: 'bubbles_enterprise'
    });
    
    console.log('✅ Conectado ao database bubbles_enterprise');
    
    // Criar tabela de conversas
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        client_email VARCHAR(255),
        client_name VARCHAR(255),
        client_phone VARCHAR(255),
        client_address TEXT,
        client_problem TEXT,
        messages LONGTEXT,
        is_expanded BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_session_id (session_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('✅ Tabela "chat_conversations" criada com sucesso');
    
    // Verificar se há dados
    const [rows] = await dbConnection.execute('SELECT COUNT(*) as count FROM chat_conversations');
    console.log(`📊 Total de conversas no banco: ${rows[0].count}`);
    
    await dbConnection.end();
    console.log('✅ Configuração do banco de dados concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao criar banco de dados:', error);
    process.exit(1);
  }
}

createDatabase();