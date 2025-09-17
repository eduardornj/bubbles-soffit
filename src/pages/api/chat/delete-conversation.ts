import type { APIRoute } from 'astro';
import { dbOperations } from '../../../lib/database-mysql.js';

export const prerender = false;

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID é obrigatório'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('🗑️ Excluindo conversa:', sessionId);
    
    // Verificar se a conversa existe
    const existingConversation = await dbOperations.getConversationBySessionId(sessionId);
    if (!existingConversation) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Conversa não encontrada'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Excluir conversa
    const result = await dbOperations.deleteConversation(sessionId) as any;
    
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Falha ao excluir conversa'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    console.log('✅ Conversa excluída com sucesso:', sessionId);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Conversa excluída com sucesso'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao excluir conversa:', error as any);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor'
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};