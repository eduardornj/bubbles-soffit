import { d as db } from '../../../chunks/db_ZSLCF821.mjs';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

function generateCSV(data) {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");
  const csvRows = data.map(
    (row) => headers.map((header) => {
      const value = row[header];
      return typeof value === "string" && value.includes(",") ? `"${value}"` : value;
    }).join(",")
  );
  return [csvHeaders, ...csvRows].join("\n");
}
const GET = async ({ url }) => {
  try {
    const format = url.searchParams.get("format") || "csv";
    const days = parseInt(url.searchParams.get("days") || "7");
    const severity = url.searchParams.get("severity") || "all";
    const event_type = url.searchParams.get("event_type") || "all";
    let query = db.selectFrom("security_logs").select([
      "id",
      "event_type",
      "ip_address",
      "severity",
      "message",
      "details",
      "created_at"
    ]);
    if (days > 0) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
      query = query.where("created_at", ">=", cutoffDate.toISOString());
    }
    if (severity !== "all") {
      query = query.where("severity", "=", severity);
    }
    if (event_type !== "all") {
      query = query.where("event_type", "=", event_type);
    }
    const logs = await query.orderBy("created_at", "desc").execute();
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: log.created_at,
      event_type: log.event_type,
      ip_address: log.ip_address,
      severity: log.severity,
      message: log.message || "",
      details: log.details || ""
    }));
    if (format === "csv") {
      const csv = generateCSV(formattedLogs);
      const filename = `security_logs_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    } else {
      const json = JSON.stringify(formattedLogs, null, 2);
      const filename = `security_logs_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      return new Response(json, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }
  } catch (error) {
    console.error("Error exporting logs:", error);
    return new Response(JSON.stringify({ error: "Failed to export security logs" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const { format = "csv" } = await request.json();
    const blockedIPs = await db.selectFrom("blocked_ips").select([
      "id",
      "ip_address",
      "reason",
      "severity",
      "is_active",
      "created_at",
      "updated_at",
      "blocked_by"
    ]).where("is_active", "=", true).orderBy("created_at", "desc").execute();
    const formattedIPs = blockedIPs.map((ip) => ({
      id: ip.id,
      ip_address: ip.ip_address,
      reason: ip.reason,
      severity: ip.severity,
      blocked_at: ip.created_at,
      blocked_by: ip.blocked_by
    }));
    if (format === "csv") {
      const csv = generateCSV(formattedIPs);
      const filename = `blocked_ips_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    } else {
      const json = JSON.stringify(formattedIPs, null, 2);
      const filename = `blocked_ips_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      return new Response(json, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }
  } catch (error) {
    console.error("Error exporting blocked IPs:", error);
    return new Response(JSON.stringify({ error: "Failed to export blocked IPs" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
