import { d as db } from '../../../chunks/db_ZSLCF821.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const POST = async ({ request }) => {
  try {
    const { ip_address, reason, severity } = await request.json();
    if (!ip_address || !reason) {
      return new Response(JSON.stringify({ error: "IP address and reason are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingBlock = await db.selectFrom("blocked_ips").select("id").where("ip_address", "=", ip_address).where("is_active", "=", true).executeTakeFirst();
    if (existingBlock) {
      return new Response(JSON.stringify({ error: "IP is already blocked" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await db.insertInto("blocked_ips").values({
      ip_address,
      reason,
      severity: severity || "high",
      is_active: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      blocked_by: "admin"
    }).executeTakeFirst();
    await db.insertInto("security_logs").values({
      event_type: "ip_blocked",
      ip_address,
      severity: severity || "high",
      message: `IP ${ip_address} blocked: ${reason}`,
      details: JSON.stringify({ reason, severity }),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).execute();
    return new Response(JSON.stringify({
      success: true,
      id: Number(result.insertId),
      message: `IP ${ip_address} has been blocked`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error blocking IP:", error);
    return new Response(JSON.stringify({ error: "Failed to block IP" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request }) => {
  try {
    const { ip_address } = await request.json();
    if (!ip_address) {
      return new Response(JSON.stringify({ error: "IP address is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await db.updateTable("blocked_ips").set({
      is_active: false,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).where("ip_address", "=", ip_address).where("is_active", "=", true).execute();
    if (result.numUpdatedRows === 0) {
      return new Response(JSON.stringify({ error: "IP not found or already unblocked" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await db.insertInto("security_logs").values({
      event_type: "ip_unblocked",
      ip_address,
      severity: "medium",
      message: `IP ${ip_address} has been unblocked`,
      details: JSON.stringify({ action: "manual_unblock" }),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    }).execute();
    return new Response(JSON.stringify({
      success: true,
      message: `IP ${ip_address} has been unblocked`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error unblocking IP:", error);
    return new Response(JSON.stringify({ error: "Failed to unblock IP" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
