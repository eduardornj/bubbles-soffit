import { d as dbOperations } from '../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;
const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const ip = url.searchParams.get("ip");
    const phone = url.searchParams.get("phone");
    const email = url.searchParams.get("email");
    const identifier = url.searchParams.get("identifier");
    console.log("🔍 Buscando histórico:", { ip, phone, email, identifier });
    let conversations = [];
    if (identifier) {
      conversations = await dbOperations.getConversationsByIdentifier(identifier);
    } else if (ip || phone || email) {
      conversations = await dbOperations.getConversationHistory(ip, phone, email);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: "Pelo menos um parâmetro de busca é obrigatório (ip, phone, email ou identifier)"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const processedConversations = conversations.map((conv) => {
      let messages = [];
      if (conv.messages) {
        try {
          messages = typeof conv.messages === "string" ? JSON.parse(conv.messages) : conv.messages;
        } catch (error) {
          console.error("Erro ao processar mensagens:", error);
          messages = [];
        }
      }
      return {
        ...conv,
        messages,
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
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Erro interno do servidor"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
