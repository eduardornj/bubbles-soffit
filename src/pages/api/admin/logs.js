import mysql from 'mysql2/promise';

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Cocacola10',
  database: 'bubbles_enterprise'
};

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    const connection = await mysql.createConnection(dbConfig);

    // Se não há ação especificada, assumir que é busca de logs
    if (!action) {
      const result = await getLogs(connection, url.searchParams);
      await connection.end();
      return result;
    }

    switch (action) {
      case 'stats':
        return await getStats(connection);
      case 'logs':
        return await getLogs(connection, url.searchParams);
      case 'top-pages':
        return await getTopPages(connection);
      case 'top-ips':
        return await getTopIPs(connection);
      default:
        return new Response(JSON.stringify({ error: 'Ação não especificada' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Erro na API de logs:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    // Verificar se há conteúdo no request
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type deve ser application/json' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const text = await request.text();
    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ error: 'Body da requisição está vazio' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      return new Response(JSON.stringify({ error: 'JSON inválido no body da requisição' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { action } = body;
    
    const connection = await mysql.createConnection(dbConfig);

    switch (action) {
      case 'clear':
        return await clearLogs(connection, body);
      case 'delete':
        return await deleteLogs(connection, body);
      case 'export':
        return await exportLogs(connection, body);
      default:
        return new Response(JSON.stringify({ error: 'Ação não especificada' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Erro na API de logs:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getStats(connection) {
  try {
    const [statsResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total_errors,
        COUNT(DISTINCT client_ip) as unique_ips,
        COUNT(CASE WHEN is_suspicious = 1 THEN 1 END) as suspicious_count,
        AVG(response_time_ms) as avg_response_time,
        COUNT(CASE WHEN error_code >= 400 AND error_code < 500 THEN 1 END) as client_errors,
        COUNT(CASE WHEN error_code >= 500 THEN 1 END) as server_errors,
        COUNT(CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as last_24h,
        COUNT(CASE WHEN timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as last_7d
      FROM logs_error
    `);

    const [errorsByHour] = await connection.execute(`
      SELECT 
        HOUR(timestamp) as hour,
        COUNT(*) as count
      FROM logs_error 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY HOUR(timestamp)
      ORDER BY hour
    `);

    const [errorsByCode] = await connection.execute(`
      SELECT 
        error_code,
        COUNT(*) as count
      FROM logs_error 
      GROUP BY error_code
      ORDER BY count DESC
      LIMIT 10
    `);

    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      data: {
        general: statsResult[0],
        hourly: errorsByHour,
        byCodes: errorsByCode
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await connection.end();
    throw error;
  }
}

// Função para deletar logs específicos por IDs
async function deleteLogs(connection, body) {
  try {
    const { ids } = body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({
        success: false,
        error: 'IDs de logs não fornecidos ou inválidos'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar que todos os IDs são números
    const validIds = ids.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
    
    if (validIds.length === 0) {
      await connection.end();
      return new Response(JSON.stringify({
        success: false,
        error: 'Nenhum ID válido fornecido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Criar placeholders para a query (?, ?, ?...)
    const placeholders = validIds.map(() => '?').join(', ');
    
    // Executar a exclusão
    const [result] = await connection.execute(
      `DELETE FROM logs_error WHERE id IN (${placeholders})`,
      validIds
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return new Response(JSON.stringify({
        success: true,
        message: `${result.affectedRows} log(s) excluído(s) com sucesso`,
        deletedCount: result.affectedRows
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Nenhum log foi encontrado com os IDs fornecidos'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Erro ao deletar logs:', error);
    await connection.end();
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor ao deletar logs'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getLogs(connection, searchParams) {
  try {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const filterErrorCode = searchParams.get('error_code') || '';
    const filterPath = searchParams.get('path') || '';
    const filterIP = searchParams.get('ip') || '';
    const filterSuspicious = searchParams.get('suspicious') || '';
    const searchTerm = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'timestamp';
    const sortOrder = searchParams.get('order') || 'DESC';

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

    // Contar total
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM logs_error ${whereClause}`,
      queryParams
    );

    // Buscar logs
    const [logsResult] = await connection.execute(
      `SELECT * FROM logs_error ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    await connection.end();

    const totalPages = Math.ceil(countResult[0].total / limit);

    return new Response(JSON.stringify({
      success: true,
      logs: logsResult,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        total: countResult[0].total,
        limit: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await connection.end();
    throw error;
  }
}

async function getTopPages(connection) {
  try {
    const [result] = await connection.execute(`
      SELECT 
        requested_path, 
        COUNT(*) as error_count, 
        error_code,
        COUNT(DISTINCT client_ip) as unique_ips,
        AVG(response_time_ms) as avg_response_time
      FROM logs_error 
      GROUP BY requested_path, error_code 
      ORDER BY error_count DESC 
      LIMIT 20
    `);

    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await connection.end();
    throw error;
  }
}

async function getTopIPs(connection) {
  try {
    const [result] = await connection.execute(`
      SELECT 
        client_ip, 
        COUNT(*) as error_count,
        COUNT(DISTINCT error_code) as error_types,
        COUNT(CASE WHEN is_suspicious = 1 THEN 1 END) as suspicious_count,
        MIN(timestamp) as first_seen,
        MAX(timestamp) as last_seen
      FROM logs_error 
      GROUP BY client_ip 
      ORDER BY error_count DESC 
      LIMIT 20
    `);

    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await connection.end();
    throw error;
  }
}

async function clearLogs(connection, body) {
  try {
    const { type, days } = body;
    let query = '';
    let params = [];

    switch (type) {
      case 'old':
        const daysToKeep = days || 30;
        query = 'DELETE FROM logs_error WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)';
        params = [daysToKeep];
        break;
      case 'suspicious':
        query = 'DELETE FROM logs_error WHERE is_suspicious = 1';
        break;
      case 'error_code':
        query = 'DELETE FROM logs_error WHERE error_code = ?';
        params = [body.error_code];
        break;
      case 'ip':
        query = 'DELETE FROM logs_error WHERE client_ip = ?';
        params = [body.ip];
        break;
      case 'all':
        query = 'DELETE FROM logs_error';
        break;
      default:
        throw new Error('Tipo de limpeza não especificado');
    }

    const [result] = await connection.execute(query, params);
    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      message: `${result.affectedRows} registros removidos com sucesso`,
      affectedRows: result.affectedRows
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await connection.end();
    throw error;
  }
}

async function exportLogs(connection, body) {
  try {
    const { format, filters } = body;
    
    let whereConditions = [];
    let queryParams = [];

    if (filters) {
      if (filters.error_code) {
        whereConditions.push('error_code = ?');
        queryParams.push(filters.error_code);
      }
      if (filters.start_date) {
        whereConditions.push('timestamp >= ?');
        queryParams.push(filters.start_date);
      }
      if (filters.end_date) {
        whereConditions.push('timestamp <= ?');
        queryParams.push(filters.end_date);
      }
      if (filters.suspicious !== undefined) {
        whereConditions.push('is_suspicious = ?');
        queryParams.push(filters.suspicious ? 1 : 0);
      }
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [logs] = await connection.execute(
      `SELECT * FROM logs_error ${whereClause} ORDER BY timestamp DESC LIMIT 10000`,
      queryParams
    );

    await connection.end();

    if (format === 'csv') {
      const csvHeaders = 'ID,Timestamp,Error Code,Path,IP,Method,Response Time,Suspicious,User Agent\n';
      const csvData = logs.map(log => 
        `${log.id},"${log.timestamp}",${log.error_code},"${log.requested_path}","${log.client_ip}","${log.method || ''}",${log.response_time_ms || ''},"${log.is_suspicious ? 'Yes' : 'No'}","${(log.user_agent || '').replace(/"/g, '""')}"`
      ).join('\n');

      return new Response(csvHeaders + csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="error_logs_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: logs,
      count: logs.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    await connection.end();
    throw error;
  }
}