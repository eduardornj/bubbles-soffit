import { p as pool } from '../../../chunks/database-mysql_DRjaBBVn.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

async function GET() {
  try {
    const [rows] = await pool.execute("SELECT * FROM chat_conversations ORDER BY created_at DESC LIMIT 5");
    const [countResult] = await pool.execute("SELECT COUNT(*) as total FROM chat_conversations");
    const total = countResult[0].total;
    return new Response(JSON.stringify({
      success: true,
      message: "Conexão MySQL funcionando",
      total_conversations: total,
      recent_conversations: rows
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: "Erro na conexão MySQL",
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
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
  OPTIONS
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
