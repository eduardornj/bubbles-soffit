import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bubbles_enterprise'
};

interface CleanupParams {
  cleanupType: 'selective' | 'complete' | 'by_date' | 'by_ip' | 'by_type';
  logTypes?: string[];
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  errorType?: string;
  confirmationToken?: string;
  keepDays?: number;
}

// Função para gerar token de confirmação
function generateConfirmationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Função para validar token de confirmação (em produção, usar um sistema mais seguro)
function validateConfirmationToken(token: string | undefined): boolean {
  // Em produção, implementar validação real com timestamp e hash
  return Boolean(token && token.length >= 20);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const params: CleanupParams = await request.json();
    const {
      cleanupType,
      logTypes = [],
      startDate,
      endDate,
      ipAddress,
      errorType,
      confirmationToken,
      keepDays = 30
    } = params;

    // Validar token de confirmação para operações destrutivas
    if (!confirmationToken || !validateConfirmationToken(confirmationToken)) {
      return new Response(JSON.stringify({
        error: 'Invalid or missing confirmation token',
        requiresConfirmation: true,
        confirmationToken: generateConfirmationToken()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      await connection.beginTransaction();

      let deletedCounts: { [key: string]: number } = {};
      let totalDeleted = 0;

      switch (cleanupType) {
        case 'complete':
          // Limpeza completa de todos os logs (PERIGOSO!)
          const tables = ['logs_error', 'security_events', 'logs_compliance', 'auth_attempts', 'csp_violations'];
          
          for (const table of tables) {
            const [result] = await connection.execute(`DELETE FROM ${table}`);
            const affectedRows = (result as any).affectedRows;
            deletedCounts[table] = affectedRows;
            totalDeleted += affectedRows;
          }
          break;

        case 'by_date':
          // Limpeza por intervalo de datas
          if (!startDate && !endDate && !keepDays) {
            throw new Error('Date range or keepDays parameter is required for date-based cleanup');
          }

          const dateCondition = keepDays 
            ? 'created_at < DATE_SUB(NOW(), INTERVAL ? DAY)'
            : 'created_at BETWEEN ? AND ?';
          
          const dateParams = keepDays ? [keepDays] : [startDate, endDate];

          const allTables = ['logs_error', 'security_events', 'logs_compliance', 'auth_attempts', 'csp_violations'];
          
          for (const table of allTables) {
            const [result] = await connection.execute(
              `DELETE FROM ${table} WHERE ${dateCondition}`,
              dateParams
            );
            const affectedRows = (result as any).affectedRows;
            deletedCounts[table] = affectedRows;
            totalDeleted += affectedRows;
          }
          break;

        case 'by_ip':
          // Limpeza por endereço IP
          if (!ipAddress) {
            throw new Error('IP address is required for IP-based cleanup');
          }

          const ipTables = ['logs_error', 'security_events', 'logs_compliance', 'auth_attempts', 'csp_violations'];
          
          for (const table of ipTables) {
            const [result] = await connection.execute(
              `DELETE FROM ${table} WHERE ip_address = ?`,
              [ipAddress]
            );
            const affectedRows = (result as any).affectedRows;
            deletedCounts[table] = affectedRows;
            totalDeleted += affectedRows;
          }
          break;

        case 'by_type':
          // Limpeza por tipo de erro/evento
          if (!errorType) {
            throw new Error('Error type is required for type-based cleanup');
          }

          // Logs de erro
          const [errorResult] = await connection.execute(
            'DELETE FROM logs_error WHERE error_type = ?',
            [errorType]
          );
          deletedCounts['logs_error'] = (errorResult as any).affectedRows;

          // Eventos de segurança
          const [securityResult] = await connection.execute(
            'DELETE FROM security_events WHERE event_type = ?',
            [errorType]
          );
          deletedCounts['security_events'] = (securityResult as any).affectedRows;

          // Logs de compliance
          const [complianceResult] = await connection.execute(
            'DELETE FROM logs_compliance WHERE compliance_type = ?',
            [errorType]
          );
          deletedCounts['logs_compliance'] = (complianceResult as any).affectedRows;

          // Tentativas de autenticação
          const [authResult] = await connection.execute(
            'DELETE FROM auth_attempts WHERE attempt_type = ?',
            [errorType]
          );
          deletedCounts['auth_attempts'] = (authResult as any).affectedRows;

          // Violações CSP
          const [cspResult] = await connection.execute(
            'DELETE FROM csp_violations WHERE violated_directive = ?',
            [errorType]
          );
          deletedCounts['csp_violations'] = (cspResult as any).affectedRows;

          totalDeleted = Object.values(deletedCounts).reduce((sum, count) => sum + count, 0);
          break;

        case 'selective':
          // Limpeza seletiva baseada em tipos de log específicos
          if (!logTypes || logTypes.length === 0) {
            throw new Error('Log types are required for selective cleanup');
          }

          const tableMap: { [key: string]: string } = {
            'error': 'logs_error',
            'security': 'security_events',
            'compliance': 'logs_compliance',
            'auth': 'auth_attempts',
            'csp': 'csp_violations'
          };

          for (const logType of logTypes) {
            const tableName = tableMap[logType];
            if (!tableName) continue;

            let query = `DELETE FROM ${tableName}`;
            let queryParams: any[] = [];
            let conditions: string[] = [];

            // Adicionar condições opcionais
            if (startDate && endDate) {
              conditions.push('created_at BETWEEN ? AND ?');
              queryParams.push(startDate, endDate);
            } else if (keepDays) {
              conditions.push('created_at < DATE_SUB(NOW(), INTERVAL ? DAY)');
              queryParams.push(keepDays);
            }

            if (ipAddress) {
              conditions.push('ip_address = ?');
              queryParams.push(ipAddress);
            }

            if (conditions.length > 0) {
              query += ' WHERE ' + conditions.join(' AND ');
            }

            const [result] = await connection.execute(query, queryParams);
            const affectedRows = (result as any).affectedRows;
            deletedCounts[tableName] = affectedRows;
            totalDeleted += affectedRows;
          }
          break;

        default:
          throw new Error('Invalid cleanup type');
      }

      // Log da operação de limpeza
      await connection.execute(
        `INSERT INTO security_events (event_type, ip_address, details, created_at) 
         VALUES ('log_cleanup', ?, ?, NOW())`,
        [
          'admin_dashboard',
          JSON.stringify({
            cleanup_type: cleanupType,
            deleted_counts: deletedCounts,
            total_deleted: totalDeleted,
            parameters: {
              logTypes,
              startDate,
              endDate,
              ipAddress,
              errorType,
              keepDays
            },
            performed_by: 'admin',
            timestamp: new Date().toISOString()
          })
        ]
      );

      await connection.commit();

      return new Response(JSON.stringify({
        success: true,
        message: `Log cleanup completed successfully`,
        summary: {
          cleanupType,
          totalDeleted,
          deletedCounts,
          timestamp: new Date().toISOString()
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error in log cleanup:', error);
    return new Response(JSON.stringify({
      error: 'Failed to perform log cleanup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// GET para obter estatísticas antes da limpeza
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const previewType = url.searchParams.get('preview');
    const logTypes = url.searchParams.get('logTypes')?.split(',') || [];
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const ipAddress = url.searchParams.get('ipAddress');
    const errorType = url.searchParams.get('errorType');
    const keepDays = parseInt(url.searchParams.get('keepDays') || '30');

    const connection = await mysql.createConnection(dbConfig);

    try {
      let previewCounts: { [key: string]: number } = {};
      let totalToDelete = 0;

      if (previewType === 'complete') {
        // Preview para limpeza completa
        const tables = ['logs_error', 'security_events', 'logs_compliance', 'auth_attempts', 'csp_violations'];
        
        for (const table of tables) {
          const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
          const count = (result as any)[0].count;
          previewCounts[table] = count;
          totalToDelete += count;
        }
      } else if (previewType === 'by_date') {
        // Preview para limpeza por data
        const dateCondition = keepDays 
          ? 'created_at < DATE_SUB(NOW(), INTERVAL ? DAY)'
          : 'created_at BETWEEN ? AND ?';
        
        const dateParams = keepDays ? [keepDays] : [startDate, endDate];
        const allTables = ['logs_error', 'security_events', 'logs_compliance', 'auth_attempts', 'csp_violations'];
        
        for (const table of allTables) {
          const [result] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${table} WHERE ${dateCondition}`,
            dateParams
          );
          const count = (result as any)[0].count;
          previewCounts[table] = count;
          totalToDelete += count;
        }
      } else if (previewType === 'by_ip' && ipAddress) {
        // Preview para limpeza por IP
        const ipTables = ['logs_error', 'security_events', 'logs_compliance', 'auth_attempts', 'csp_violations'];
        
        for (const table of ipTables) {
          const [result] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${table} WHERE ip_address = ?`,
            [ipAddress]
          );
          const count = (result as any)[0].count;
          previewCounts[table] = count;
          totalToDelete += count;
        }
      }

      // Estatísticas gerais do banco
      const [generalStats] = await connection.execute(`
        SELECT 
          (SELECT COUNT(*) FROM logs_error) as error_logs,
          (SELECT COUNT(*) FROM security_events) as security_events,
          (SELECT COUNT(*) FROM logs_compliance) as compliance_logs,
          (SELECT COUNT(*) FROM auth_attempts) as auth_attempts,
          (SELECT COUNT(*) FROM csp_violations) as csp_violations,
          (SELECT COUNT(*) FROM banned_ips WHERE is_active = TRUE) as banned_ips
      `);

      return new Response(JSON.stringify({
        success: true,
        preview: {
          totalToDelete,
          previewCounts,
          confirmationToken: generateConfirmationToken()
        },
        currentStats: (generalStats as any)[0],
        warning: totalToDelete > 1000 
          ? 'ATENÇÃO: Esta operação irá deletar mais de 1000 registros. Confirme se realmente deseja prosseguir.'
          : null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error in cleanup preview:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate cleanup preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};