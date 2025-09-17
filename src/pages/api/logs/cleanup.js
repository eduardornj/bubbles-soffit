import mysql from 'mysql2/promise';

// Forçar renderização server-side
export const prerender = false;

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Cocacola10',
  database: 'bubbles_enterprise'
};

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (!action) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ação não especificada'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connection = await mysql.createConnection(dbConfig);
    let query = '';
    let deletedCount = 0;

    switch (action) {
      case 'old':
        // Limpar logs com mais de 30 dias de todas as tabelas
        const [oldLogsResult] = await connection.execute(
          `DELETE FROM logs_error WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY)`
        );
        const [oldSecurityResult] = await connection.execute(
          `DELETE FROM security_events WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY)`
        );
        deletedCount = oldLogsResult.affectedRows + oldSecurityResult.affectedRows;
        await connection.end();
        return new Response(JSON.stringify({
          success: true,
          message: `${deletedCount} logs antigos removidos com sucesso!`,
          deletedCount
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'errors':
        // Limpar apenas logs de erro (códigos 4xx e 5xx)
        query = `DELETE FROM logs_error WHERE error_code >= 400`;
        break;
        
      case 'security_events':
        // Limpar especificamente a tabela security_events (7777+ registros)
        const [securityResult] = await connection.execute(
          `DELETE FROM security_events WHERE 1=1`
        );
        // Reset auto increment
        await connection.execute(`ALTER TABLE security_events AUTO_INCREMENT = 1`);
        deletedCount = securityResult.affectedRows;
        await connection.end();
        return new Response(JSON.stringify({
          success: true,
          message: `${deletedCount} eventos de segurança removidos! Tabela limpa.`,
          deletedCount
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'all':
        // Limpar TODOS os logs de todas as tabelas
        const [allLogsResult] = await connection.execute(`DELETE FROM logs_error WHERE 1=1`);
        const [allSecurityLogsResult] = await connection.execute(`DELETE FROM security_logs WHERE 1=1`);
        const [allSecurityEventsResult] = await connection.execute(`DELETE FROM security_events WHERE 1=1`);
        
        // Reset auto increment counters
        await connection.execute(`ALTER TABLE logs_error AUTO_INCREMENT = 1`);
        await connection.execute(`ALTER TABLE security_logs AUTO_INCREMENT = 1`);
        await connection.execute(`ALTER TABLE security_events AUTO_INCREMENT = 1`);
        
        deletedCount = allLogsResult.affectedRows + allSecurityLogsResult.affectedRows + allSecurityEventsResult.affectedRows;
        await connection.end();
        return new Response(JSON.stringify({
          success: true,
          message: `TODOS os logs foram removidos! Total: ${deletedCount} registros`,
          deletedCount
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      case 'logs_error_only':
        // Limpar apenas a tabela logs_error
        query = `DELETE FROM logs_error WHERE 1=1`;
        break;
        
      default:
        await connection.end();
        return new Response(JSON.stringify({
          success: false,
          message: 'Ação inválida'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    // Executar a query de limpeza
    const [result] = await connection.execute(query);
    deletedCount = result.affectedRows;

    await connection.end();

    return new Response(JSON.stringify({
      success: true,
      message: `Limpeza executada com sucesso`,
      deletedCount,
      action
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na limpeza de logs:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: `Erro ao executar limpeza: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}