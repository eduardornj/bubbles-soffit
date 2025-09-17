import { d as db } from '../../../chunks/db_ZSLCF821.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const DELETE = async ({ request }) => {
  try {
    const { days, severity, ip_address } = await request.json();
    let query = db.deleteFrom("security_logs");
    if (days && days > 0) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
      query = query.where("created_at", "<=", cutoffDate.toISOString());
    }
    if (severity && severity !== "all") {
      query = query.where("severity", "=", severity);
    }
    if (ip_address) {
      query = query.where("ip_address", "=", ip_address);
    }
    const result = await query.execute();
    await db.insertInto("security_logs").values({
      event_type: "logs_cleared",
      ip_address: "admin",
      severity: "medium",
      message: `Security logs cleared: ${result.numDeletedRows} records deleted`,
      details: JSON.stringify({
        days: days || "all",
        severity: severity || "all",
        ip_address: ip_address || "all",
        deleted_count: result.numDeletedRows
      }),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).execute();
    return new Response(JSON.stringify({
      success: true,
      deleted_count: result.numDeletedRows,
      message: `${result.numDeletedRows} security logs have been cleared`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error clearing logs:", error);
    return new Response(JSON.stringify({ error: "Failed to clear security logs" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
