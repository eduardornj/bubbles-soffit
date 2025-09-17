import { d as dbOperations } from '../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;
const PUT = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, status } = data;
    if (!sessionId || !status) {
      return new Response(JSON.stringify({
        success: false,
        error: "Session ID e status são obrigatórios"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    console.log("🔄 Alterando status da conversa:", sessionId, "para:", status);
    const existingConversation = await dbOperations.getConversationBySessionId(sessionId);
    if (!existingConversation) {
      return new Response(JSON.stringify({
        success: false,
        error: "Conversa não encontrada"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const updateData = {
      client_name: existingConversation.client_name || "",
      client_phone: existingConversation.client_phone || "",
      client_email: existingConversation.client_email || "",
      client_problem: existingConversation.client_problem || "",
      status
    };
    await dbOperations.updateConversationFields(sessionId, updateData);
    console.log("✅ Status da conversa alterado com sucesso:", sessionId, "para:", status);
    return new Response(JSON.stringify({
      success: true,
      message: "Status da conversa alterado com sucesso",
      data: { sessionId, status }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Erro ao alterar status da conversa:", error);
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
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
