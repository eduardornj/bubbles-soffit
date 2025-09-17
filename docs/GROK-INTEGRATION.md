# 🤖 Integração Grok AI - Bubbles Enterprise

## 🎯 Visão Geral da Integração

Este documento detalha a implementação completa do **Grok AI da xAI** no website da Bubbles Enterprise, criando o primeiro chatbot inteligente especializado em soffit e fascia em Orlando, Florida.

---

## 🚀 Grok 4 - Capacidades Avançadas

### 🧠 Inteligência de Ponta
- **Grok 4** - O modelo mais inteligente do mundo <mcreference link="https://x.ai/news/grok-4" index="5">5</mcreference>
- **Native Tool Use** - Uso nativo de ferramentas integradas <mcreference link="https://x.ai/news/grok-4" index="5">5</mcreference>
- **Real-time Search** - Busca em tempo real integrada <mcreference link="https://x.ai/news/grok-4" index="5">5</mcreference>
- **Multimodal** - Processamento de texto, imagem e voz <mcreference link="https://x.ai/grok" index="4">4</mcreference>
- **Context Window** - 256,000 tokens de contexto <mcreference link="https://docs.x.ai/docs/tutorial" index="1">1</mcreference>

### 🛠️ Funcionalidades Específicas
- **Reasoning** - Pensamento lógico avançado
- **Vision** - Análise de imagens de soffit/fascia
- **Voice Mode** - Interação por voz com clientes
- **Structured Outputs** - Respostas organizadas <mcreference link="https://docs.x.ai/docs/tutorial" index="1">1</mcreference>

---

## 🔑 Configuração da API

### Credenciais
```env
# .env
XAI_API_KEY=xai-ECbo2VeJaos5b7zNal3gYaOU1Zfn09NvQG3ujzRfjDwSEo0s2pBw3zEQAsx3MQjh9Yst1jONVaRHEJ80
```

### Setup Inicial
```typescript
// src/lib/grok-client.ts
import { Client } from 'xai-sdk';

const client = new Client({
  api_key: process.env.XAI_API_KEY,
  timeout: 3600, // Timeout estendido para modelos de reasoning
});

export { client };
```

---

## 🏗️ Implementação do Chatbot

