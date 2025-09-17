import type { APIRoute } from 'astro';
import { dbOperations } from '../../../lib/database-mysql.js';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const ip = url.searchParams.get('ip');
    const phone = url.searchParams.get('phone');
    const email = url.searchParams.get('email');
    const identifier = url.searchParams.get('identifier'); // Para busca única
    
    console.log('🔍 Buscando histórico:', { ip, phone, email, identifier });
    
    let conversations = [];
    
    if (identifier) {
      // Busca por um identificador único (IP, telefone ou email)
      conversations = await dbOperations.getConversationsByIdentifier(identifier) as any[];
    } else if (ip || phone || email) {
      // Busca por múltiplos critérios
      conversations = await dbOperations.getConversationHistory(ip, phone, email) as any[];
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Pelo menos um parâmetro de busca é obrigatório (ip, phone, email ou identifier)'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Processar mensagens para cada conversa
    const processedConversations = conversations.map(conv => {
      let messages = [];
      if (conv.messages) {
        try {
          messages = typeof conv.messages === 'string' 
            ? JSON.parse(conv.messages) 
            : conv.messages;
        } catch (error) {
          console.error('Erro ao processar mensagens:', error);
          messages = [];
        }
      }
      
      return {
        ...conv,
        messages: messages,
        message_count: messages.length,
        last_message: messages.length > 0 ? messages[messages.length - 1] : null
      };
    });
    
    console.log(`✅ Encontradas ${processedConversations.length} conversas`);
    
    return new Response(JSON.stringify({
      success: true,
      conversations: processedConversations,
      total: processedConversations.length,
      search_criteria: { ip, phone, email, identifier }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};