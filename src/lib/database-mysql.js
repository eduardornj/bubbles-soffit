import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.MYSQL_PASSWORD || '', // Use variável de ambiente ou deixe vazio
  database: 'bubbles_enterprise',
  charset: 'utf8mb4', // Suporte completo para UTF-8
  collation: 'utf8mb4_unicode_ci', // Collation para UTF-8
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

let pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ MySQL connection pool created successfully');
} catch (error) {
  console.error('❌ MySQL connection failed:', error);
  throw error;
}

// Função para inicializar as tabelas
async function initializeTables() {
  try {
    // Criar database se não existir
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.end();
    
    // Criar tabelas
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        client_email VARCHAR(255),
        client_name VARCHAR(255),
        client_phone VARCHAR(50),
        client_address TEXT,
        client_problem TEXT,
        client_ip VARCHAR(45),
        messages LONGTEXT,
        is_expanded BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Adicionar coluna IP se não existir (para tabelas existentes)
    try {
      await pool.execute(`
        ALTER TABLE chat_conversations 
        ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45)
      `);
    } catch (error) {
      // Ignorar erro se coluna já existir
      console.log('Coluna client_ip já existe ou erro ao adicionar:', error.message);
    }
    
    console.log('✅ MySQL tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing MySQL tables:', error);
    throw error;
  }
}