### 1. API Endpoint (Astro)
```typescript
// src/pages/api/chat.ts
import type { APIRoute } from 'astro';
import { client } from '../../lib/grok-client';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message, conversationHistory } = await request.json();
    
    const chat = client.chat.create({ model: 'grok-4' });
    
    // System prompt especializado - ATUALIZADO 2025
    chat.append({
      role: 'system',
      content: `Você é o assistente oficial da Bubbles Enterprise, especialistas em soffit e fascia em Orlando, Florida.
      
      ## INFORMAÇÕES DA EMPRESA
      **Nome:** Bubbles Enterprise
      **Especialidade:** Soffit & Fascia Specialists
      **Localização:** Orlando, Florida
      **Telefone:** (407) 715-1790
      **Experiência:** 10+ anos no mercado
      **Área de Atendimento:** Orlando e Central Florida
      
      ## NOSSA HISTÓRIA E CREDENCIAIS
      - 500+ casas protegidas em Orlando
      - Instalação em 1-3 dias
      - 100% taxa de satisfação
      - 30+ anos de garantia em materiais
      - Parcerias com KB Home e DR Horton
      - Licenciados e segurados
      - Certificados IRC Section 806 e NAHB
      
      ## SERVIÇOS OFERECIDOS
      
      ### 1. REPAROS DE SOFFIT
      - Danos por tempestades, ventilação, painéis, emergências
      - Multiplicador: 0.8x (mínimo $250)
      - Quando necessário: danos visíveis, infiltração, ventilação inadequada
      
      ### 2. REMOVE & REPLACE
      - Remoção completa e instalação premium
      - Multiplicador: 1.3x
      - Ideal para sistemas antigos ou extensivamente danificados
      
      ### 3. NEW CONSTRUCTION
      - Instalações para casas novas e adições
      - Multiplicador: 1.0x
      - Conformidade com códigos
      
      ## MATERIAIS ESPECIALIZADOS
      - **Aluminum Soffit:** Premium, 30+ anos durabilidade, ideal para clima Orlando
      - **Vinyl Soffit:** Econômico, 20+ anos durabilidade, baixa manutenção
      
      ## SISTEMA DE PREÇOS (NÃO REVELAR VALORES ESPECÍFICOS)
      - Mão de obra: $6.00 por pé linear
      - Taxa Florida: 6.5%
      - Desconto volume: 290+ pés = 5%
      
      ## INSTRUÇÕES COMPORTAMENTAIS
      
      ### SOBRE PREÇOS:
      1. NUNCA revele valores específicos de materiais ou mão de obra
      2. SEMPRE forneça faixas aproximadas (ex: "entre $X e $Y")
      3. Se não tiver medidas - ensine como medir ou direcione para calculadora
      4. Para cálculos precisos - sempre direcione para calculadora online
      5. NÃO ofereça descontos - direcione para calculadora se perguntado
      
      ### ARGUMENTOS DE VENDA:
      1. Especialização exclusiva - APENAS soffit e fascia
      2. Experiência comprovada - 10+ anos, 500+ casas
      3. Qualidade garantida - 100% satisfação, materiais premium
      4. Clima da Flórida - materiais específicos para Orlando
      5. Rapidez - instalação em 1-3 dias
      6. Transparência - preços honestos, sem surpresas
      
      ### FLUXO IDEAL:
      1. Identifique a necessidade (reparo/substituição/construção)
      2. Colete informações (localização, problema, medidas)
      3. Forneça informações relevantes sobre nossos diferenciais
      4. Estimativa aproximada em faixas
      5. Direcione para calculadora ou inspeção gratuita
      6. Colete contato para follow-up
      
      ### MEDIDAS NECESSÁRIAS:
      - Pés lineares: perímetro onde será instalado
      - Overhang: distância da parede até borda do telhado
      - Sem medidas: explique como medir ou ofereça inspeção
      
      SEMPRE pense em converter o lead, seja educativo mas persuasivo, e direcione para ações concretas
      
      ### EXEMPLOS DE RESPOSTAS:
      
      **Para pedidos de preço sem medidas:**
      "Para uma estimativa precisa, preciso dos pés lineares (perímetro) e overhang (distância da parede até a borda). Posso ensinar como medir ou você pode usar nossa calculadora online. Baseado na experiência, projetos residenciais típicos em Orlando ficam entre $800 e $2,500, mas o valor exato depende das suas medidas."
      
      **Para argumentar qualidade:**
      "Somos especialistas EXCLUSIVAMENTE em soffit e fascia há mais de 10 anos. Enquanto outros fazem de tudo um pouco, nós dominamos cada aspecto deste serviço. Já protegemos mais de 500 casas em Orlando, trabalhamos com KB Home e DR Horton, e oferecemos 100% de garantia de satisfação."
      
      **Para urgência/conversão:**
      "Problemas de soffit podem causar danos sérios se não tratados - infiltração, problemas de ventilação, entrada de pragas. Oferecemos inspeção gratuita e podemos resolver em 1-3 dias. Vale resolver agora antes que se torne um problema maior."
      
      Sempre sugira agendar uma inspeção gratuita para orçamento preciso e direcione para nossa calculadora online.`
    });
    
    // Adicionar histórico da conversa
    if (conversationHistory) {
      conversationHistory.forEach((msg: any) => {
        chat.append(msg);
      });
    }
    
    // Adicionar mensagem atual
    chat.append({ role: 'user', content: message });
    
    const response = await chat.sample();
    
    return new Response(JSON.stringify({
      success: true,
      message: response.content,
      usage: response.usage
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Grok API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### 2. Componente React do Chatbot
```tsx
// src/components/react/ChatBot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o assistente da Bubbles Enterprise. Como posso ajudá-lo com seus projetos de soffit e fascia hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-bubble-blue hover:bg-bubble-dark text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Abrir chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-bubble-blue text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Bubbles Enterprise</h3>
              <p className="text-sm opacity-90">Assistente Grok AI</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-bubble-dark p-1 rounded"
                aria-label="Minimizar chat"
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-bubble-dark p-1 rounded"
                aria-label="Fechar chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-bubble-blue text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-bubble-blue"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-bubble-blue hover:bg-bubble-dark text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensagem"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
```

---

## 🎯 Casos de Uso Específicos

### 1. Estimativas de Custo
**Prompt Especializado:**
```
Usuário: "Quanto custa para instalar soffit em uma casa de 150 pés lineares?"

