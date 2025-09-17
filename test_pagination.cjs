const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Cocacola10',
    database: 'bubbles_enterprise'
  });
  
  console.log('=== TESTANDO PAGINAÇÃO ===');
  
  try {
    const page = 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    
    const query = `SELECT id, error_code, requested_path, client_ip, user_agent, referer, is_suspicious, timestamp, method, response_time_ms FROM logs_error WHERE 1=1 ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`;
    
    console.log('Query:', query);
    const [rows] = await connection.execute(query);
    
    console.log('Página:', page);
    console.log('Limite:', limit);
    console.log('Offset:', offset);
    console.log('Registros encontrados:', rows.length);
    
    if (rows.length > 0) {
      console.log('Primeiro registro:');
      console.log('  ID:', rows[0].id);
      console.log('  Error Code:', rows[0].error_code);
      console.log('  Path:', rows[0].requested_path);
      console.log('  Timestamp:', rows[0].timestamp);
    }
    
  } catch (error) {
    console.log('ERRO:', error.message);
  }
  
  await connection.end();
})().catch(console.error);