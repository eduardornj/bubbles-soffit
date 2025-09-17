import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Cocacola10',
  database: 'bubbles_enterprise'
};

async function debugLogsQuery() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Testando consultas da página de logs...');
    
    // Simular os parâmetros da página (sem filtros)
    const filterErrorCode = '';
    const filterPath = '';
    const filterIP = '';
    const filterSuspicious = '';
    const searchTerm = '';
    const sortBy = 'timestamp';
    const sortOrder = 'DESC';
    const logsPerPage = 50;
    const currentPage = 1;
    
    // Construir query exatamente como na página
    let whereConditions = [];
    let queryParams = [];

    if (filterErrorCode) {
      whereConditions.push('error_code = ?');
      queryParams.push(filterErrorCode);
    }

    if (filterPath) {
      whereConditions.push('requested_path LIKE ?');
      queryParams.push(`%${filterPath}%`);
    }

    if (filterIP) {
      whereConditions.push('client_ip = ?');
      queryParams.push(filterIP);
    }

    if (filterSuspicious) {
      whereConditions.push('is_suspicious = ?');
      queryParams.push(filterSuspicious === 'true' ? 1 : 0);
    }

    if (searchTerm) {
      whereConditions.push('(requested_path LIKE ? OR user_agent LIKE ? OR referer LIKE ?)');
      queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    console.log(`📋 WHERE clause: "${whereClause}"`);
    console.log(`📋 Query params: [${queryParams.join(', ')}]`);

    // Testar contagem
    const countQuery = `SELECT COUNT(*) as total FROM logs_error ${whereClause}`;
    console.log(`\n🔢 Count Query: ${countQuery}`);
    
    const [countResult] = await connection.execute(countQuery, queryParams);
    console.log(`📊 Total encontrado: ${countResult[0].total}`);

    // Testar busca de logs
    const offset = (currentPage - 1) * logsPerPage;
    const logsQuery = `SELECT * FROM logs_error ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    console.log(`\n📝 Logs Query: ${logsQuery}`);
    console.log(`📝 Final params: [${[...queryParams, logsPerPage, offset].join(', ')}]`);
    
    const [logsResult] = await connection.execute(logsQuery, [...queryParams, logsPerPage, offset]);
    console.log(`📊 Logs encontrados: ${logsResult.length}`);
    
    if (logsResult.length > 0) {
      console.log('\n📝 Primeiros 3 logs:');
      logsResult.slice(0, 3).forEach((log, index) => {
        console.log(`${index + 1}. ID: ${log.id}, Erro: ${log.error_code}, Path: ${log.requested_path}, IP: ${log.client_ip}`);
      });
    } else {
      console.log('\n⚠️ Nenhum log retornado pela consulta!');
    }
    
    // Testar consulta simples sem filtros
    console.log('\n🔍 Testando consulta simples...');
    const [simpleResult] = await connection.execute('SELECT COUNT(*) as total FROM logs_error');
    console.log(`📊 Total simples: ${simpleResult[0].total}`);
    
    const [simpleLogs] = await connection.execute('SELECT * FROM logs_error ORDER BY timestamp DESC LIMIT 5');
    console.log(`📊 Logs simples: ${simpleLogs.length}`);
    
    await connection.end();
    console.log('\n✅ Debug concluído');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugLogsQuery();