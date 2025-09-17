import { d as db } from '../../../chunks/db_ZSLCF821.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const GET = async () => {
  try {
    const highFailedLogins = await db.selectFrom("security_logs").select([
      "ip_address",
      db.fn.count("id").as("failed_logins")
    ]).where("event_type", "=", "login_failed").groupBy("ip_address").having(db.fn.count("id"), ">", 10).execute();
    for (const user of highFailedLogins) {
      console.log(`High number of failed logins for IP: ${user.ip_address}`);
      await db.insertInto("security_logs").values({
        event_type: "automated_alert",
        ip_address: user.ip_address,
        message: `High number of failed logins: ${user.failed_logins} attempts`,
        severity: "high"
      }).execute();
    }
    return new Response(JSON.stringify({ message: "Alerts checked successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error checking for automated alerts:", error);
    return new Response(JSON.stringify({ error: "Failed to check for automated alerts" }), {
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
