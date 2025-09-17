import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bubbles_enterprise'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ip_address, ban_type, ban_reason, duration_hours } = await request.json();

    if (!ip_address) {
      return new Response(JSON.stringify({ error: 'IP address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar formato do IP
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipRegex.test(ip_address)) {
      return new Response(JSON.stringify({ error: 'Invalid IP address format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Chamar procedure para banir IP
      await connection.execute(
        'CALL BanIP(?, ?, ?, ?, ?)',
        [
          ip_address,
          ban_type || 'temporary',
          ban_reason || 'Manual ban from admin dashboard',
          'admin',
          duration_hours || 24
        ]
      );

      // Log da ação
      await connection.execute(
        `INSERT INTO security_events (event_type, ip_address, details, created_at) 
         VALUES ('ip_banned', ?, ?, NOW())`,
        [
          ip_address,
          JSON.stringify({
            ban_type: ban_type || 'temporary',
            ban_reason: ban_reason || 'Manual ban from admin dashboard',
            duration_hours: duration_hours || 24,
            banned_by: 'admin'
          })
        ]
      );

      return new Response(JSON.stringify({ 
        success: true, 
        message: `IP ${ip_address} has been banned successfully`,
        ban_type: ban_type || 'temporary',
        duration_hours: ban_type === 'permanent' ? null : (duration_hours || 24)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error banning IP:', error as any);
    return new Response(JSON.stringify({ 
      error: 'Failed to ban IP address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const ip_address = url.searchParams.get('ip');

    if (!ip_address) {
      return new Response(JSON.stringify({ error: 'IP address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Chamar procedure para desbanir IP
      await connection.execute('CALL UnbanIP(?, ?)', [ip_address, 'admin']);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `IP ${ip_address} has been unbanned successfully`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error unbanning IP:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to unban IP address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const ip_address = url.searchParams.get('ip');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const connection = await mysql.createConnection(dbConfig);

    try {
      if (ip_address) {
        // Verificar status de banimento de um IP específico
        const [rows] = await connection.execute('CALL CheckIPBan(?)', [ip_address]) as any[];
        return new Response(JSON.stringify({ 
          success: true, 
          data: rows[0] || null
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Listar todos os IPs banidos
        const [rows] = await connection.execute(
          `SELECT 
             id, ip_address, ban_type, ban_reason, banned_by, banned_at, 
             expires_at, is_active, attempts_count, last_attempt_at,
             CASE 
               WHEN ban_type = 'permanent' THEN TRUE
               WHEN ban_type = 'temporary' AND (expires_at IS NULL OR expires_at > NOW()) THEN TRUE
               ELSE FALSE
             END as is_banned
           FROM banned_ips 
           WHERE is_active = TRUE
           ORDER BY banned_at DESC
           LIMIT ? OFFSET ?`,
          [limit, offset]
        );

        // Contar total de registros
        const [countResult] = await connection.execute(
          'SELECT COUNT(*) as total FROM banned_ips WHERE is_active = TRUE'
        );
        const total = (countResult as any)[0].total;

        return new Response(JSON.stringify({ 
          success: true, 
          data: rows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error fetching banned IPs:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch banned IPs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};