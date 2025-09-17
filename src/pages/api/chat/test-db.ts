import type { APIRoute } from 'astro';
const pool = require('../../../lib/database-mysql.js') as any;

export const GET: APIRoute = async () => {
  try {
    // Verificar se existem conversas na tabela
    const [rows] = await pool.execute('SELECT * FROM chat_conversations ORDER BY created_at DESC LIMIT 5') as any[];
    
    // Contar total de conversas
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM chat_conversations') as any[];
    const total = (countResult as any)[0].total;
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Conexão MySQL funcionando',
      total_conversations: total,
      recent_conversations: rows
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Erro na conexão MySQL',
      error: (error as any).message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};