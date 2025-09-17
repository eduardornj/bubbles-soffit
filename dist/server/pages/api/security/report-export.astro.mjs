import mysql from 'mysql2/promise';
export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bubbles_enterprise"
};
async function generateReportData(params, connection) {
  const { reportType, dateRange, filters } = params;
  const dateCondition = `created_at BETWEEN '${dateRange.start}' AND '${dateRange.end}'`;
  let reportData = {
    metadata: {
      report_type: reportType,
      generated_at: (/* @__PURE__ */ new Date()).toISOString(),
      date_range: dateRange,
      filters: filters || {},
      total_records: 0
    },
    data: {},
    summary: {},
    charts: []
  };
  try {
    switch (reportType) {
      case "security_summary":
        const [securityStats] = await connection.execute(`
          SELECT 
            COUNT(*) as total_events,
            COUNT(CASE WHEN event_type = 'security_alert' THEN 1 END) as security_alerts,
            COUNT(CASE WHEN event_type = 'auth_failure' THEN 1 END) as auth_failures,
            COUNT(CASE WHEN event_type = 'suspicious_activity' THEN 1 END) as suspicious_activities,
            COUNT(DISTINCT ip_address) as unique_ips
          FROM security_events 
          WHERE ${dateCondition}
        `);
        const [topSuspiciousIPs] = await connection.execute(`
          SELECT 
            ip_address,
            COUNT(*) as event_count,
            GROUP_CONCAT(DISTINCT event_type) as event_types
          FROM security_events 
          WHERE ${dateCondition}
          GROUP BY ip_address
          ORDER BY event_count DESC
          LIMIT 20
        `);
        const [alertsBySeverity] = await connection.execute(`
          SELECT 
            JSON_EXTRACT(details, '$.severity') as severity,
            COUNT(*) as count
          FROM security_events 
          WHERE ${dateCondition} AND event_type = 'security_alert'
          GROUP BY severity
        `);
        const [hourlyActivity] = await connection.execute(`
          SELECT 
            HOUR(created_at) as hour,
            COUNT(*) as event_count
          FROM security_events 
          WHERE ${dateCondition}
          GROUP BY HOUR(created_at)
          ORDER BY hour
        `);
        reportData.data = {
          security_statistics: securityStats[0],
          top_suspicious_ips: topSuspiciousIPs,
          alerts_by_severity: alertsBySeverity,
          hourly_activity: hourlyActivity
        };
        reportData.summary = {
          total_security_events: securityStats[0]?.total_events || 0,
          critical_alerts: alertsBySeverity.find((a) => a.severity === "critical")?.count || 0,
          unique_threat_sources: securityStats[0]?.unique_ips || 0,
          peak_activity_hour: hourlyActivity.reduce((max, curr) => curr.event_count > max.event_count ? curr : max, { hour: 0, event_count: 0 }).hour
        };
        reportData.charts = [
          {
            type: "pie",
            title: "Alerts by Severity",
            data: alertsBySeverity
          },
          {
            type: "bar",
            title: "Hourly Security Activity",
            data: hourlyActivity
          }
        ];
        break;
      case "error_analysis":
        const [errorStats] = await connection.execute(`
          SELECT 
            error_code,
            COUNT(*) as occurrence_count,
            COUNT(DISTINCT ip_address) as unique_ips,
            AVG(response_time) as avg_response_time
          FROM logs_error 
          WHERE ${dateCondition}
          GROUP BY error_code
          ORDER BY occurrence_count DESC
        `);
        const [errorsByPage] = await connection.execute(`
          SELECT 
            page_url,
            COUNT(*) as error_count,
            COUNT(DISTINCT error_code) as unique_error_types
          FROM logs_error 
          WHERE ${dateCondition}
          GROUP BY page_url
          ORDER BY error_count DESC
          LIMIT 20
        `);
        const [errorTrend] = await connection.execute(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as error_count,
            COUNT(CASE WHEN error_code >= 500 THEN 1 END) as server_errors,
            COUNT(CASE WHEN error_code >= 400 AND error_code < 500 THEN 1 END) as client_errors
          FROM logs_error 
          WHERE ${dateCondition}
          GROUP BY DATE(created_at)
          ORDER BY date
        `);
        reportData.data = {
          error_statistics: errorStats,
          errors_by_page: errorsByPage,
          error_trend: errorTrend
        };
        reportData.summary = {
          total_errors: errorStats.reduce((sum, err) => sum + err.occurrence_count, 0),
          most_common_error: errorStats[0]?.error_code || "N/A",
          affected_pages: errorsByPage.length,
          error_rate_trend: "stable"
          // Calcular baseado na tendência
        };
        reportData.charts = [
          {
            type: "line",
            title: "Error Trend Over Time",
            data: errorTrend
          },
          {
            type: "bar",
            title: "Top Error Codes",
            data: errorStats.slice(0, 10)
          }
        ];
        break;
      case "user_behavior":
        const [behaviorStats] = await connection.execute(`
          SELECT 
            ip_address,
            COUNT(*) as total_requests,
            COUNT(DISTINCT page_url) as unique_pages,
            AVG(session_duration) as avg_session_duration,
            MAX(risk_score) as max_risk_score
          FROM user_behavior 
          WHERE ${dateCondition}
          GROUP BY ip_address
          ORDER BY total_requests DESC
          LIMIT 50
        `);
        const [accessPatterns] = await connection.execute(`
          SELECT 
            HOUR(created_at) as hour,
            COUNT(*) as access_count,
            COUNT(DISTINCT ip_address) as unique_users
          FROM user_behavior 
          WHERE ${dateCondition}
          GROUP BY HOUR(created_at)
          ORDER BY hour
        `);
        const [topPages] = await connection.execute(`
          SELECT 
            page_url,
            COUNT(*) as access_count,
            COUNT(DISTINCT ip_address) as unique_visitors,
            AVG(time_spent) as avg_time_spent
          FROM user_behavior 
          WHERE ${dateCondition}
          GROUP BY page_url
          ORDER BY access_count DESC
          LIMIT 20
        `);
        reportData.data = {
          user_statistics: behaviorStats,
          access_patterns: accessPatterns,
          top_pages: topPages
        };
        reportData.summary = {
          total_users: behaviorStats.length,
          total_page_views: behaviorStats.reduce((sum, user) => sum + user.total_requests, 0),
          peak_access_hour: accessPatterns.reduce((max, curr) => curr.access_count > max.access_count ? curr : max, { hour: 0, access_count: 0 }).hour,
          most_popular_page: topPages[0]?.page_url || "N/A"
        };
        reportData.charts = [
          {
            type: "line",
            title: "Access Patterns by Hour",
            data: accessPatterns
          },
          {
            type: "bar",
            title: "Top Pages by Access Count",
            data: topPages.slice(0, 10)
          }
        ];
        break;
      case "compliance_audit":
        const [complianceEvents] = await connection.execute(`
          SELECT 
            event_type,
            compliance_standard,
            status,
            COUNT(*) as event_count
          FROM logs_compliance 
          WHERE ${dateCondition}
          GROUP BY event_type, compliance_standard, status
        `);
        const [violationsByStandard] = await connection.execute(`
          SELECT 
            compliance_standard,
            COUNT(*) as violation_count,
            COUNT(DISTINCT ip_address) as affected_sources
          FROM logs_compliance 
          WHERE ${dateCondition} AND status = 'violation'
          GROUP BY compliance_standard
        `);
        reportData.data = {
          compliance_events: complianceEvents,
          violations_by_standard: violationsByStandard
        };
        reportData.summary = {
          total_compliance_events: complianceEvents.reduce((sum, event) => sum + event.event_count, 0),
          total_violations: violationsByStandard.reduce((sum, std) => sum + std.violation_count, 0),
          compliance_standards_affected: violationsByStandard.length,
          compliance_score: Math.max(0, 100 - violationsByStandard.reduce((sum, std) => sum + std.violation_count, 0) * 2)
        };
        break;
      case "threat_intelligence":
        const [threatData] = await connection.execute(`
          SELECT 
            threat_type,
            source_ip,
            target,
            severity,
            confidence_score,
            created_at
          FROM threat_intelligence 
          WHERE ${dateCondition}
          ORDER BY confidence_score DESC, created_at DESC
        `);
        const [attackPatterns] = await connection.execute(`
          SELECT 
            pattern_name,
            COUNT(*) as detection_count,
            AVG(confidence_level) as avg_confidence,
            MAX(last_seen) as last_detection
          FROM attack_patterns 
          WHERE ${dateCondition}
          GROUP BY pattern_name
          ORDER BY detection_count DESC
        `);
        reportData.data = {
          threat_data: threatData,
          attack_patterns: attackPatterns
        };
        reportData.summary = {
          total_threats: threatData.length,
          high_confidence_threats: threatData.filter((t) => t.confidence_score >= 80).length,
          unique_attack_patterns: attackPatterns.length,
          most_common_threat: attackPatterns[0]?.pattern_name || "N/A"
        };
        break;
      case "custom":
        if (!params.customQuery) {
          throw new Error("Custom query parameters are required for custom reports");
        }
        const { tables, fields, conditions, groupBy, orderBy } = params.customQuery;
        let query = `SELECT ${fields.join(", ")} FROM ${tables.join(", ")}`;
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(" AND ")}`;
        }
        if (groupBy && groupBy.length > 0) {
          query += ` GROUP BY ${groupBy.join(", ")}`;
        }
        if (orderBy && orderBy.length > 0) {
          query += ` ORDER BY ${orderBy.join(", ")}`;
        }
        query += " LIMIT 1000";
        const [customData] = await connection.execute(query);
        reportData.data = {
          custom_query_results: customData,
          query_executed: query
        };
        reportData.summary = {
          total_records: customData.length,
          query_complexity: "custom",
          execution_time: "N/A"
        };
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
    reportData.metadata.total_records = Object.values(reportData.data).reduce((total, dataset) => {
      if (Array.isArray(dataset)) {
        return total + dataset.length;
      }
      return total;
    }, 0);
    return reportData;
  } catch (error) {
    console.error(`Error generating report data for ${reportType}:`, error);
    throw error;
  }
}
function convertToCSV(data) {
  if (!data || typeof data !== "object") {
    return "No data available";
  }
  let csvContent = "";
  csvContent += `Report Type,${data.metadata.report_type}
`;
  csvContent += `Generated At,${data.metadata.generated_at}
`;
  csvContent += `Date Range,${data.metadata.date_range.start} to ${data.metadata.date_range.end}
`;
  csvContent += `Total Records,${data.metadata.total_records}

`;
  csvContent += "SUMMARY\n";
  Object.entries(data.summary).forEach(([key, value]) => {
    csvContent += `${key.replace(/_/g, " ").toUpperCase()},${value}
`;
  });
  csvContent += "\n";
  Object.entries(data.data).forEach(([sectionName, sectionData]) => {
    if (Array.isArray(sectionData) && sectionData.length > 0) {
      csvContent += `${sectionName.replace(/_/g, " ").toUpperCase()}
`;
      const headers = Object.keys(sectionData[0]);
      csvContent += headers.join(",") + "\n";
      sectionData.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value || "";
        });
        csvContent += values.join(",") + "\n";
      });
      csvContent += "\n";
    }
  });
  return csvContent;
}
function generatePDFContent(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Security Report - ${data.metadata.report_type}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; margin-bottom: 20px; }
            .summary { background: #f3f4f6; padding: 15px; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .chart-placeholder { background: #e5e7eb; padding: 40px; text-align: center; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Security Report: ${data.metadata.report_type.replace(/_/g, " ").toUpperCase()}</h1>
            <p>Generated: ${new Date(data.metadata.generated_at).toLocaleString()}</p>
            <p>Period: ${data.metadata.date_range.start} to ${data.metadata.date_range.end}</p>
        </div>
        
        <div class="summary">
            <h2>Executive Summary</h2>
            ${Object.entries(data.summary).map(
    ([key, value]) => `<p><strong>${key.replace(/_/g, " ").toUpperCase()}:</strong> ${value}</p>`
  ).join("")}
        </div>
        
        ${Object.entries(data.data).map(([sectionName, sectionData]) => {
    if (Array.isArray(sectionData) && sectionData.length > 0) {
      const headers = Object.keys(sectionData[0]);
      return `
              <div class="section">
                  <h2>${sectionName.replace(/_/g, " ").toUpperCase()}</h2>
                  <table class="table">
                      <thead>
                          <tr>${headers.map((h) => `<th>${h.replace(/_/g, " ").toUpperCase()}</th>`).join("")}</tr>
                      </thead>
                      <tbody>
                          ${sectionData.slice(0, 20).map(
        (row) => `<tr>${headers.map((h) => `<td>${row[h] || ""}</td>`).join("")}</tr>`
      ).join("")}
                      </tbody>
                  </table>
              </div>
            `;
    }
    return "";
  }).join("")}
        
        ${data.charts.map(
    (chart) => `<div class="chart-placeholder">
             <h3>${chart.title}</h3>
             <p>Chart Type: ${chart.type.toUpperCase()}</p>
             <p>Data Points: ${chart.data.length}</p>
           </div>`
  ).join("")}
        
        <div class="footer">
            <p><small>Report generated by Security Dashboard System - ${(/* @__PURE__ */ new Date()).toISOString()}</small></p>
        </div>
    </body>
    </html>
  `;
}
const POST = async ({ request }) => {
  try {
    const params = await request.json();
    const { action, reportType, format, dateRange, filters, customQuery, reportId, schedule } = params;
    const connection = await mysql.createConnection(dbConfig);
    try {
      let result = {};
      switch (action) {
        case "generate":
          if (!reportType || !format || !dateRange) {
            throw new Error("Report type, format, and date range are required");
          }
          const reportData = await generateReportData(params, connection);
          const newReportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          let fileContent;
          let fileName;
          let mimeType;
          switch (format) {
            case "csv":
              fileContent = convertToCSV(reportData);
              fileName = `${reportType}_${dateRange.start}_${dateRange.end}.csv`;
              mimeType = "text/csv";
              break;
            case "json":
              fileContent = JSON.stringify(reportData, null, 2);
              fileName = `${reportType}_${dateRange.start}_${dateRange.end}.json`;
              mimeType = "application/json";
              break;
            case "pdf":
              fileContent = generatePDFContent(reportData);
              fileName = `${reportType}_${dateRange.start}_${dateRange.end}.html`;
              mimeType = "text/html";
              break;
            default:
              throw new Error(`Unsupported format: ${format}`);
          }
          await connection.execute(
            `INSERT INTO security_events (event_type, ip_address, details, created_at) 
             VALUES ('report_generated', ?, ?, NOW())`,
            [
              "report_system",
              JSON.stringify({
                report_id: newReportId,
                report_type: reportType,
                format,
                file_name: fileName,
                file_size: fileContent.length,
                parameters: params,
                status: "completed",
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString()
                // 7 dias
              })
            ]
          );
          result = {
            success: true,
            report_id: newReportId,
            file_name: fileName,
            file_size: fileContent.length,
            mime_type: mimeType,
            download_url: `/api/security/report-export?action=download&reportId=${newReportId}`,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
            preview_data: {
              total_records: reportData.metadata.total_records,
              summary: reportData.summary,
              sections: Object.keys(reportData.data)
            },
            file_content: fileContent
            // Para download imediato
          };
          break;
        case "schedule_report":
          if (!schedule || !reportType || !format) {
            throw new Error("Schedule configuration, report type, and format are required");
          }
          const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await connection.execute(
            `INSERT INTO security_events (event_type, ip_address, details, created_at) 
             VALUES ('report_scheduled', ?, ?, NOW())`,
            [
              "report_system",
              JSON.stringify({
                schedule_id: scheduleId,
                report_type: reportType,
                format,
                schedule,
                parameters: params,
                status: "active",
                next_run: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
                // Próximo dia
              })
            ]
          );
          result = {
            success: true,
            schedule_id: scheduleId,
            message: "Report scheduled successfully",
            next_run: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
          };
          break;
        default:
          throw new Error("Invalid action");
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error in report export:", error);
    return new Response(JSON.stringify({
      error: "Failed to process report request",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const reportId = url.searchParams.get("reportId");
    const connection = await mysql.createConnection(dbConfig);
    try {
      let result = {};
      switch (action) {
        case "download":
          if (!reportId) {
            throw new Error("Report ID is required for download");
          }
          const [reportInfo] = await connection.execute(
            `SELECT details FROM security_events 
             WHERE event_type = 'report_generated' 
             AND JSON_EXTRACT(details, '$.report_id') = ?
             ORDER BY created_at DESC LIMIT 1`,
            [reportId]
          );
          if (reportInfo.length === 0) {
            throw new Error("Report not found");
          }
          const reportDetails = JSON.parse(reportInfo[0].details);
          if (/* @__PURE__ */ new Date() > new Date(reportDetails.expires_at)) {
            throw new Error("Report has expired");
          }
          result = {
            success: true,
            report_id: reportId,
            file_name: reportDetails.file_name,
            mime_type: reportDetails.mime_type || "application/octet-stream",
            message: "Report ready for download",
            download_instructions: "Use the file_content from the generate response for immediate download"
          };
          break;
        case "list_reports":
          const [reports] = await connection.execute(`
            SELECT 
              JSON_EXTRACT(details, '$.report_id') as report_id,
              JSON_EXTRACT(details, '$.report_type') as report_type,
              JSON_EXTRACT(details, '$.format') as format,
              JSON_EXTRACT(details, '$.file_name') as file_name,
              JSON_EXTRACT(details, '$.file_size') as file_size,
              JSON_EXTRACT(details, '$.expires_at') as expires_at,
              created_at
            FROM security_events 
            WHERE event_type = 'report_generated'
            ORDER BY created_at DESC
            LIMIT 50
          `);
          result = {
            success: true,
            reports: reports.map((report) => ({
              report_id: JSON.parse(report.report_id),
              report_type: JSON.parse(report.report_type),
              format: JSON.parse(report.format),
              file_name: JSON.parse(report.file_name),
              file_size: JSON.parse(report.file_size),
              expires_at: JSON.parse(report.expires_at),
              generated_at: report.created_at,
              is_expired: /* @__PURE__ */ new Date() > new Date(JSON.parse(report.expires_at))
            }))
          };
          break;
        case "templates":
          result = {
            success: true,
            available_report_types: [
              {
                type: "security_summary",
                name: "Security Summary Report",
                description: "Comprehensive overview of security events and alerts",
                estimated_time: "2-5 minutes"
              },
              {
                type: "error_analysis",
                name: "Error Analysis Report",
                description: "Detailed analysis of application errors and issues",
                estimated_time: "1-3 minutes"
              },
              {
                type: "user_behavior",
                name: "User Behavior Analysis",
                description: "Analysis of user access patterns and behavior",
                estimated_time: "3-7 minutes"
              },
              {
                type: "compliance_audit",
                name: "Compliance Audit Report",
                description: "Compliance status and violation analysis",
                estimated_time: "2-4 minutes"
              },
              {
                type: "threat_intelligence",
                name: "Threat Intelligence Report",
                description: "Threat detection and intelligence analysis",
                estimated_time: "3-6 minutes"
              },
              {
                type: "custom",
                name: "Custom Query Report",
                description: "Custom report based on user-defined queries",
                estimated_time: "1-10 minutes"
              }
            ],
            supported_formats: ["pdf", "csv", "json", "excel"],
            max_date_range: "90 days",
            report_retention: "7 days"
          };
          break;
        default:
          result = {
            success: true,
            available_actions: ["download", "list_reports", "templates"],
            report_system_status: "active"
          };
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error in report export GET:", error);
    return new Response(JSON.stringify({
      error: "Failed to process report request",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
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
