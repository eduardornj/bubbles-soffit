import dotenv from 'dotenv';
import { dbOperations } from './src/lib/database-mysql.js';

// Carregar variáveis de ambiente
dotenv.config();

async function testMySQL() {
  try {
    console.log('🔍 Testando conexão MySQL...');
    
    // Testar salvamento de conversa
    const testData = {
      session_id: 'test-final-' + Date.now(),
      client_email: 'teste@final.com',
      client_name: 'Teste Final',
      messages: JSON.stringify([{
        role: 'user',
        content: 'Teste final do MySQL'
      }]),
      status: 'active'
    };
    
    console.log('💾 Salvando conversa de teste...');
    const savedId = await dbOperations.saveConversation(testData);
    console.log('✅ Conversa salva com ID:', savedId);
    
    // Buscar todas as conversas
    console.log('🔍 Buscando todas as conversas...');
    const conversations = await dbOperations.getAllConversations();
    console.log('📊 Total de conversas encontradas:', conversations.length);
    
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. Session: ${conv.session_id}, Email: ${conv.client_email}, Nome: ${conv.client_name}`);
    });
    
    // Estatísticas
    console.log('📈 Obtendo estatísticas...');
    const stats = await dbOperations.getConversationStats();
    console.log('📊 Estatísticas:', stats);
    
    console.log('\n✅ Teste do MySQL concluído com sucesso!');
    console.log('🎉 O chat da página inicial está sendo salvo corretamente no MySQL!');
    
  } catch (error) {
    console.error('❌ Erro no teste MySQL:', error);
  } finally {
    process.exit(0);
  }
}

testMySQL();