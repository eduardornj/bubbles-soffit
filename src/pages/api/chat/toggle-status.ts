import type { APIRoute } from 'astro';
import { dbOperations } from '../../../lib/database-mysql.js';

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, status } = data;
    
    if (!sessionId || !status) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID e status são obrigatórios'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('🔄 Alterando status da conversa:', sessionId, 'para:', status);
    
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
    
    // Atualizar status
    const updateData = {
      client_name: existingConversation.client_name || '',
      client_phone: existingConversation.client_phone || '',
      client_email: existingConversation.client_email || '',
      client_problem: existingConversation.client_problem || '',
      status: status
    };
    
    await dbOperations.updateConversationFields(sessionId, updateData);
    
    console.log('✅ Status da conversa alterado com sucesso:', sessionId, 'para:', status);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Status da conversa alterado com sucesso',
      data: { sessionId, status }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao alterar status da conversa:', error);
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};