Grok Response:
"Para uma instalação de soffit de 150 pés lineares em Orlando, aqui está a estimativa baseada nos custos médios de 2024:

💰 **Estimativa de Custos:**
- Materiais: 150 ft × $7.00 = $1,050
- Mão de obra: 150 ft × $5.00 = $750
- **Total Estimado: $1,800**

📋 **Fatores que podem afetar o preço:**
- Tipo de material escolhido
- Altura e acessibilidade
- Condição da estrutura existente
- Necessidade de reparos adicionais

🔍 **Próximo Passo:**
Recomendo agendar uma inspeção gratuita para um orçamento preciso. Posso ajudá-lo a agendar?"
```

### 2. Explicação de Serviços
**New Construction vs Remove & Replace:**
```
Usuário: "Qual a diferença entre new construction e remove & replace?"

Grok Response:
"Ótima pergunta! Deixe-me explicar os diferentes serviços da Bubbles Enterprise:

🏗️ **New Construction:**
- Instalação em casas novas
- Estrutura limpa, sem soffit anterior
- Processo mais rápido e direto
- Geralmente mais econômico

🔄 **Remove & Replace:**
- Remoção do soffit/fascia existente
- Inspeção da estrutura por baixo
- Reparos se necessário
- Instalação do novo sistema
- Mais trabalhoso, pode revelar problemas ocultos

🔧 **Repairs:**
- Correção de seções danificadas
- Manutenção preventiva
- Solução mais econômica para problemas localizados

Qual situação se aplica ao seu projeto?"
```

### 3. Coleta de Leads
```
Usuário: "Gostaria de um orçamento"

Grok Response:
"Perfeito! Ficarei feliz em ajudar você a obter um orçamento personalizado.

📋 **Para preparar sua estimativa, preciso de algumas informações:**

1. **Localização:** Em qual ZIP code de Orlando você está?
2. **Tipo de serviço:** New construction, remove & replace, ou repair?
3. **Medidas aproximadas:** Quantos pés lineares (se souber)?
4. **Tipo de propriedade:** Residencial ou comercial?

📞 **Contato:**
- Nome:
- Telefone:
- Email:
- Melhor horário para contato:

Com essas informações, posso fornecer uma estimativa inicial e agendar uma inspeção gratuita!"
```

---

## 📊 Analytics e Monitoramento

### Métricas de Performance
```typescript
// src/lib/chat-analytics.ts
export interface ChatMetrics {
  sessionId: string;
  messageCount: number;
  avgResponseTime: number;
  leadGenerated: boolean;
  serviceInquiry: string;
  estimateRequested: boolean;
}

export function trackChatMetrics(metrics: ChatMetrics) {
  // Implementar tracking com Google Analytics ou similar
  gtag('event', 'chat_interaction', {
    session_id: metrics.sessionId,
    message_count: metrics.messageCount,
    lead_generated: metrics.leadGenerated,
    service_type: metrics.serviceInquiry
  });
}
```

### Rate Limiting
```typescript
// src/lib/rate-limit.ts
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimiter.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minuto
    return true;
  }
  
  if (limit.count >= 10) { // 10 mensagens por minuto
    return false;
  }
  
  limit.count++;
  return true;
}
```

---

## 🔒 Segurança e Melhores Práticas

### Validação de Input
```typescript
// src/lib/input-validation.ts
import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  // Remove HTML tags e scripts maliciosos
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

export function validateMessage(message: string): boolean {
  // Validações básicas
  if (!message || message.trim().length === 0) return false;
  if (message.length > 1000) return false; // Limite de caracteres
  
  // Detectar spam patterns
  const spamPatterns = [
    /http[s]?:\/\//gi,
    /www\./gi,
    /@[a-zA-Z0-9]+/gi
  ];
  
  return !spamPatterns.some(pattern => pattern.test(message));
}
```

### Error Handling
```typescript
// src/lib/error-handler.ts
export class ChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export function handleChatError(error: unknown): Response {
  console.error('Chat Error:', error);
  
  if (error instanceof ChatError) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      code: error.code
    }), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: 'Erro interno do servidor'
  }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## 🚀 Deployment e Configuração

