import type { APIRoute } from 'astro';
import { dbOperations } from '../../../../lib/database-mysql.js';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Session ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('🔍 Buscando conversa:', sessionId);
    
    // Buscar conversa específica
    const conversation = await dbOperations.getConversationBySessionId(sessionId);
    
    if (!conversation) {
      console.log('❌ Conversa não encontrada:', sessionId);
      return new Response(JSON.stringify({
        success: false,
        error: 'Conversation not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('✅ Conversa encontrada:', sessionId);
    
    // Processar mensagens se existirem
    let messages = [];
    if (conversation.messages) {
      try {
        messages = typeof conversation.messages === 'string' 
          ? JSON.parse(conversation.messages) 
          : conversation.messages;
      } catch (error) {
        console.error('Erro ao processar mensagens:', error);
        messages = [];
      }
    }
    
    const responseData = {
      success: true,
      conversation: {
        ...conversation,
        messages: messages,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        last_activity: conversation.last_activity
      }
    };
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar conversa:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
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