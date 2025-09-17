import { dbOperations } from './src/lib/database-mysql.js';

async function testHistory() {
  try {
    console.log('🧪 Testando busca de histórico por email...');
    
    // Criar conversa de teste
    const testData = {
      session_id: 'test-history-' + Date.now(),
      client_email: 'edu@uol.com',
      client_name: 'Eduardo Teste',
      client_phone: '(11) 99999-8888',
      client_problem: 'Problema com soffit - teste de histórico',
      messages: JSON.stringify([
        { role: 'user', content: 'Olá, preciso de ajuda com soffit' },
        { role: 'assistant', content: 'Olá Eduardo! Sou Joe da Bubbles Enterprise. Como posso ajudar?' }
      ]),
      status: 'active'
    };
    
    await dbOperations.saveConversation(testData);
    console.log('✅ Conversa de teste criada');
    
    // Buscar histórico por email
    const history = await dbOperations.getConversationHistory(null, null, 'edu@uol.com');
    console.log('📚 Histórico encontrado:', history.length, 'conversas');
    
    history.forEach((conv, i) => {
      console.log(`${i+1}. ${conv.session_id} - ${conv.client_name} - ${conv.client_problem}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testHistory();