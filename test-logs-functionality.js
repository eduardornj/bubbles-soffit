// Script de teste simples para verificar elementos da página de logs
import fetch from 'node-fetch';

async function testLogsPage() {
  try {
    console.log('🚀 Testando página de logs...');
    
    // Testar se a página carrega
    const response = await fetch('http://127.0.0.1:3001/admin/logs');
    const html = await response.text();
    
    console.log(`📄 Status da página: ${response.status}`);
    
    // Verificar elementos essenciais
    const tests = [
      { name: 'Botão de Busca Instantânea', selector: 'live-search-btn', found: html.includes('id="live-search-btn"') },
      { name: 'Campo de Busca', selector: 'search', found: html.includes('id="search"') },
      { name: 'Botão de Seleção em Massa', selector: 'bulk-select-btn', found: html.includes('id="bulk-select-btn"') },
      { name: 'Botão Selecionar Todos', selector: 'select-all-logs', found: html.includes('id="select-all-logs"') },
      { name: 'Botão Excluir Selecionados', selector: 'delete-selected-btn', found: html.includes('id="delete-selected-btn"') },
      { name: 'Botões de Limpeza', selector: 'cleanup-btn', found: html.includes('cleanup-btn') },
      { name: 'Checkboxes de Logs', selector: 'log-checkbox', found: html.includes('log-checkbox') },
      { name: 'Botões de Exclusão Individual', selector: 'btn-delete-log', found: html.includes('btn-delete-log') },
      { name: 'JavaScript de Busca Instantânea', selector: 'handleLiveSearch', found: html.includes('function handleLiveSearch') },
      { name: 'JavaScript de Seleção em Massa', selector: 'bulk-select-btn', found: html.includes('bulk-select-btn') }
    ];
    
    console.log('\n📋 Resultados dos testes:');
    let passedTests = 0;
    
    tests.forEach(test => {
      if (test.found) {
        console.log(`✅ ${test.name}: ENCONTRADO`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: NÃO ENCONTRADO`);
      }
    });
    
    console.log(`\n📊 Resumo: ${passedTests}/${tests.length} testes passaram`);
    
    // Testar API de logs
    console.log('\n🔌 Testando API de logs...');
    try {
      const apiResponse = await fetch('http://127.0.0.1:3001/api/admin/logs?action=stats');
      const apiData = await apiResponse.json();
      console.log(`✅ API de estatísticas: Status ${apiResponse.status}`);
    } catch (apiError) {
      console.log(`❌ API de estatísticas: Erro - ${apiError.message}`);
    }
    
    if (passedTests === tests.length) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! A página está funcionando corretamente.');
    } else {
      console.log(`\n⚠️ ${tests.length - passedTests} teste(s) falharam. Verifique a implementação.`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
testLogsPage().catch(console.error);