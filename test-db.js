import { dbOperations } from './src/lib/database-mysql.js';

async function testDatabase() {
  try {
    console.log('🔍 Verificando conversas existentes...');
    const conversations = await dbOperations.getAllConversations();
    console.log('Total de conversas:', conversations.total);
    console.log('Conversas:', conversations.data.slice(0, 3));
    
    // Criar uma conversa de teste se não existir
    if (conversations.total === 0) {
      console.log('\n📝 Criando conversa de teste...');
      const testConversation = {
        session_id: 'test-session-123',
        client_name: 'João da Silva',
        client_email: 'joao@teste.com',
        client_phone: '(11) 99999-9999',
        client_address: 'São Paulo, SP',
        client_problem: 'Problema de teste com acentuação',
        client_ip: '127.0.0.1',
        status: 'active',
        messages: JSON.stringify([{
          role: 'user',
          content: 'Olá, preciso de ajuda'
        }])
      };
      
      await dbOperations.saveConversation(testConversation);
      console.log('✅ Conversa de teste criada!');
    }
    
    // Verificar novamente
    const updatedConversations = await dbOperations.getAllConversations();
    console.log('\n📊 Conversas após criação:');
    updatedConversations.data.forEach(conv => {
      console.log(`- ${conv.session_id}: ${conv.client_name} (${conv.client_email})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();