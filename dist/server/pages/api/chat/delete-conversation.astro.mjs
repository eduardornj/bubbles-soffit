import { d as dbOperations } from '../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;
const DELETE = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Session ID é obrigatório"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    console.log("🗑️ Excluindo conversa:", sessionId);
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
    const result = await dbOperations.deleteConversation(sessionId);
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Falha ao excluir conversa"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    console.log("✅ Conversa excluída com sucesso:", sessionId);
    return new Response(JSON.stringify({
      success: true,
      message: "Conversa excluída com sucesso"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Erro ao excluir conversa:", error);
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
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  OPTIONS,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
