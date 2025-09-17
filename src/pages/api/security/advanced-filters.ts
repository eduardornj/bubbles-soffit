import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bubbles_enterprise'
};

interface FilterParams {
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  page?: string;
  errorType?: string;
  logType?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const filters: FilterParams = await request.json();
    const {
      startDate,
      endDate,
      ipAddress,
      page: pageFilter,
      errorType,
      logType = 'all',
      limit = 100,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const connection = await mysql.createConnection(dbConfig);

    try {
      let baseQuery = '';
      let countQuery = '';
      let params: any[] = [];
      let whereConditions: string[] = [];

      // Construir consulta baseada no tipo de log
      switch (logType) {
        case 'error':
          baseQuery = `
            SELECT 
              'error' as log_type,
              id,
              error_type,
              error_message,
              stack_trace,
              request_url as page_url,
              user_agent,
              ip_address,
              created_at,
              NULL as event_type,
              NULL as details
            FROM logs_error
          `;
          countQuery = 'SELECT COUNT(*) as total FROM logs_error';
          
          if (errorType) {
            whereConditions.push('error_type = ?');
            params.push(errorType);
          }
          break;

        case 'security':
          baseQuery = `
            SELECT 
              'security' as log_type,
              id,
              event_type as error_type,
              details as error_message,
              NULL as stack_trace,
              request_url as page_url,
              user_agent,
              ip_address,
              created_at,
              event_type,
              details
            FROM security_events
          `;
          countQuery = 'SELECT COUNT(*) as total FROM security_events';
          break;

        case 'compliance':
          baseQuery = `
            SELECT 
              'compliance' as log_type,
              id,
              compliance_type as error_type,
              details as error_message,
              NULL as stack_trace,
              request_url as page_url,
              user_agent,
              ip_address,
              created_at,
              compliance_type as event_type,
              details
            FROM logs_compliance
          `;
          countQuery = 'SELECT COUNT(*) as total FROM logs_compliance';
          break;

        case 'auth':
          baseQuery = `
            SELECT 
              'auth' as log_type,
              id,
              attempt_type as error_type,
              CONCAT('Auth attempt: ', attempt_type, ' - ', COALESCE(username, 'unknown')) as error_message,
              NULL as stack_trace,
              request_url as page_url,
              user_agent,
              ip_address,
              created_at,
              attempt_type as event_type,
              JSON_OBJECT('username', username, 'success', success, 'failure_reason', failure_reason) as details
            FROM auth_attempts
          `;
          countQuery = 'SELECT COUNT(*) as total FROM auth_attempts';
          break;

        case 'csp':
          baseQuery = `
            SELECT 
              'csp' as log_type,
              id,
              violated_directive as error_type,
              CONCAT('CSP Violation: ', violated_directive, ' - ', blocked_uri) as error_message,
              NULL as stack_trace,
              document_uri as page_url,
              user_agent,
              ip_address,
              created_at,
              'csp_violation' as event_type,
              JSON_OBJECT('violated_directive', violated_directive, 'blocked_uri', blocked_uri, 'source_file', source_file) as details
            FROM csp_violations
          `;
          countQuery = 'SELECT COUNT(*) as total FROM csp_violations';
          break;

        default: // 'all'
          baseQuery = `
            SELECT * FROM (
              SELECT 
                'error' as log_type, id, error_type, error_message, stack_trace, 
                request_url as page_url, user_agent, ip_address, created_at,
                error_type as event_type, NULL as details
              FROM logs_error
              UNION ALL
              SELECT 
                'security' as log_type, id, event_type as error_type, details as error_message, 
                NULL as stack_trace, request_url as page_url, user_agent, ip_address, created_at,
                event_type, details
              FROM security_events
              UNION ALL
              SELECT 
                'compliance' as log_type, id, compliance_type as error_type, details as error_message,
                NULL as stack_trace, request_url as page_url, user_agent, ip_address, created_at,
                compliance_type as event_type, details
              FROM logs_compliance
              UNION ALL
              SELECT 
                'auth' as log_type, id, attempt_type as error_type, 
                CONCAT('Auth: ', attempt_type, ' - ', COALESCE(username, 'unknown')) as error_message,
                NULL as stack_trace, request_url as page_url, user_agent, ip_address, created_at,
                attempt_type as event_type, JSON_OBJECT('username', username, 'success', success) as details
              FROM auth_attempts
              UNION ALL
              SELECT 
                'csp' as log_type, id, violated_directive as error_type,
                CONCAT('CSP: ', violated_directive, ' - ', blocked_uri) as error_message,
                NULL as stack_trace, document_uri as page_url, user_agent, ip_address, created_at,
                'csp_violation' as event_type, JSON_OBJECT('violated_directive', violated_directive, 'blocked_uri', blocked_uri) as details
              FROM csp_violations
            ) as all_logs
          `;
          countQuery = `
            SELECT 
              (SELECT COUNT(*) FROM logs_error) +
              (SELECT COUNT(*) FROM security_events) +
              (SELECT COUNT(*) FROM logs_compliance) +
              (SELECT COUNT(*) FROM auth_attempts) +
              (SELECT COUNT(*) FROM csp_violations) as total
          `;
      }

      // Adicionar condições WHERE
      if (startDate) {
        whereConditions.push('created_at >= ?');
        params.push(startDate);
      }

      if (endDate) {
        whereConditions.push('created_at <= ?');
        params.push(endDate);
      }

      if (ipAddress) {
        whereConditions.push('ip_address LIKE ?');
        params.push(`%${ipAddress}%`);
      }

      if (pageFilter) {
        whereConditions.push('page_url LIKE ?');
        params.push(`%${pageFilter}%`);
      }

      // Aplicar condições WHERE
      if (whereConditions.length > 0) {
        const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
        baseQuery += whereClause;
        countQuery += whereClause;
      }

      // Adicionar ordenação e paginação
      const validSortColumns = ['created_at', 'ip_address', 'error_type', 'page_url'];
      const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
      
      baseQuery += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      // Executar consultas
      const [rows] = await connection.execute(baseQuery, params);
      const [countResult] = await connection.execute(countQuery, params.slice(0, -2)); // Remove limit e offset para contagem
      
      const total = logType === 'all' 
        ? (countResult as any)[0].total
        : (countResult as any)[0].total;

      // Buscar estatísticas adicionais
      const [statsResult] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT ip_address) as unique_ips,
          COUNT(*) as total_events,
          DATE(created_at) as event_date,
          COUNT(*) as daily_count
        FROM (
          SELECT ip_address, created_at FROM logs_error
          UNION ALL
          SELECT ip_address, created_at FROM security_events
          UNION ALL
          SELECT ip_address, created_at FROM logs_compliance
          UNION ALL
          SELECT ip_address, created_at FROM auth_attempts
          UNION ALL
          SELECT ip_address, created_at FROM csp_violations
        ) as all_events
        WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 7 DAY))
        AND created_at <= COALESCE(?, NOW())
        GROUP BY DATE(created_at)
        ORDER BY event_date DESC
        LIMIT 30
      `, [startDate || null, endDate || null]);

      // Top IPs suspeitos
      const [topIpsResult] = await connection.execute(`
        SELECT 
          ip_address,
          COUNT(*) as event_count,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          MAX(created_at) as last_activity
        FROM (
          SELECT ip_address, created_at FROM logs_error
          UNION ALL
          SELECT ip_address, created_at FROM security_events
          UNION ALL
          SELECT ip_address, created_at FROM auth_attempts
        ) as suspicious_events
        WHERE created_at >= COALESCE(?, DATE_SUB(NOW(), INTERVAL 7 DAY))
        GROUP BY ip_address
        HAVING event_count > 10
        ORDER BY event_count DESC
        LIMIT 10
      `, [startDate || null]);

      return new Response(JSON.stringify({
        success: true,
        data: rows,
        pagination: {
          total,
          limit,
          offset,
          totalPages: Math.ceil(total / limit)
        },
        statistics: {
          dailyStats: statsResult,
          topSuspiciousIPs: topIpsResult
        },
        filters: {
          startDate,
          endDate,
          ipAddress,
          pageFilter,
          errorType,
          logType,
          sortBy: safeSortBy,
          sortOrder: safeSortOrder
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error in advanced filters:', error);
    return new Response(JSON.stringify({
      error: 'Failed to apply filters',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// GET para obter opções de filtros disponíveis
export const GET: APIRoute = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Buscar tipos de erro únicos
      const [errorTypes] = await connection.execute(`
        SELECT DISTINCT error_type FROM logs_error WHERE error_type IS NOT NULL
        UNION
        SELECT DISTINCT event_type FROM security_events WHERE event_type IS NOT NULL
        UNION
        SELECT DISTINCT compliance_type FROM logs_compliance WHERE compliance_type IS NOT NULL
        UNION
        SELECT DISTINCT attempt_type FROM auth_attempts WHERE attempt_type IS NOT NULL
        UNION
        SELECT DISTINCT violated_directive FROM csp_violations WHERE violated_directive IS NOT NULL
        ORDER BY error_type
      `);

      // Buscar páginas mais acessadas
      const [topPages] = await connection.execute(`
        SELECT 
          page_url,
          COUNT(*) as access_count
        FROM (
          SELECT request_url as page_url FROM logs_error WHERE request_url IS NOT NULL
          UNION ALL
          SELECT request_url as page_url FROM security_events WHERE request_url IS NOT NULL
          UNION ALL
          SELECT document_uri as page_url FROM csp_violations WHERE document_uri IS NOT NULL
        ) as all_pages
        GROUP BY page_url
        ORDER BY access_count DESC
        LIMIT 20
      `);

      // Buscar IPs mais ativos
      const [topIPs] = await connection.execute(`
        SELECT 
          ip_address,
          COUNT(*) as activity_count,
          MAX(created_at) as last_seen
        FROM (
          SELECT ip_address, created_at FROM logs_error
          UNION ALL
          SELECT ip_address, created_at FROM security_events
          UNION ALL
          SELECT ip_address, created_at FROM auth_attempts
        ) as all_activities
        WHERE ip_address IS NOT NULL
        GROUP BY ip_address
        ORDER BY activity_count DESC
        LIMIT 20
      `);

      return new Response(JSON.stringify({
        success: true,
        filterOptions: {
          errorTypes: (errorTypes as any[]).map(row => row.error_type),
          logTypes: ['all', 'error', 'security', 'compliance', 'auth', 'csp'],
          topPages: topPages,
          topIPs: topIPs,
          sortOptions: [
            { value: 'created_at', label: 'Data/Hora' },
            { value: 'ip_address', label: 'Endereço IP' },
            { value: 'error_type', label: 'Tipo de Erro' },
            { value: 'page_url', label: 'Página' }
          ]
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error fetching filter options:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch filter options',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};