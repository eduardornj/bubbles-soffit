import mysql from 'mysql2/promise';

// Forçar renderização server-side
export const prerender = false;

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Cocacola10',
  database: 'bubbles_enterprise'
};

function buildFilteredQuery(searchParams) {
  let query = 'SELECT * FROM logs_error WHERE 1=1';
  const params = [];

  if (searchParams.get('error_code')) {
    query += ' AND error_code = ?';
    params.push(searchParams.get('error_code'));
  }

  if (searchParams.get('start_date')) {
    query += ' AND timestamp >= ?';
    params.push(searchParams.get('start_date'));
  }

  if (searchParams.get('end_date')) {
    query += ' AND timestamp <= ?';
    params.push(searchParams.get('end_date') + ' 23:59:59');
  }

  if (searchParams.get('ip_address')) {
    query += ' AND ip_address LIKE ?';
    params.push('%' + searchParams.get('ip_address') + '%');
  }

  if (searchParams.get('path')) {
    query += ' AND path LIKE ?';
    params.push('%' + searchParams.get('path') + '%');
  }

  if (searchParams.get('user_agent')) {
    query += ' AND user_agent LIKE ?';
    params.push('%' + searchParams.get('user_agent') + '%');
  }

  if (searchParams.get('suspicious') === 'true') {
    query += ' AND (error_code >= 400 OR path LIKE "%admin%" OR path LIKE "%.php" OR path LIKE "%.asp")';
  }

  if (searchParams.get('instant_search')) {
    const search = searchParams.get('instant_search');
    query += ' AND (path LIKE ? OR ip_address LIKE ? OR user_agent LIKE ? OR error_code LIKE ?)';
    params.push('%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%');
  }

  query += ' ORDER BY timestamp DESC LIMIT 1000';
  return { query, params };
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escapar aspas duplas e envolver em aspas se contém vírgula
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return '"' + value.replace(/"/g, '""') + '"';
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

export async function GET({ url }) {
  try {
    const searchParams = new URL(url).searchParams;
    const format = searchParams.get('format') || 'json';
    
    const connection = await mysql.createConnection(dbConfig);
    const { query, params } = buildFilteredQuery(searchParams);
    
    const [rows] = await connection.execute(query, params);
    await connection.end();

    if (format === 'csv') {
      const csvData = convertToCSV(rows);
      
      return new Response(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="logs_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: true,
        data: rows,
        count: rows.length,
        exported_at: new Date().toISOString()
      }, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="logs_export_${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    }

  } catch (error) {
    console.error('Erro na exportação:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: `Erro ao exportar logs: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}