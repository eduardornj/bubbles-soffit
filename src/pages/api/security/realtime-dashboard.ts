import type { APIRoute } from 'astro';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bubbles_enterprise'
};

interface DashboardParams {
  metricsType: 'overview' | 'security' | 'performance' | 'threats' | 'compliance' | 'custom';
  timeRange?: string; // '1h', '6h', '24h', '7d', '30d'
  refreshInterval?: number; // seconds
  includeCharts?: boolean;
  customMetrics?: string[];
}

interface MetricData {
  name: string;
  value: number | string;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'gauge';
  title: string;
  data: any[];
  labels: string[];
  colors?: string[];
  options?: any;
}

// Função para calcular tendência
function calculateTrend(current: number, previous: number): { change: number, trend: 'up' | 'down' | 'stable' } {
  if (previous === 0) return { change: 0, trend: 'stable' };
  
  const change = ((current - previous) / previous) * 100;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  
  if (Math.abs(change) > 5) {
    trend = change > 0 ? 'up' : 'down';
  }
  
  return { change: Math.round(change * 100) / 100, trend };
}

// Função para determinar severidade
function determineSeverity(metricName: string, value: number): 'low' | 'medium' | 'high' | 'critical' {
  const severityRules: { [key: string]: { critical: number, high: number, medium: number } } = {
    'error_rate': { critical: 10, high: 5, medium: 2 },
    'auth_failures': { critical: 100, high: 50, medium: 20 },
    'blocked_requests': { critical: 1000, high: 500, medium: 100 },
    'suspicious_ips': { critical: 50, high: 20, medium: 10 },
    'csp_violations': { critical: 100, high: 50, medium: 20 }
  };
  
  const rules = severityRules[metricName];
  if (!rules) return 'low';
  
  if (value >= rules.critical) return 'critical';
  if (value >= rules.high) return 'high';
  if (value >= rules.medium) return 'medium';
  return 'low';
}

