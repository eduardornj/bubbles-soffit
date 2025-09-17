import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Total security events
    const totalLogs = await db
      .selectFrom('security_logs')
      .select(db.fn.count('id').as('count'))
      .executeTakeFirst();

    // Critical alerts in last hour
    const criticalAlerts = await db
      .selectFrom('security_logs')
      .select(db.fn.count('id').as('count'))
      .where('severity', '=', 'critical')
      .where('created_at', '>=', oneHourAgo)
      .executeTakeFirst();

    // Suspicious IPs (high/critical events in last day)
    const suspiciousIPs = await db
      .selectFrom('security_logs')
      .select(db.fn.count('ip_address').as('count'))
      .where('severity', 'in', ['high', 'critical'])
      .where('created_at', '>=', oneDayAgo)
      .executeTakeFirst();

    // Currently blocked IPs
    const blockedIPs = await db
      .selectFrom('blocked_ips')
      .select(db.fn.count('id').as('count'))
      .where('is_active', '=', true)
      .executeTakeFirst();

    // Failed login attempts in last hour
    const failedLogins = await db
      .selectFrom('security_logs')
      .select(db.fn.count('id').as('count'))
      .where('event_type', '=', 'login_failed')
      .where('created_at', '>=', oneHourAgo)
      .executeTakeFirst();

    // Brute force attempts in last hour
    const bruteForceAttempts = await db
      .selectFrom('security_logs')
      .select(db.fn.count('id').as('count'))
      .where('event_type', '=', 'brute_force')
      .where('created_at', '>=', oneHourAgo)
      .executeTakeFirst();

    // Top suspicious IPs with event count
    const topSuspiciousIPs = await db
      .selectFrom('security_logs')
      .select([
        'ip_address',
        db.fn.count('id').as('event_count'),
        db.fn.max('created_at').as('last_event')
      ])
      .where('severity', 'in', ['high', 'critical'])
      .where('created_at', '>=', oneDayAgo)
      .groupBy('ip_address')
      .orderBy(db.fn.count('id'), 'desc')
      .limit(5)
      .execute();

    // Top event types
    const topEventTypes = await db
      .selectFrom('security_logs')
      .select([
        'event_type',
        db.fn.count('id').as('count')
      ])
      .where('created_at', '>=', oneDayAgo)
      .groupBy('event_type')
      .orderBy(db.fn.count('id'), 'desc')
      .limit(5)
      .execute();

    const stats = {
      total_events: Number(totalLogs?.count ?? 0),
      critical_alerts: Number(criticalAlerts?.count ?? 0),
      suspicious_ips: Number(suspiciousIPs?.count ?? 0),
      blocked_ips: Number(blockedIPs?.count ?? 0),
      failed_logins_last_hour: Number(failedLogins?.count ?? 0),
      brute_force_attempts_last_hour: Number(bruteForceAttempts?.count ?? 0),
      top_suspicious_ips: topSuspiciousIPs.map(ip => ({
        ip_address: ip.ip_address,
        count: Number(ip.event_count),
        last_event: ip.last_event
      })),
      top_event_types: topEventTypes.map(type => ({
        event_type: type.event_type,
        count: Number(type.count)
      }))
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch security stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};