### Variáveis de Ambiente
```env
# Produção
XAI_API_KEY=xai-ECbo2VeJaos5b7zNal3gYaOU1Zfn09NvQG3ujzRfjDwSEo0s2pBw3zEQAsx3MQjh9Yst1jONVaRHEJ80
NODE_ENV=production
SITE_URL=https://bubblesenterprise.com

# Analytics
GA_TRACKING_ID=G-XXXXXXXXXX

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60000
```

### HostGator Configuration
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  vite: {
    define: {
      'process.env.XAI_API_KEY': JSON.stringify(process.env.XAI_API_KEY)
    }
  }
});
```

---

## 🛠️ Painel Administrativo Grok

### 📊 Dashboard de Controle
O painel administrativo oferece controle completo sobre o chatbot Grok:

```
/admin/grok/
├── Dashboard Principal - Métricas em tempo real
├── Configurações - System prompt e parâmetros
├── Histórico - Todas as conversas registradas
├── Analytics - Performance e insights
└── Treinamento - Templates e respostas
```

### ⚙️ Configurações Avançadas
```typescript
// src/types/grok-admin.ts
export interface GrokConfig {
  system_prompt: string;
  model: 'grok-4' | 'grok-3';
  temperature: number;
  max_tokens: number;
  pricing_data: PricingData;
  response_templates: ResponseTemplate[];
  auto_responses: AutoResponse[];
}

export interface PricingData {
  material_costs: {
    soffit_panel: number;
    j_channel: number;
    fascia: number;
    nails: number;
  };
  labor_cost_per_sqft: number;
  tax_rate: number;
  service_multipliers: {
    new_construction: number;
    remove_replace: number;
    repair: number;
  };
  volume_discounts: VolumeDiscount[];
}
```

### 📈 Analytics e Métricas
```typescript
// src/lib/grok-analytics.ts
export interface GrokMetrics {
  daily_conversations: number;
  avg_conversation_length: number;
  conversion_rate: number;
  top_questions: string[];
  response_time: number;
  user_satisfaction: number;
  lead_generation: number;
}

export interface ConversationAnalysis {
  id: string;
  timestamp: Date;
  user_messages: number;
  bot_messages: number;
  duration: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  converted_to_lead: boolean;
}
```

### 🎯 Funcionalidades do Admin

#### 1. **Editor de System Prompt**
- Interface visual para editar instruções
- Preview em tempo real das mudanças
- Versionamento de prompts
- Rollback para versões anteriores

#### 2. **Gerenciamento de Preços**
- Atualização dinâmica de custos
- Histórico de mudanças de preços
- Aplicação automática nas conversas
- Sincronização com calculadora

#### 3. **Templates de Resposta**
- Respostas pré-definidas para perguntas comuns
- Personalização por tipo de serviço
- A/B testing de respostas
- Otimização de conversão

#### 4. **Monitoramento em Tempo Real**
- Conversas ativas ao vivo
- Alertas de problemas
- Intervenção manual quando necessário
- Escalação para humanos

### 🔧 API de Administração
```typescript
// src/pages/api/admin/grok/config.ts
export const POST: APIRoute = async ({ request }) => {
  const { config } = await request.json();
  
  // Validar configurações
  const validatedConfig = validateGrokConfig(config);
  
  // Salvar no banco de dados
  await saveGrokConfig(validatedConfig);
  
  // Aplicar mudanças em tempo real
  await updateLiveConfig(validatedConfig);
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Configurações atualizadas com sucesso'
  }));
};
```

---

## 📈 Métricas de Sucesso

### KPIs do Chatbot
- 💬 **Engagement Rate:** > 60% dos visitantes interagem
- ⏱️ **Response Time:** < 3 segundos
- 🎯 **Lead Conversion:** > 15% das conversas geram leads
- ⭐ **Satisfaction Score:** > 4.5/5
- 📞 **Call Reduction:** 30% menos chamadas de informações básicas

### Relatórios Mensais
- Total de conversas
- Tópicos mais discutidos
- Horários de maior atividade
- Taxa de conversão de leads
- Feedback dos usuários

---

> 🤖 **Resultado Esperado:** Um chatbot inteligente que não apenas responde perguntas, mas ativamente gera leads qualificados e melhora a experiência do cliente, posicionando a Bubbles Enterprise como líder tecnológico em Orlando.

**🔗 Recursos Adicionais:**
- [Grok API Docs](https://docs.x.ai/)
- [xAI Console](https://console.x.ai/)
- [Grok Pricing](https://x.ai/api)