// Função para gerar cores baseadas em severidade
function getSeverityColor(severity: string): string {
  const colors = {
    'low': '#10B981',
    'medium': '#F59E0B',
    'high': '#EF4444',
    'critical': '#DC2626'
  };
  return colors[severity as keyof typeof colors] || '#6B7280';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const params: DashboardParams = await request.json();
    const {
      metricsType,
      timeRange = '24h',
      refreshInterval = 30,
      includeCharts = true,
      customMetrics = []
    } = params;

    const connection = await mysql.createConnection(dbConfig);

    try {
      let timeCondition = '';
      let previousTimeCondition = '';
      
      switch (timeRange) {
        case '1h':
          timeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)';
          previousTimeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR) AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)';
          break;
        case '6h':
          timeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 6 HOUR)';
          previousTimeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 12 HOUR) AND created_at < DATE_SUB(NOW(), INTERVAL 6 HOUR)';
          break;
        case '24h':
          timeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)';
          previousTimeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR) AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)';
          break;
        case '7d':
          timeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          previousTimeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30d':
          timeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          previousTimeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        default:
          timeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)';
          previousTimeCondition = 'created_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR) AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)';
      }

      let dashboardData: any = {
        timestamp: new Date().toISOString(),
        time_range: timeRange,
        refresh_interval: refreshInterval,
        metrics: [],
        charts: [],
        alerts: []
      };

      switch (metricsType) {
        case 'overview':
          // Métricas gerais do sistema
          const [overviewCurrent] = await connection.execute(`
            SELECT 
              (SELECT COUNT(*) FROM security_events WHERE ${timeCondition}) as security_events,
              (SELECT COUNT(*) FROM logs_error WHERE ${timeCondition}) as error_logs,
              (SELECT COUNT(*) FROM auth_attempts WHERE ${timeCondition}) as auth_attempts,
              (SELECT COUNT(*) FROM auth_attempts WHERE ${timeCondition} AND success = FALSE) as failed_auths,
              (SELECT COUNT(*) FROM csp_violations WHERE ${timeCondition}) as csp_violations,
              (SELECT COUNT(DISTINCT ip_address) FROM security_events WHERE ${timeCondition}) as unique_ips,
              (SELECT COUNT(*) FROM banned_ips WHERE is_active = TRUE) as banned_ips
          `);

          const [overviewPrevious] = await connection.execute(`
            SELECT 
              (SELECT COUNT(*) FROM security_events WHERE ${previousTimeCondition}) as security_events,
              (SELECT COUNT(*) FROM logs_error WHERE ${previousTimeCondition}) as error_logs,
              (SELECT COUNT(*) FROM auth_attempts WHERE ${previousTimeCondition}) as auth_attempts,
              (SELECT COUNT(*) FROM auth_attempts WHERE ${previousTimeCondition} AND success = FALSE) as failed_auths,
              (SELECT COUNT(*) FROM csp_violations WHERE ${previousTimeCondition}) as csp_violations,
              (SELECT COUNT(DISTINCT ip_address) FROM security_events WHERE ${previousTimeCondition}) as unique_ips
          `);

          const currentData = (overviewCurrent as any[])[0];
          const previousData = (overviewPrevious as any[])[0];

          dashboardData.metrics = [
            {
              name: 'Total Events',
              value: currentData.security_events + currentData.error_logs,
              ...calculateTrend(
                currentData.security_events + currentData.error_logs,
                previousData.security_events + previousData.error_logs
              ),
              severity: determineSeverity('total_events', currentData.security_events + currentData.error_logs),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Security Events',
              value: currentData.security_events,
              ...calculateTrend(currentData.security_events, previousData.security_events),
              severity: determineSeverity('security_events', currentData.security_events),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Error Rate',
              value: `${((currentData.error_logs / (currentData.security_events + currentData.error_logs)) * 100).toFixed(1)}%`,
              ...calculateTrend(
                (currentData.error_logs / (currentData.security_events + currentData.error_logs)) * 100,
                (previousData.error_logs / (previousData.security_events + previousData.error_logs)) * 100
              ),
              severity: determineSeverity('error_rate', (currentData.error_logs / (currentData.security_events + currentData.error_logs)) * 100),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Failed Authentications',
              value: currentData.failed_auths,
              ...calculateTrend(currentData.failed_auths, previousData.failed_auths),
              severity: determineSeverity('auth_failures', currentData.failed_auths),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Unique IPs',
              value: currentData.unique_ips,
              ...calculateTrend(currentData.unique_ips, previousData.unique_ips),
              severity: 'low',
              timestamp: new Date().toISOString()
            },
            {
              name: 'Banned IPs',
              value: currentData.banned_ips,
              change: 0,
              trend: 'stable' as const,
              severity: currentData.banned_ips > 10 ? 'medium' : 'low',
              timestamp: new Date().toISOString()
            }
          ];

          if (includeCharts) {
            // Gráfico de eventos por hora
            const [hourlyData] = await connection.execute(`
              SELECT 
                HOUR(created_at) as hour,
                COUNT(*) as event_count,
                COUNT(CASE WHEN source = 'security_events' THEN 1 END) as security_count,
                COUNT(CASE WHEN source = 'logs_error' THEN 1 END) as error_count
              FROM (
                SELECT 'security_events' as source, created_at FROM security_events WHERE ${timeCondition}
                UNION ALL
                SELECT 'logs_error' as source, created_at FROM logs_error WHERE ${timeCondition}
              ) combined_events
              GROUP BY HOUR(created_at)
              ORDER BY hour
            `);

            dashboardData.charts.push({
              type: 'line',
              title: 'Events by Hour',
              data: (hourlyData as any[]).map(d => ({
                hour: d.hour,
                security: d.security_count,
                errors: d.error_count,
                total: d.event_count
              })),
              labels: (hourlyData as any[]).map(d => `${d.hour}:00`),
              colors: ['#3B82F6', '#EF4444', '#10B981']
            });

            // Gráfico de distribuição de severidade
            const severityData = dashboardData.metrics.reduce((acc: any, metric: any) => {
              acc[metric.severity] = (acc[metric.severity] || 0) + 1;
              return acc;
            }, {});

            dashboardData.charts.push({
              type: 'pie',
              title: 'Severity Distribution',
              data: Object.entries(severityData).map(([severity, count]) => ({
                name: severity,
                value: count,
                color: getSeverityColor(severity)
              })),
              labels: Object.keys(severityData)
            });
          }
          break;

        case 'security':
          // Métricas específicas de segurança
          const [securityCurrent] = await connection.execute(`
            SELECT 
              (SELECT COUNT(*) FROM security_events WHERE ${timeCondition} AND event_type LIKE '%attack%') as attacks,
              (SELECT COUNT(*) FROM security_events WHERE ${timeCondition} AND event_type LIKE '%breach%') as breaches,
              (SELECT COUNT(*) FROM security_events WHERE ${timeCondition} AND event_type LIKE '%intrusion%') as intrusions,
              (SELECT COUNT(DISTINCT ip_address) FROM security_events WHERE ${timeCondition} AND event_type LIKE '%suspicious%') as suspicious_ips,
              (SELECT COUNT(*) FROM csp_violations WHERE ${timeCondition}) as csp_violations,
              (SELECT COUNT(*) FROM banned_ips WHERE is_active = TRUE AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as recent_bans
          `);

          const [securityPrevious] = await connection.execute(`
            SELECT 
              (SELECT COUNT(*) FROM security_events WHERE ${previousTimeCondition} AND event_type LIKE '%attack%') as attacks,
              (SELECT COUNT(*) FROM security_events WHERE ${previousTimeCondition} AND event_type LIKE '%breach%') as breaches,
              (SELECT COUNT(*) FROM security_events WHERE ${previousTimeCondition} AND event_type LIKE '%intrusion%') as intrusions,
              (SELECT COUNT(DISTINCT ip_address) FROM security_events WHERE ${previousTimeCondition} AND event_type LIKE '%suspicious%') as suspicious_ips,
              (SELECT COUNT(*) FROM csp_violations WHERE ${previousTimeCondition}) as csp_violations
          `);

          const secCurrentData = (securityCurrent as any[])[0];
          const secPreviousData = (securityPrevious as any[])[0];

          dashboardData.metrics = [
            {
              name: 'Attack Attempts',
              value: secCurrentData.attacks,
              ...calculateTrend(secCurrentData.attacks, secPreviousData.attacks),
              severity: determineSeverity('attacks', secCurrentData.attacks),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Security Breaches',
              value: secCurrentData.breaches,
              ...calculateTrend(secCurrentData.breaches, secPreviousData.breaches),
              severity: secCurrentData.breaches > 0 ? 'critical' : 'low',
              timestamp: new Date().toISOString()
            },
            {
              name: 'Intrusion Attempts',
              value: secCurrentData.intrusions,
              ...calculateTrend(secCurrentData.intrusions, secPreviousData.intrusions),
              severity: determineSeverity('intrusions', secCurrentData.intrusions),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Suspicious IPs',
              value: secCurrentData.suspicious_ips,
              ...calculateTrend(secCurrentData.suspicious_ips, secPreviousData.suspicious_ips),
              severity: determineSeverity('suspicious_ips', secCurrentData.suspicious_ips),
              timestamp: new Date().toISOString()
            },
            {
              name: 'CSP Violations',
              value: secCurrentData.csp_violations,
              ...calculateTrend(secCurrentData.csp_violations, secPreviousData.csp_violations),
              severity: determineSeverity('csp_violations', secCurrentData.csp_violations),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Recent Bans',
              value: secCurrentData.recent_bans,
              change: 0,
              trend: 'stable' as const,
              severity: 'medium',
              timestamp: new Date().toISOString()
            }
          ];

          if (includeCharts) {
            // Gráfico de tipos de ameaças
            const [threatTypes] = await connection.execute(`
              SELECT 
                event_type,
                COUNT(*) as count
              FROM security_events 
              WHERE ${timeCondition}
                AND (event_type LIKE '%attack%' OR event_type LIKE '%breach%' OR event_type LIKE '%intrusion%')
              GROUP BY event_type
              ORDER BY count DESC
              LIMIT 10
            `);

            dashboardData.charts.push({
              type: 'bar',
              title: 'Threat Types',
              data: (threatTypes as any[]).map(t => ({
                type: t.event_type,
                count: t.count
              })),
              labels: (threatTypes as any[]).map(t => t.event_type),
              colors: ['#DC2626']
            });

            // Gauge de nível de ameaça
            const threatLevel = Math.min(
              (secCurrentData.attacks * 3 + secCurrentData.breaches * 10 + secCurrentData.intrusions * 5) / 10,
              100
            );

            dashboardData.charts.push({
              type: 'gauge',
              title: 'Threat Level',
              data: [{ value: threatLevel }],
              labels: ['Threat Level'],
              colors: [threatLevel > 70 ? '#DC2626' : threatLevel > 40 ? '#F59E0B' : '#10B981'],
              options: {
                min: 0,
                max: 100,
                thresholds: [30, 70]
              }
            });
          }
          break;

        case 'performance':
          // Métricas de performance
          const [performanceCurrent] = await connection.execute(`
            SELECT 
              (SELECT AVG(response_time) FROM logs_error WHERE ${timeCondition} AND response_time IS NOT NULL) as avg_response_time,
              (SELECT COUNT(*) FROM logs_error WHERE ${timeCondition} AND error_code >= 500) as server_errors,
              (SELECT COUNT(*) FROM logs_error WHERE ${timeCondition} AND error_code >= 400 AND error_code < 500) as client_errors,
              (SELECT COUNT(*) FROM logs_error WHERE ${timeCondition} AND error_code = 200) as successful_requests,
              (SELECT COUNT(DISTINCT ip_address) FROM logs_error WHERE ${timeCondition}) as unique_visitors
          `);

          const [performancePrevious] = await connection.execute(`
            SELECT 
              (SELECT AVG(response_time) FROM logs_error WHERE ${previousTimeCondition} AND response_time IS NOT NULL) as avg_response_time,
              (SELECT COUNT(*) FROM logs_error WHERE ${previousTimeCondition} AND error_code >= 500) as server_errors,
              (SELECT COUNT(*) FROM logs_error WHERE ${previousTimeCondition} AND error_code >= 400 AND error_code < 500) as client_errors,
              (SELECT COUNT(*) FROM logs_error WHERE ${previousTimeCondition} AND error_code = 200) as successful_requests,
              (SELECT COUNT(DISTINCT ip_address) FROM logs_error WHERE ${previousTimeCondition}) as unique_visitors
          `);

          const perfCurrentData = (performanceCurrent as any[])[0];
          const perfPreviousData = (performancePrevious as any[])[0];

          dashboardData.metrics = [
            {
              name: 'Avg Response Time',
              value: `${(perfCurrentData.avg_response_time || 0).toFixed(0)}ms`,
              ...calculateTrend(perfCurrentData.avg_response_time || 0, perfPreviousData.avg_response_time || 0),
              severity: (perfCurrentData.avg_response_time || 0) > 1000 ? 'high' : 'low',
              timestamp: new Date().toISOString()
            },
            {
              name: 'Server Errors (5xx)',
              value: perfCurrentData.server_errors,
              ...calculateTrend(perfCurrentData.server_errors, perfPreviousData.server_errors),
              severity: determineSeverity('server_errors', perfCurrentData.server_errors),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Client Errors (4xx)',
              value: perfCurrentData.client_errors,
              ...calculateTrend(perfCurrentData.client_errors, perfPreviousData.client_errors),
              severity: determineSeverity('client_errors', perfCurrentData.client_errors),
              timestamp: new Date().toISOString()
            },
            {
              name: 'Successful Requests',
              value: perfCurrentData.successful_requests,
              ...calculateTrend(perfCurrentData.successful_requests, perfPreviousData.successful_requests),
              severity: 'low',
              timestamp: new Date().toISOString()
            },
            {
              name: 'Unique Visitors',
              value: perfCurrentData.unique_visitors,
              ...calculateTrend(perfCurrentData.unique_visitors, perfPreviousData.unique_visitors),
              severity: 'low',
              timestamp: new Date().toISOString()
            }
          ];

          if (includeCharts) {
            // Gráfico de códigos de status
            const [statusCodes] = await connection.execute(`
              SELECT 
                CASE 
                  WHEN error_code >= 200 AND error_code < 300 THEN '2xx Success'
                  WHEN error_code >= 300 AND error_code < 400 THEN '3xx Redirect'
                  WHEN error_code >= 400 AND error_code < 500 THEN '4xx Client Error'
                  WHEN error_code >= 500 THEN '5xx Server Error'
                  ELSE 'Unknown'
                END as status_category,
                COUNT(*) as count
              FROM logs_error 
              WHERE ${timeCondition}
              GROUP BY status_category
              ORDER BY count DESC
            `);

            dashboardData.charts.push({
              type: 'pie',
              title: 'HTTP Status Distribution',
              data: (statusCodes as any[]).map(s => ({
                name: s.status_category,
                value: s.count
              })),
              labels: (statusCodes as any[]).map(s => s.status_category),
              colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280']
            });
          }
          break;

        case 'threats':
          // Análise de ameaças em tempo real
          const [threatData] = await connection.execute(`
            SELECT 
              ip_address,
              COUNT(*) as event_count,
              COUNT(CASE WHEN event_type LIKE '%attack%' THEN 1 END) as attacks,
              COUNT(CASE WHEN event_type LIKE '%error%' THEN 1 END) as errors,
              MAX(created_at) as last_activity,
              GROUP_CONCAT(DISTINCT event_type) as event_types
            FROM security_events 
            WHERE ${timeCondition}
            GROUP BY ip_address
            HAVING event_count > 10 OR attacks > 0
            ORDER BY (attacks * 5 + event_count) DESC
            LIMIT 20
          `);

          const [activeBans] = await connection.execute(
            'SELECT COUNT(*) as count FROM banned_ips WHERE is_active = TRUE'
          );

          const [recentAlerts] = await connection.execute(`
            SELECT 
              event_type,
              ip_address,
              details,
              created_at
            FROM security_events 
            WHERE ${timeCondition}
              AND (event_type LIKE '%critical%' OR event_type LIKE '%alert%' OR event_type LIKE '%breach%')
            ORDER BY created_at DESC
            LIMIT 10
          `);

          dashboardData.metrics = [
            {
              name: 'Active Threats',
              value: (threatData as any[]).length,
              change: 0,
              trend: 'stable' as const,
              severity: (threatData as any[]).length > 10 ? 'high' : 'medium',
              timestamp: new Date().toISOString()
            },
            {
              name: 'High-Risk IPs',
              value: (threatData as any[]).filter(t => t.attacks > 0).length,
              change: 0,
              trend: 'stable' as const,
              severity: (threatData as any[]).filter(t => t.attacks > 0).length > 5 ? 'critical' : 'medium',
              timestamp: new Date().toISOString()
            },
            {
              name: 'Active Bans',
              value: (activeBans as any[])[0].count,
              change: 0,
              trend: 'stable' as const,
              severity: 'medium',
              timestamp: new Date().toISOString()
            },
            {
              name: 'Recent Alerts',
              value: (recentAlerts as any[]).length,
              change: 0,
              trend: 'stable' as const,
              severity: (recentAlerts as any[]).length > 5 ? 'high' : 'low',
              timestamp: new Date().toISOString()
            }
          ];

          dashboardData.threat_details = {
            top_threats: threatData,
            recent_alerts: recentAlerts
          };

          if (includeCharts) {
            // Gráfico de ameaças por IP
            dashboardData.charts.push({
              type: 'bar',
              title: 'Top Threat Sources',
              data: (threatData as any[]).slice(0, 10).map(t => ({
                ip: t.ip_address,
                events: t.event_count,
                attacks: t.attacks
              })),
              labels: (threatData as any[]).slice(0, 10).map(t => t.ip_address),
              colors: ['#DC2626', '#F59E0B']
            });
          }
          break;

        case 'compliance':
          // Métricas de compliance
          const [complianceData] = await connection.execute(`
            SELECT 
              (SELECT COUNT(*) FROM logs_compliance WHERE ${timeCondition}) as compliance_events,
              (SELECT COUNT(*) FROM logs_compliance WHERE ${timeCondition} AND compliance_type = 'gdpr') as gdpr_events,
              (SELECT COUNT(*) FROM logs_compliance WHERE ${timeCondition} AND compliance_type = 'pci') as pci_events,
              (SELECT COUNT(*) FROM logs_compliance WHERE ${timeCondition} AND compliance_type = 'hipaa') as hipaa_events,
              (SELECT COUNT(*) FROM security_events WHERE ${timeCondition} AND event_type LIKE '%audit%') as audit_events
          `);

          const compData = (complianceData as any[])[0];

          dashboardData.metrics = [
            {
              name: 'Compliance Events',
              value: compData.compliance_events,
              change: 0,
              trend: 'stable' as const,
              severity: 'low',
              timestamp: new Date().toISOString()
            },
            {
              name: 'GDPR Events',
              value: compData.gdpr_events,
              change: 0,
              trend: 'stable' as const,
              severity: 'low',
              timestamp: new Date().toISOString()
            },
            {
              name: 'PCI Events',
              value: compData.pci_events,
              change: 0,
              trend: 'stable' as const,
              severity: 'low',
              timestamp: new Date().toISOString()
            },
            {
              name: 'Audit Events',
              value: compData.audit_events,
              change: 0,
              trend: 'stable' as const,
              severity: 'low',
              timestamp: new Date().toISOString()
            }
          ];
          break;

        default:
          throw new Error('Invalid metrics type');
      }

      // Gerar alertas baseados nas métricas
      dashboardData.alerts = dashboardData.metrics
        .filter((metric: MetricData) => metric.severity === 'critical' || metric.severity === 'high')
        .map((metric: MetricData) => ({
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: metric.severity,
          title: `${metric.name} Alert`,
          message: `${metric.name} is at ${metric.value} (${metric.change > 0 ? '+' : ''}${metric.change}%)`,
          timestamp: metric.timestamp,
          action_required: metric.severity === 'critical'
        }));

      // Log da consulta do dashboard
      await connection.execute(
        `INSERT INTO security_events (event_type, ip_address, details, created_at) 
         VALUES ('dashboard_access', ?, ?, NOW())`,
        [
          'admin_dashboard',
          JSON.stringify({
            metrics_type: metricsType,
            time_range: timeRange,
            refresh_interval: refreshInterval,
            metrics_count: dashboardData.metrics.length,
            charts_count: dashboardData.charts.length,
            alerts_count: dashboardData.alerts.length,
            performed_by: 'admin',
            timestamp: new Date().toISOString()
          })
        ]
      );

      return new Response(JSON.stringify({
        success: true,
        dashboard_data: dashboardData
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${refreshInterval}`,
          'X-Refresh-Interval': refreshInterval.toString()
        }
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Error in realtime dashboard:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// GET para WebSocket endpoint e configurações
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'config') {
      return new Response(JSON.stringify({
        success: true,
        websocket_url: 'ws://localhost:8080',
        available_metrics: [
          'overview',
          'security',
          'performance',
          'threats',
          'compliance'
        ],
        default_refresh_interval: 30,
        max_refresh_interval: 300,
        min_refresh_interval: 5
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      error: 'Invalid action parameter'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in dashboard GET:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process dashboard request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};