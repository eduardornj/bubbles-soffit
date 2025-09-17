import { d as dbOperations } from '../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const prerender = false;
const GET = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const searchType = searchParams.get("searchType") || "all";
    console.log("📋 Listando conversas - Página:", page, "Limite:", limit, "Status:", status, "Busca:", search, "Tipo:", searchType);
    const conversations = await dbOperations.getAllConversations({
      page,
      limit,
      status: status === "all" ? null : status,
      search: search || null,
      searchType: searchType || "all"
    });
    const stats = await dbOperations.getConversationStats();
    return new Response(JSON.stringify({
      success: true,
      conversations: conversations.data,
      pagination: {
        page,
        limit,
        total: conversations.total,
        totalPages: Math.ceil(conversations.total / limit)
      },
      stats
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("❌ Erro na API conversations:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
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
