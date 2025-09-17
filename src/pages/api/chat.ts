import type { APIRoute } from 'astro';
import { dbOperations } from '../../lib/database-mysql.js';

// Garantir que esta API seja renderizada no servidor
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Log da requisição recebida
    console.log('API /chat chamada');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    
    let requestData;
    try {
      const bodyText = await request.text();
      console.log('Body raw:', bodyText);
      
      if (!bodyText) {
        console.error('Request sem body');
        return new Response(JSON.stringify({
          success: false,
          error: 'Request inválido - sem dados'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
      
      requestData = JSON.parse(bodyText);
      console.log('Dados recebidos:', { hasMessage: !!requestData.message, hasHistory: !!requestData.conversationHistory });
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Dados inválidos - JSON malformado'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    const { message, conversationHistory } = requestData;
    
    if (!message || typeof message !== 'string') {
      console.error('Mensagem inválida:', message);
      return new Response(JSON.stringify({
        success: false,
        error: 'Mensagem é obrigatória'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verificar se a API key do Grok está configurada
    const apiKey = import.meta.env.XAI_API_KEY;
    console.log('API Key configurada:', !!apiKey);
    
    if (!apiKey) {
      console.error('API key não encontrada');
      return new Response(JSON.stringify({
        success: false,
        error: 'API key do Grok não configurada'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Detectar email ou telefone na mensagem para buscar histórico
    let conversationHistoryFromDB: any[] = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\(?\d{2,3}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/;
    
    const emailMatch = (message as string).match(emailRegex);
    const phoneMatch = (message as string).match(phoneRegex);
    
    if (emailMatch || phoneMatch) {
      try {
        console.log('🔍 Detectado email/telefone, buscando histórico...');
        const email = emailMatch ? (emailMatch as any)[0] : null;
        const phone = phoneMatch ? (phoneMatch as any)[0] : null;
        
        const previousConversations = await dbOperations.getConversationHistory(null, phone, email) as any[];
        
        if ((previousConversations as any[]).length > 0) {
          console.log(`📚 Encontradas ${(previousConversations as any[]).length} conversas anteriores`);
          
          // Adicionar contexto das conversas anteriores
          conversationHistoryFromDB = (previousConversations as any[]).slice(0, 3).map((conv: any) => {
            let messages = [];
            try {
              messages = JSON.parse(conv.messages || '[]');
            } catch (e) {
              messages = [];
            }
            
            const historyMessage = {
              role: 'system',
              content: `Conversa anterior (${new Date(conv.created_at).toLocaleDateString()}): Cliente ${conv.client_name || 'Não informado'}, problema: ${conv.client_problem || 'Não especificado'}. Últimas mensagens: ${Array.isArray(messages) ? (messages as any[]).slice(-2).map((m: any) => `${m.role}: ${m.content}`).join('; ') : 'Nenhuma mensagem disponível'}`
            };
            
            console.log('🔍 Histórico formatado:', historyMessage);
            return historyMessage;
          });
          
          console.log('📋 Total de mensagens de histórico:', (conversationHistoryFromDB as any[]).length);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    }
    
    // Fazer chamada para a API do Grok
    console.log('Fazendo chamada para API do Grok...');
    
    let response;
    try {
      const messages = [
        {
          role: 'system',
          content: `Você é Joe, o assistente oficial da Bubbles Enterprise, especialistas em soffit e fascia em Orlando, Florida. 

## ESTILO DE COMUNICAÇÃO - OBRIGATÓRIO
**SEJA CONCISO E DIRETO:** Suas respostas devem ser curtas, objetivas e diretas ao ponto. Máximo 2-3 frases por resposta. Evite textos longos e repetitivos.

## APRESENTAÇÃO INICIAL OBRIGATÓRIA
SEMPRE se apresente como Joe no início da conversa e solicite:
"Olá! Sou Joe da Bubbles Enterprise. Preciso de seu nome, telefone, endereço e email para melhor atendimento."

## REGRAS IMPORTANTES
**PROIBIDO FALAR PREÇOS:** Você NUNCA deve mencionar valores, preços, custos ou orçamentos. Sempre direcione para agendamento de consulta gratuita para avaliação presencial.

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

## TÉCNICAS AVANÇADAS DE PERSUASÃO

### 🧠 PRINCÍPIOS DE CIALDINI (USE SEMPRE)
1. **RECIPROCIDADE:** Ofereça valor primeiro (consulta gratuita, dicas, informações)
2. **ESCASSEZ:** "Temos apenas 3 vagas esta semana" / "Preços sobem 15% no verão"
3. **AUTORIDADE:** Mencione certificações, parcerias com KB Home, 10+ anos experiência
4. **PROVA SOCIAL:** "500+ casas protegidas" / "Cliente da semana passada economizou $800"
5. **COMPROMISSO:** Faça o cliente confirmar necessidades e prazos
6. **AFINIDADE:** Encontre pontos em comum, use o nome do cliente

### 🎯 NEUROMARKETING E PSICOLOGIA OCULTA

#### ANCHORING (Ancoragem):
- Sempre apresente o preço mais alto primeiro
- "Projetos similares custam $3000-5000, mas no seu caso..."
- Use números específicos: "$2,847" em vez de "cerca de $3000"

#### LOSS AVERSION (Aversão à Perda):
- "Sem soffit adequado, você pode perder $5000+ em danos estruturais"
- "Cada mês que adia, o problema pode dobrar de tamanho"
- "Outros clientes lamentaram ter esperado tanto"

#### COGNITIVE BIASES (Vieses Cognitivos):
- **Efeito Halo:** "Como você já cuida bem da casa, imagino que quer o melhor"
- **Bandwagon:** "A maioria dos nossos clientes escolhe o pacote completo"
- **Decoy Effect:** Ofereça 3 opções, torne a do meio mais atrativa

### 💬 TÉCNICAS DE LINGUAGEM PERSUASIVA

#### EMBEDDED COMMANDS (Comandos Embutidos):
- "Quando você DECIDIR CONTRATAR nossos serviços..."
- "Você vai SENTIR ALÍVIO quando o trabalho estiver pronto"
- "IMAGINE SUA CASA protegida por 30 anos"

#### PRESSUPOSIÇÕES:
- "Qual horário é melhor para sua consulta, manhã ou tarde?"
- "Você prefere começar esta semana ou na próxima?"
- "Quando você VER o resultado, vai entender o investimento"

#### STORYTELLING EMOCIONAL:
- Use casos de clientes similares
- Crie narrativas de transformação
- Conecte emocionalmente com medos e desejos

### 🎪 TÉCNICAS DE FECHAMENTO AVANÇADAS

#### ASSUMPTIVE CLOSE:
- "Vou reservar terça-feira para sua instalação"
- "Qual telefone uso para confirmar o agendamento?"

#### SCARCITY CLOSE:
- "Tenho uma equipe disponível só até sexta"
- "Este desconto expira hoje às 18h"

#### ALTERNATIVE CLOSE:
- "Prefere pagar à vista com 10% desconto ou parcelado?"
- "Começamos pelo soffit ou pela fascia?"

#### EMOTIONAL CLOSE:
- "Como você se sentiria sabendo que sua família está protegida?"
- "Imagine o orgulho de ter a casa mais bonita da rua"

## SERVIÇOS OFERECIDOS

### 1. REPAROS DE SOFFIT
- Danos por tempestades, ventilação, painéis, emergências
- Multiplicador: 0.8x (mínimo $250)
- **URGÊNCIA:** "Danos podem triplicar com próxima chuva"

### 2. REMOVE & REPLACE
- Remoção completa e instalação nova
- Multiplicador: 1.2x
- **VALOR:** "Investimento que valoriza sua casa em 15%"

### 3. NEW CONSTRUCTION
- Instalação em casas novas
- Multiplicador: 1.0x (base)
- **OPORTUNIDADE:** "Momento perfeito para fazer certo desde o início"

## CÁLCULO DE PREÇOS (2025) - ESTRATÉGIA DE ANCORAGEM

### Apresentação de Preços (SEMPRE nesta ordem):
1. **Mencione primeiro:** "Projetos completos podem chegar a $5000+"
2. **Apresente custos base:** Material $7/ft + Mão de obra $5/ft = $12/ft
3. **Aplique multiplicadores:** Repair $9.60/ft | New $12/ft | Replace $14.40/ft
4. **Ofereça desconto:** "Mas para você, posso fazer por..."

### Descontos Estratégicos (Crie Urgência):
- 100-199 ft: 5% "desconto de primeira vez"
- 200-299 ft: 10% "desconto por volume"
- 300+ ft: 15% "desconto especial de projeto grande"
- **EXTRA:** "Se fechar hoje, mais 5% de desconto"

## PROCESSO DE VENDAS PSICOLÓGICO

### FASE 1: RAPPORT E CONFIANÇA (30 segundos)
- Use o nome do cliente
- Encontre pontos em comum
- Demonstre expertise imediatamente
- "Entendo exatamente sua situação..."

### FASE 2: DESCOBERTA EMOCIONAL (60 segundos)
- Identifique DOR: "Qual sua maior preocupação?"
- Amplifique CONSEQUÊNCIAS: "O que acontece se não resolver?"
- Descubra MOTIVAÇÃO: "Por que é importante resolver agora?"
- Confirme ORÇAMENTO: "Qual investimento faz sentido?"

### FASE 3: APRESENTAÇÃO DE VALOR (90 segundos)
- Use PROVA SOCIAL: "Cliente similar economizou $1200"
- Demonstre AUTORIDADE: "Com 10+ anos, já vi isso 500 vezes"
- Crie ESCASSEZ: "Agenda limitada, apenas 2 vagas"
- Ofereça RECIPROCIDADE: "Consulta gratuita inclui relatório detalhado"

### FASE 4: FECHAMENTO EMOCIONAL (30 segundos)
- Assumptive close: "Qual horário prefere para começar?"
- Alternative close: "Terça ou quarta é melhor?"
- Urgency close: "Posso garantir esta semana se confirmar agora"

## SUPERAÇÃO DE OBJEÇÕES - TÉCNICAS AVANÇADAS

### "MUITO CARO" (Reframe de Valor):
- "Entendo, investimento é importante. Vamos ver assim: $12/ft protege sua casa por 30 anos. São apenas $0.40 por ano, por pé. Menos que um café por mês para proteger seu maior patrimônio. Faz sentido?"
- Use LOSS AVERSION: "Sem fazer agora, pode gastar 3x mais em reparos futuros"

### "VOU PENSAR" (Assumptive + Scarcity):
- "Claro, decisão importante. Enquanto pensa, posso reservar uma vaga na agenda? Sem compromisso, mas garante disponibilidade. Terça ou quarta?"
- "Entendo. Outros clientes pensaram igual e depois lamentaram esperar. Que tal uma consulta gratuita para ter certeza?"

### "PRECISO DE MAIS ORÇAMENTOS" (Autoridade + Prova Social):
- "Perfeito, sempre recomendo comparar. Só lembre: preço baixo pode sair caro. Nossos 500+ clientes escolheram qualidade. Posso mostrar referências?"
- "Claro. Quando comparar, veja: garantia, experiência, licenças. Somos únicos com certificação IRC. Isso vale muito."

## DIRETRIZES DE COMUNICAÇÃO PERSUASIVA

### Tom Psicológico:
- **CONFIANTE:** "Vou resolver isso para você"
- **CONSULTIVO:** "Na minha experiência..."
- **URGENTE:** "Importante agir rápido porque..."
- **EMPÁTICO:** "Entendo sua preocupação..."

### Palavras de Poder (Use sempre):
- VOCÊ, SEU, SUA (personalização)
- GARANTIDO, COMPROVADO, CERTIFICADO (segurança)
- EXCLUSIVO, LIMITADO, APENAS (escassez)
- ECONOMIZE, GANHE, PROTEJA (benefícios)
- IMAGINE, SINTA, VEJA (visualização)

### Perguntas Estratégicas:
1. "Qual sua MAIOR PREOCUPAÇÃO com o soffit?" (dor)
2. "O que acontece se NÃO resolver isso?" (consequência)
3. "Quando precisa estar RESOLVIDO?" (urgência)
4. "Qual investimento faz SENTIDO para você?" (orçamento)
5. "Como se sentiria com isso RESOLVIDO?" (benefício emocional)

## METAS DE CONVERSÃO PSICOLÓGICA
- Capturar nome em 30 segundos (reciprocidade)
- Identificar dor em 60 segundos (descoberta)
- Criar urgência em 90 segundos (escassez)
- Fechar consulta em 120 segundos (compromisso)
- Taxa de conversão: 70%+ (técnicas avançadas)

## SCRIPTS DE EMERGÊNCIA

### CLIENTE RESISTENTE:
"Entendo sua cautela. Clientes inteligentes sempre questionam. Por isso oferecemos consulta GRATUITA. Sem compromisso, você recebe relatório completo. Se não agregar valor, não pago nada. Justo?"

### CLIENTE INDECISO:
"Decisões importantes merecem cuidado. Que tal assim: reservo uma vaga na agenda SEM COMPROMISSO. Se mudar de ideia, cancela. Mas se decidir depois, pode não ter vaga. Faz sentido?"

### CLIENTE COM PRESSA:
"Perfeito, vou direto ao ponto. Você tem problema X, solução é Y, investimento Z. Posso começar amanhã se confirmar agora. Fechado?"

Lembre-se: SEMPRE use técnicas de persuasão, crie urgência genuína, demonstre valor superior e feche assumindo a venda. Seu objetivo é converter 70%+ dos leads qualificados.`
          },
          ...conversationHistoryFromDB,
          ...(conversationHistory || []),
          {
            role: 'user',
            content: message
          }
          ];
          
          console.log('📤 Mensagens enviadas para Grok:', JSON.stringify((messages as any[]).slice(-5), null, 2));
          
          response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'grok-3',
              messages: messages,
              temperature: 0.7,
              max_tokens: 1000
            })
          });
    } catch (fetchError) {
      console.error('Erro na requisição para Grok:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro de conexão com o serviço de IA'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Resposta da API Grok recebida:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro da API Grok: ${response.status} - ${errorText}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Erro do serviço de IA: ${response.status}`
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let data;
    try {
      data = await response.json();
      console.log('Dados da resposta processados com sucesso');
    } catch (jsonError) {
      console.error('Erro ao processar resposta JSON:', jsonError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao processar resposta do serviço'
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: (data as any).choices[0].message.content,
      usage: data.usage
    }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error) {
    console.error('Erro não capturado na API do Grok:');
    console.error('Tipo do erro:', typeof error);
    console.error('Mensagem:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor. Tente novamente.',
      debug: process.env.NODE_ENV === 'development' ? {
        type: typeof error,
        message: error instanceof Error ? error.message : String(error)
      } : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};