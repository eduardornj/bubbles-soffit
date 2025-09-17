import type { APIRoute } from 'astro';
import { dbOperations } from '../../../lib/database-mysql.js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const searchType = searchParams.get('searchType') || 'all';
    
    console.log('📋 Listando conversas - Página:', page, 'Limite:', limit, 'Status:', status, 'Busca:', search, 'Tipo:', searchType);
    
    // Buscar conversas
    const conversations = await dbOperations.getAllConversations({
      page,
      limit,
      status: status === 'all' ? null : status,
      search: search || null,
      searchType: searchType || 'all'
    }) as any;
    
    // Buscar estatísticas
    const stats = await dbOperations.getConversationStats() as any;
    
    return new Response(JSON.stringify({
      success: true,
      conversations: conversations.data,
      pagination: {
        page,
        limit,
        total: conversations.total,
        totalPages: Math.ceil(conversations.total / limit)
      },
      stats
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API conversations:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: (error as any).message,
      details: (error as any).stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

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