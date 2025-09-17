import mysql from 'mysql2/promise';

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bubbles_enterprise'
});

export async function POST({ request }) {
  try {
    const { ip, action } = await request.json();
    
    if (!ip) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'IP é obrigatório' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'block') {
      // Verificar se o IP já está bloqueado
      const [existing] = await connection.execute(
        'SELECT id FROM blocked_ips WHERE ip_address = ?',
        [ip]
      );

      if (existing.length > 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'IP já está bloqueado' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Bloquear o IP
      await connection.execute(
        'INSERT INTO blocked_ips (ip_address, blocked_at, reason) VALUES (?, NOW(), ?)',
        [ip, 'Bloqueado manualmente via painel de logs']
      );

      return new Response(JSON.stringify({ 
        success: true, 
        message: `IP ${ip} foi bloqueado com sucesso` 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (action === 'unblock') {
      // Desbloquear o IP
      const [result] = await connection.execute(
        'DELETE FROM blocked_ips WHERE ip_address = ?',
        [ip]
      );

      if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'IP não estava bloqueado' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `IP ${ip} foi desbloqueado com sucesso` 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Ação inválida. Use "block" ou "unblock"' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Erro ao processar bloqueio/desbloqueio de IP:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET({ url }) {
  try {
    const ip = url.searchParams.get('ip');
    
    if (!ip) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'IP é obrigatório' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar se o IP está bloqueado
    const [blocked] = await connection.execute(
      'SELECT id, blocked_at, reason FROM blocked_ips WHERE ip_address = ?',
      [ip]
    );

    return new Response(JSON.stringify({ 
      success: true, 
      blocked: blocked.length > 0,
      data: blocked.length > 0 ? blocked[0] : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao verificar status do IP:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}