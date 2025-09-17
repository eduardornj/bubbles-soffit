import { d as dbOperations } from '../../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;
const GET = async ({ params }) => {
  try {
    const { sessionId } = params;
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Session ID is required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    console.log("🔍 Buscando conversa:", sessionId);
    const conversation = await dbOperations.getConversationBySessionId(sessionId);
    if (!conversation) {
      console.log("❌ Conversa não encontrada:", sessionId);
      return new Response(JSON.stringify({
        success: false,
        error: "Conversation not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    console.log("✅ Conversa encontrada:", sessionId);
    let messages = [];
    if (conversation.messages) {
      try {
        messages = typeof conversation.messages === "string" ? JSON.parse(conversation.messages) : conversation.messages;
      } catch (error) {
        console.error("Erro ao processar mensagens:", error);
        messages = [];
      }
    }
    const responseData = {
      success: true,
      conversation: {
        ...conversation,
        messages,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        last_activity: conversation.last_activity
      }
    };
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar conversa:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
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
