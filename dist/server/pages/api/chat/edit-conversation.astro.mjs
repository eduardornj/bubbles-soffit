import { d as dbOperations } from '../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;
const PUT = async ({ request }) => {
  try {
    const data = await request.json();
    const { sessionId, client_name, client_phone, client_email, client_problem } = data;
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
    console.log("📝 Editando conversa:", sessionId, data);
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
      client_name: client_name || existingConversation.client_name || "",
      client_phone: client_phone || existingConversation.client_phone || "",
      client_email: client_email || existingConversation.client_email || "",
      client_problem: client_problem || existingConversation.client_problem || "",
      status: existingConversation.status || "active"
    };
    await dbOperations.updateConversationFields(sessionId, updateData);
    console.log("✅ Conversa editada com sucesso:", sessionId);
    return new Response(JSON.stringify({
      success: true,
      message: "Informações do cliente atualizadas com sucesso",
      data: updateData
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Erro ao editar conversa:", error);
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
