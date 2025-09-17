import { d as db } from '../../../chunks/db_ZSLCF821.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const GET = async ({ request }) => {
  const url = new URL(request.url);
  const ip = url.searchParams.get("ip");
  if (!ip) {
    return new Response(JSON.stringify({ error: "IP address is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const logs = await db.selectFrom("security_logs").selectAll().where("ip_address", "=", ip).orderBy("created_at", "desc").limit(100).execute();
    const blocked = await db.selectFrom("blocked_ips").selectAll().where("ip_address", "=", ip).where("is_active", "=", true).executeTakeFirst();
    const eventTypes = logs.reduce((acc, log) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1;
      return acc;
    }, {});
    const severityCounts = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {});
    const hourlyActivity = logs.reduce((acc, log) => {
      const hour = new Date(log.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    const timeline = logs.slice(0, 20).map((log) => ({
      timestamp: log.created_at,
      event_type: log.event_type,
      severity: log.severity,
      details: log.details
    }));
    return new Response(JSON.stringify({
      ip,
      total_logs: logs.length,
      blocked: !!blocked,
      blocked_reason: blocked?.reason,
      blocked_at: blocked?.blocked_at,
      expires_at: blocked?.expires_at,
      event_types: eventTypes,
      severity_counts: severityCounts,
      hourly_activity: hourlyActivity,
      recent_logs: timeline,
      risk_score: calculateRiskScore(logs, blocked)
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error investigating IP:", error);
    return new Response(JSON.stringify({ error: "Failed to investigate IP" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
function calculateRiskScore(logs, blocked) {
  let score = 0;
  const eventWeights = {
    "login_failed": 10,
    "brute_force_attempt": 50,
    "suspicious_activity": 30,
    "ip_blocked": 100,
    "attack_detected": 80,
    "malicious_request": 60
  };
  logs.forEach((log) => {
    score += eventWeights[log.event_type] || 5;
  });
  if (blocked) score += 50;
  logs.forEach((log) => {
    switch (log.severity) {
      case "high":
        score += 20;
        break;
      case "critical":
        score += 40;
        break;
    }
  });
  return Math.min(100, score);
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
