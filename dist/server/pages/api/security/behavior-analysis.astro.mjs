import { d as db } from '../../../chunks/db_ZSLCF821.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const GET = async () => {
  try {
    const behaviorPatterns = await db.selectFrom("security_logs").select([
      "ip_address",
      db.fn.count("id").as("request_count"),
      db.fn.max("created_at").as("last_seen"),
      db.fn.sum(
        db.case().when("event_type", "=", "login_failed").then(1).else(0).end()
      ).as("failed_logins")
    ]).groupBy("ip_address").orderBy(db.fn.count("id"), "desc").limit(50).execute();
    return new Response(JSON.stringify(behaviorPatterns), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching behavior analysis:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch behavior analysis" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
