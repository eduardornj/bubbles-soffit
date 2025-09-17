// Variáveis globais para busca dinâmica
let searchTimeout;
let currentFilters = {};

// Funcionalidade dos filtros dinâmicos
document.addEventListener('DOMContentLoaded', function() {
  // Toggle filtros avançados
  const toggleAdvanced = document.getElementById('toggleAdvanced');
  const advancedForm = document.getElementById('advancedForm');
  
  if (toggleAdvanced && advancedForm) {
    toggleAdvanced.addEventListener('click', function() {
      const isVisible = advancedForm.style.display !== 'none';
      advancedForm.style.display = isVisible ? 'none' : 'block';
      const arrow = toggleAdvanced.querySelector('.toggle-arrow');
      if (arrow) {
        arrow.textContent = isVisible ? '▼' : '▲';
      }
    });
  }

  // Funcionalidade de seleção múltipla
  const selectAllBtn = document.getElementById('select-all-logs');
  const toggleSelectionBtn = document.getElementById('toggle-selection');
  const deleteSelectedBtn = document.getElementById('delete-selected');
  const logCheckboxes = document.querySelectorAll('.log-checkbox');
  
  if (toggleSelectionBtn) {
    toggleSelectionBtn.addEventListener('click', function() {
      const checkboxCells = document.querySelectorAll('.checkbox-cell');
      const selectAllCell = document.querySelector('#select-all-logs')?.parentElement;
      const isVisible = checkboxCells[0]?.style.display !== 'none';
      
      checkboxCells.forEach(cell => {
        cell.style.display = isVisible ? 'none' : 'table-cell';
      });
      
      if (selectAllCell) {
        selectAllCell.style.display = isVisible ? 'none' : 'table-cell';
      }
      
      this.textContent = isVisible ? '☑️ Ativar Seleção' : '❌ Desativar Seleção';
      
      if (isVisible) {
        logCheckboxes.forEach(cb => cb.checked = false);
        if (selectAllBtn) selectAllBtn.checked = false;
        updateDeleteButton();
      }
    });
  }
  
  if (selectAllBtn) {
    selectAllBtn.addEventListener('change', function() {
      logCheckboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
      });
      updateDeleteButton();
    });
  }
  
  logCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateDeleteButton();
      
      const checkedBoxes = document.querySelectorAll('.log-checkbox:checked');
      if (selectAllBtn) {
        selectAllBtn.checked = checkedBoxes.length === logCheckboxes.length;
      }
    });
  });
  
  function updateDeleteButton() {
    const checkedBoxes = document.querySelectorAll('.log-checkbox:checked');
    if (deleteSelectedBtn) {
      deleteSelectedBtn.style.display = checkedBoxes.length > 0 ? 'inline-block' : 'none';
      deleteSelectedBtn.textContent = `🗑️ Excluir Selecionados (${checkedBoxes.length})`;
    }
  }
  
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', async function() {
      const checkedBoxes = document.querySelectorAll('.log-checkbox:checked');
      const logIds = Array.from(checkedBoxes).map(cb => cb.value);
      
      if (logIds.length === 0) {
        alert('Nenhum log selecionado!');
        return;
      }
      
      if (!confirm(`Tem certeza que deseja excluir ${logIds.length} log(s) selecionado(s)?`)) {
        return;
      }
      
      try {
        this.disabled = true;
        this.textContent = '⏳ Excluindo...';
        
        const response = await fetch('/api/admin/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'delete_multiple',
            ids: logIds
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert(`✅ ${result.message}`);
          window.location.reload();
        } else {
          alert(`❌ Erro: ${result.error || 'Falha na exclusão'}`);
        }
      } catch (error) {
        console.error('Erro ao excluir logs:', error);
        alert('❌ Erro ao excluir logs. Tente novamente.');
      } finally {
        this.disabled = false;
        updateDeleteButton();
      }
    });
  }

  // Funcionalidade de exportação
  const exportBtn = document.getElementById('export-logs');
  if (exportBtn) {
    exportBtn.addEventListener('click', async function() {
      try {
        this.disabled = true;
        this.textContent = '⏳ Exportando...';
        
        const urlParams = new URLSearchParams(window.location.search);
        const exportUrl = '/api/admin/logs?' + urlParams.toString() + '&export=csv';
        
        const response = await fetch(exportUrl);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `logs_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          alert('✅ Logs exportados com sucesso!');
        } else {
          throw new Error('Falha na exportação');
        }
      } catch (error) {
        console.error('Erro ao exportar logs:', error);
        alert('❌ Erro ao exportar logs. Tente novamente.');
      } finally {
        this.disabled = false;
        this.textContent = '📊 Exportar CSV';
      }
    });
  }

  // Funcionalidade de salvar filtros
  const saveFiltersBtn = document.querySelector('.save-filters');
  if (saveFiltersBtn) {
    saveFiltersBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const form = document.getElementById('advancedForm');
      if (form) {
        const formData = new FormData(form);
        const filters = {};
        
        for (let [key, value] of formData.entries()) {
          if (value.trim() !== '') {
            filters[key] = value;
          }
        }
        
        localStorage.setItem('logs_filters', JSON.stringify(filters));
        alert('✅ Filtros salvos com sucesso!');
      }
    });
  }

  // Carregar filtros salvos
  const loadFiltersBtn = document.querySelector('.load-filters');
  if (loadFiltersBtn) {
    loadFiltersBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const savedFilters = localStorage.getItem('logs_filters');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          
          if (filters && typeof filters === 'object') {
            Object.keys(filters).forEach(key => {
              const input = document.querySelector(`[name="${key}"]`);
              if (input) {
                input.value = filters[key];
              }
            });
          }
        } catch (error) {
          console.error('Erro ao carregar filtros salvos:', error);
          localStorage.removeItem('logs_filters');
        }
        
        // Submeter formulário
        const form = document.getElementById('advancedForm');
        if (form) {
          form.submit();
        }
      }
    });
  }

  // Funcionalidade de limpeza de logs
  const cleanupButtons = document.querySelectorAll('.cleanup-btn');
  cleanupButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const type = this.dataset.type;
      const confirmMessage = this.dataset.confirm;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      try {
        // Mostrar indicador de carregamento
        this.disabled = true;
        this.innerHTML = '⏳ Processando...';
        
        const response = await fetch('/api/admin/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'clear',
            type: type
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert(`✅ ${result.message}`);
          // Recarregar a página para mostrar os logs atualizados
          window.location.reload();
        } else {
          alert(`❌ Erro: ${result.error || 'Falha na limpeza'}`);
        }
      } catch (error) {
        console.error('Erro ao limpar logs:', error);
        alert('❌ Erro ao processar limpeza. Tente novamente.');
      } finally {
        // Restaurar botão
        this.disabled = false;
        if (this.dataset.originalText) {
          this.innerHTML = this.dataset.originalText;
        } else {
          this.innerHTML = this.textContent.includes('antigos') ? '🧹 Limpar Logs Antigos' : '🗑️';
        }
      }
    });
  });

  // Funcionalidade de toggle de detalhes
  document.querySelectorAll('.toggle-details').forEach(button => {
    button.addEventListener('click', function() {
      const logId = this.dataset.logId;
      const detailsRow = document.getElementById(`details-${logId}`);
      
      if (detailsRow) {
        const isVisible = detailsRow.style.display !== 'none';
        detailsRow.style.display = isVisible ? 'none' : 'table-row';
        
        // Atualizar ícone do botão
        if (isVisible) {
          this.textContent = '👁️';
        } else {
          this.textContent = '🗑️';
        }
      }
    });
  });

  // Busca instantânea (usando a variável searchTimeout já declarada anteriormente)
  const liveSearchBtn = document.getElementById('live-search-btn');
  const searchInput = document.getElementById('search');
  let liveSearchMode = false;

  if (liveSearchBtn) {
    liveSearchBtn.addEventListener('click', function() {
      liveSearchMode = !liveSearchMode;
      
      if (liveSearchMode) {
        this.textContent = '❌ Desativar Busca Instantânea';
        this.classList.add('btn-primary');
        if (searchInput) {
          searchInput.placeholder = 'Digite para buscar instantaneamente...';
          searchInput.addEventListener('input', handleLiveSearch);
        }
      } else {
        this.textContent = '🔍 Busca Instantânea';
        this.classList.remove('btn-primary');
        if (searchInput) {
          searchInput.placeholder = 'Buscar em mensagens, IPs, caminhos...';
          searchInput.removeEventListener('input', handleLiveSearch);
        }
        clearTimeout(searchTimeout);
      }
    });
  }

  function handleLiveSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const form = document.getElementById('advancedForm');
      if (form) {
        form.submit();
      }
    }, 500); // Aguarda 500ms após parar de digitar
  }

  // Inicializar com checkboxes ocultos
  document.querySelectorAll('.checkbox-cell').forEach(cell => {
    cell.style.display = 'none';
  });
  if (document.getElementById('select-all-logs')) {
    document.getElementById('select-all-logs').parentElement.style.display = 'none';
  }
});