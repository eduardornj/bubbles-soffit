import mysql from 'mysql2/promise';

// Forçar renderização server-side
export const prerender = false;

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Cocacola10',
  database: 'bubbles_enterprise'
};

export async function GET({ url }) {
  try {
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = (page - 1) * limit;
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Buscar eventos de segurança com paginação
    const [events] = await connection.execute(
      `SELECT * FROM security_events ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`
    );
    
    // Contar total de registros
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM security_events`
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    await connection.end();
    
    return new Response(JSON.stringify({
      success: true,
      events: events || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar eventos de segurança:', error);
    return new Response(JSON.stringify({
      success: false,
      message: `Erro ao buscar eventos: ${error.message}`,
      events: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}