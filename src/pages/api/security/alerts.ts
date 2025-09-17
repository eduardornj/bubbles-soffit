import { db } from '../../../lib/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '20', severity, status } = req.query;
    
    // Get recent security logs with proper date filtering
    let securityLogsQuery = db
      .selectFrom('security_logs')
      .selectAll()
      .where('created_at', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() as any)
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit as string));

    if (severity) {
      securityLogsQuery = securityLogsQuery.where('severity', '=', severity as any);
    }

    const securityLogs = await securityLogsQuery.execute();

    // Get blocked IPs with proper column selection
    let blockedIPsQuery = db
      .selectFrom('blocked_ips')
      .select(['id', 'ip_address', 'reason', 'severity', 'blocked_by', 'created_at', 'updated_at'])
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit as string));

    const blockedIPs = await blockedIPsQuery.execute();

    // Generate alerts based on recent activity
    const alerts = [];

    // Critical events alert
    const criticalEvents = securityLogs.filter(log => log.severity === 'critical');
    if (criticalEvents.length > 0) {
      alerts.push({
        id: 'critical-events',
        type: 'CRITICAL_SECURITY_EVENTS',
        level: 'CRITICAL',
        title: 'Critical Security Events Detected',
        message: `${criticalEvents.length} critical security events in the last 24 hours`,
        count: criticalEvents.length,
        timestamp: new Date().toISOString(),
        details: criticalEvents.slice(0, 5)
      });
    }

    // High severity events alert
    const highEvents = securityLogs.filter(log => log.severity === 'high');
    if (highEvents.length > 5) {
      alerts.push({
        id: 'high-severity-events',
        type: 'HIGH_SEVERITY_EVENTS',
        level: 'WARNING',
        title: 'High Severity Security Events',
        message: `${highEvents.length} high severity events detected`,
        count: highEvents.length,
        timestamp: new Date().toISOString(),
        details: highEvents.slice(0, 5)
      });
    }

    // Recent IP blocks alert
    const recentBlocks = blockedIPs.filter(ip => {
      const blockTime = new Date(ip.created_at).getTime();
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return blockTime > oneDayAgo;
    });

    if (recentBlocks.length > 0) {
      alerts.push({
        id: 'recent-ip-blocks',
        type: 'IP_BLOCKS',
        level: 'INFO',
        title: 'Recent IP Blocks',
        message: `${recentBlocks.length} IPs blocked in the last 24 hours`,
        count: recentBlocks.length,
        timestamp: new Date().toISOString(),
        details: recentBlocks.slice(0, 5)
      });
    }

    // Bot activity alert
    const botEvents = securityLogs.filter(log => 
      log.event_type?.includes('bot') || 
      log.event_type?.includes('BOT') ||
      log.details?.includes('bot')
    );

    if (botEvents.length > 10) {
      alerts.push({
        id: 'bot-activity',
        type: 'HIGH_BOT_ACTIVITY',
        level: 'WARNING',
        title: 'High Bot Activity',
        message: `${botEvents.length} bot-related events detected`,
        count: botEvents.length,
        timestamp: new Date().toISOString(),
        details: botEvents.slice(0, 5)
      });
    }

    return res.status(200).json({
      alerts,
      summary: {
        total_alerts: alerts.length,
        critical_count: alerts.filter(a => a.level === 'CRITICAL').length,
        warning_count: alerts.filter(a => a.level === 'WARNING').length,
        info_count: alerts.filter(a => a.level === 'INFO').length,
        last_updated: new Date().toISOString()
      },
      recent_logs: securityLogs.slice(0, 10),
      blocked_ips: blockedIPs.slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching security alerts:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch security alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}