// Operações do banco de dados
export const dbOperations = {
  // Chat conversation operations

  getConversationBySessionId: async (sessionId) => {
    const [rows] = await pool.execute('SELECT * FROM chat_conversations WHERE session_id = ?', [sessionId]);
    return rows[0] || null;
  },

  createConversation: async (conversationData) => {
    const { session_id, client_email, client_name, messages } = conversationData;
    const [result] = await pool.execute(`
      INSERT INTO chat_conversations (session_id, client_email, client_name, messages)
      VALUES (?, ?, ?, ?)
    `, [session_id, client_email, client_name, JSON.stringify(messages)]);
    return result.insertId;
  },

  updateConversation: async (sessionId, conversationData) => {
    const { client_email, client_name, messages, client_phone, client_address, client_problem } = conversationData;
    const [result] = await pool.execute(`
      UPDATE chat_conversations 
      SET client_email = ?, client_name = ?, messages = ?, client_phone = ?, client_address = ?, client_problem = ?,
          updated_at = CURRENT_TIMESTAMP, last_activity = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `, [client_email, client_name, JSON.stringify(messages), client_phone, client_address, client_problem, sessionId]);
    return result;
  },

  saveConversation: async (conversationData) => {
    const { session_id, client_email, client_name, messages, client_phone, client_problem, is_expanded, status } = conversationData;
    console.log('🔍 DEBUG MYSQL - Dados recebidos:', {
      session_id: typeof session_id + ' = ' + session_id,
      client_email: typeof client_email + ' = ' + client_email,
      client_name: typeof client_name + ' = ' + client_name,
      messages: typeof messages + ' = ' + (messages ? messages.substring(0, 50) + '...' : 'null'),
      client_phone: typeof client_phone + ' = ' + client_phone,
      client_problem: typeof client_problem + ' = ' + client_problem,
      is_expanded: typeof is_expanded + ' = ' + is_expanded,
      status: typeof status + ' = ' + status
    });
    
    const [result] = await pool.execute(`
      INSERT INTO chat_conversations (session_id, client_email, client_name, messages, client_phone, client_problem, is_expanded, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      session_id,
      client_email || null,
      client_name || null,
      messages,
      client_phone || null,
      client_problem || null,
      is_expanded ? 1 : 0,
      status
    ]);
    return result.insertId;
  },

  deleteConversation: async (sessionId) => {
    const [result] = await pool.execute('DELETE FROM chat_conversations WHERE session_id = ?', [sessionId]);
    return result;
  },

  updateConversationFields: async (sessionId, updateData) => {
    const { client_name, client_phone, client_email, client_problem, status } = updateData;
    const [result] = await pool.execute(`
      UPDATE chat_conversations 
      SET client_name = ?, client_phone = ?, client_email = ?, client_problem = ?, status = ?,
          updated_at = CURRENT_TIMESTAMP, last_activity = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `, [client_name, client_phone, client_email, client_problem, status, sessionId]);
    return result;
  },

  // Buscar conversas por IP, telefone ou email
  getConversationsByIdentifier: async (identifier) => {
    const [conversations] = await pool.execute(`
      SELECT * FROM chat_conversations 
      WHERE client_ip = ? OR client_phone = ? OR client_email = ?
      ORDER BY created_at DESC
    `, [identifier, identifier, identifier]);
    return conversations;
  },

  // Buscar histórico por múltiplos critérios
  getConversationHistory: async (ip, phone, email) => {
    let query = 'SELECT * FROM chat_conversations WHERE ';
    let params = [];
    let conditions = [];
    
    if (ip) {
      conditions.push('client_ip = ?');
      params.push(ip);
    }
    if (phone) {
      conditions.push('client_phone = ?');
      params.push(phone);
    }
    if (email) {
      conditions.push('client_email = ?');
      params.push(email);
    }
    
    if (conditions.length === 0) {
      return [];
    }
    
    query += conditions.join(' OR ') + ' ORDER BY created_at DESC';
    const [conversations] = await pool.execute(query, params);
    return conversations;
  },

  getConversationStats: async () => {
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM chat_conversations');
    const [activeResult] = await pool.execute('SELECT COUNT(*) as active FROM chat_conversations WHERE status = ?', ['active']);
    const [todayResult] = await pool.execute("SELECT COUNT(*) as today FROM chat_conversations WHERE DATE(created_at) = CURDATE()");
    
    return {
      total: totalResult[0].total,
      active: activeResult[0].active,
      today: todayResult[0].today
    };
  },

  getAllConversations: async (options = {}) => {
    const { page = 1, limit = 10, status = null, search = null, searchType = 'all' } = options;
    const offset = (page - 1) * limit;
    
    console.log('📋 getAllConversations chamada:', { page, limit, offset, status, search, searchType });
    
    try {
      // Construir WHERE clause
      let whereClause = '';
      let params = [];
      
      const conditions = [];
      
      // Filtro por status
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }
      
      // Filtro de busca segmentada
      if (search) {
        const searchTerm = `%${search}%`;
        
        switch (searchType) {
          case 'name':
            conditions.push('client_name LIKE ?');
            params.push(searchTerm);
            break;
          case 'email':
            conditions.push('client_email LIKE ?');
            params.push(searchTerm);
            break;
          case 'phone':
            conditions.push('client_phone LIKE ?');
            params.push(searchTerm);
            break;
          case 'problem':
            conditions.push('client_problem LIKE ?');
            params.push(searchTerm);
            break;
          case 'content':
            conditions.push('messages LIKE ?');
            params.push(searchTerm);
            break;
          case 'all':
          default:
            conditions.push(`(
              client_name LIKE ? OR 
              client_phone LIKE ? OR 
              client_email LIKE ? OR 
              client_address LIKE ? OR 
              client_problem LIKE ? OR 
              messages LIKE ?
            )`);
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            break;
        }
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
      
      // Query principal com paginação - usando valores literais para evitar problemas
      const sql = `
        SELECT 
          id, session_id, client_name, client_phone, client_email, 
          client_address, client_problem, status, is_expanded,
          created_at, updated_at, last_activity, messages
        FROM chat_conversations 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;
      
      console.log('📊 SQL Query:', sql);
      console.log('📊 Params:', params);
      
      const [conversations] = await pool.execute(sql, params);
      
      console.log('✅ Query executada, conversas encontradas:', conversations.length);
      
      // Processar dados no JavaScript
      const processedConversations = conversations.map(conv => ({
        ...conv,
        messages_preview: conv.messages ? conv.messages.substring(0, 200) : '[]',
        message_count: conv.messages ? conv.messages.length : 0
      }));
      
      // Contar total com os mesmos filtros
      const countSql = `SELECT COUNT(*) as total FROM chat_conversations ${whereClause}`;
      const [countResult] = await pool.execute(countSql, params);
      
      return {
        data: processedConversations,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('❌ Erro em getAllConversations:', error);
      throw error;
    }
  }
};

// Inicializar tabelas na importação
initializeTables();

// Export pool para uso direto se necessário
export default pool;

// Graceful shutdown
process.on('exit', async () => {
  if (pool) {
    await pool.end();
    console.log('✅ MySQL connection pool closed');
  }
});

process.on('SIGINT', async () => {
  if (pool) {
    await pool.end();
    console.log('✅ MySQL connection pool closed');
  }
  process.exit(0);
});