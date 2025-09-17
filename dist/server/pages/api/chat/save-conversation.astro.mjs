import { d as dbOperations } from '../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;
const POST = async ({ request, clientAddress }) => {
  console.log("🎯🎯🎯 SAVE-CONVERSATION API FUNCIONANDO! 🎯🎯🎯");
  console.log("Request method:", request.method);
  console.log("Request URL:", request.url);
  const clientIP = clientAddress || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "127.0.0.1";
  console.log("🌐 IP do cliente capturado:", clientIP);
  try {
    const body = await request.text();
    console.log("📝 Body recebido:", body.substring(0, 200) + "...");
    if (!body || body.trim() === "") {
      return new Response(JSON.stringify({
        success: false,
        error: "Corpo da requisição vazio"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
    const requestData = JSON.parse(body);
    console.log("📋 Dados parseados:", JSON.stringify(requestData, null, 2));
    const { sessionId, messages, isExpanded, timestamp } = requestData;
    if (!sessionId || !messages) {
      return new Response(JSON.stringify({
        success: false,
        error: "SessionId e messages são obrigatórios"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
    let detectedEmail = null;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    for (const message of messages) {
      if (message.content) {
        const emailMatch = message.content.match(emailRegex);
        if (emailMatch) {
          detectedEmail = emailMatch[0];
          console.log("📧 Email detectado:", detectedEmail);
          break;
        }
      }
    }
    let finalSessionId = sessionId;
    if (detectedEmail) {
      try {
        const existingConversations = await dbOperations.getConversationsByIdentifier(detectedEmail);
        if (existingConversations.length > 0) {
          finalSessionId = existingConversations[0].session_id;
          console.log("🔗 Agrupando com conversa existente:", finalSessionId);
        }
      } catch (error) {
        console.error("Erro ao buscar conversas por email:", error);
      }
    }
    const clientInfo = { name: null, phone: null, address: null, problem: null };
    const conversationData = {
      session_id: finalSessionId,
      messages: JSON.stringify(messages),
      // Converter array para JSON string
      client_email: detectedEmail,
      client_name: clientInfo.name,
      client_phone: clientInfo.phone,
      client_address: clientInfo.address,
      client_problem: clientInfo.problem,
      client_ip: clientIP,
      // Incluir IP capturado
      is_expanded: isExpanded || false,
      status: "active"
    };
    try {
      const existingConversation = await dbOperations.getConversationBySessionId(finalSessionId);
      if (existingConversation) {
        let existingMessages = [];
        try {
          existingMessages = JSON.parse(existingConversation.messages || "[]");
        } catch (e) {
          existingMessages = [];
        }
        const allMessages = [...existingMessages, ...messages];
        conversationData.messages = JSON.stringify(allMessages);
        await dbOperations.updateConversation(finalSessionId, conversationData);
        console.log("✅ Conversa atualizada e mensagens mescladas:", finalSessionId);
      } else {
        await dbOperations.saveConversation(conversationData);
        console.log("✅ Nova conversa salva:", finalSessionId);
      }
      const responseData = {
        success: true,
        message: "Conversation saved successfully",
        extractedData: clientInfo,
        sessionId: finalSessionId,
        debug: {
          hasName: !!clientInfo.name,
          hasPhone: !!clientInfo.phone,
          hasAddress: !!clientInfo.address,
          hasProblem: !!clientInfo.problem,
          messagesCount: messages.length,
          firstMessage: messages[0]?.content || "No content",
          extractionWorked: clientInfo !== null,
          clientInfoRaw: clientInfo,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          apiCalled: true,
          testField: "SAVE_CONVERSATION_FUNCIONANDO_PERFEITAMENTE"
        }
      };
      console.log("📤 RESPOSTA FINAL SENDO ENVIADA:", JSON.stringify(responseData, null, 2));
      return new Response(JSON.stringify(responseData), {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    } catch (dbError) {
      console.error("❌ Erro ao salvar no banco:", dbError);
      return new Response(JSON.stringify({
        success: false,
        error: "Erro ao salvar conversa no banco de dados"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }
  } catch (error) {
    console.error("❌ Erro geral na API save-conversation:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Erro interno do servidor"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
