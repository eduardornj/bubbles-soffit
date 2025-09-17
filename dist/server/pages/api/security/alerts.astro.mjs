import { d as db } from '../../../chunks/db_ZSLCF821.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const GET = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
    const alerts = await db.selectFrom("security_logs").select([
      "id",
      "event_type",
      "severity",
      "message",
      "ip_address",
      "created_at"
    ]).where("severity", "in", ["high", "critical"]).where("created_at", ">=", oneHourAgo.toISOString()).orderBy("created_at", "desc").limit(10).execute();
    const blockedIPs = await db.selectFrom("blocked_ips").select([
      "id",
      "ip_address",
      "reason",
      "blocked_at"
    ]).where("is_active", "=", true).where("blocked_at", ">=", oneHourAgo.toISOString()).orderBy("blocked_at", "desc").limit(5).execute();
    const suspiciousIPs = await db.selectFrom("security_logs").select([
      "ip_address",
      db.fn.count("id").as("event_count"),
      db.fn.max("created_at").as("last_event")
    ]).where("created_at", ">=", oneHourAgo.toISOString()).where("event_type", "in", ["login_failed", "brute_force", "suspicious_activity"]).groupBy("ip_address").having(db.fn.count("id"), ">", 5).orderBy(db.fn.count("id"), "desc").limit(5).execute();
    const formattedAlerts = [
      ...alerts.map((alert) => ({
        id: `log_${alert.id}`,
        title: `Critical ${alert.event_type}`,
        description: `${alert.message} from ${alert.ip_address}`,
        severity: alert.severity,
        timestamp: alert.created_at,
        type: "security_event"
      })),
      ...blockedIPs.map((ip) => ({
        id: `blocked_${ip.id}`,
        title: "IP Blocked",
        description: `IP ${ip.ip_address} blocked: ${ip.reason}`,
        severity: "medium",
        timestamp: ip.blocked_at,
        type: "ip_block"
      })),
      ...suspiciousIPs.map((ip) => ({
        id: `suspicious_${ip.ip_address}`,
        title: "Suspicious Activity",
        description: `IP ${ip.ip_address} has ${ip.event_count} suspicious events`,
        severity: "high",
        timestamp: ip.last_event,
        type: "behavior_analysis"
      }))
    ];
    return new Response(JSON.stringify(formattedAlerts), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch alerts" }), {
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
