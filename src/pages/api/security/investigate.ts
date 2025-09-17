import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const ip = url.searchParams.get('ip');

  if (!ip) {
    return new Response(JSON.stringify({ error: 'IP address is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Buscar logs relacionados ao IP
    const logs = await db
      .selectFrom('security_logs')
      .selectAll()
      .where('ip_address', '=', ip)
      .orderBy('created_at', 'desc')
      .limit(100)
      .execute();

    // Verificar se o IP está bloqueado
    const blocked = await db
      .selectFrom('blocked_ips')
      .selectAll()
      .where('ip_address', '=', ip)
      .where('is_active', '=', true)
      .executeTakeFirst();

    // Análise de padrões
    const eventTypes = (logs as any[]).reduce((acc: any, log: any) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1;
      return acc;
    }, {});

    const severityCounts = (logs as any[]).reduce((acc: any, log: any) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {});

    const hourlyActivity = (logs as any[]).reduce((acc: any, log: any) => {
      const hour = new Date(log.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Timeline de atividades
    const timeline = (logs as any[]).slice(0, 20).map((log: any) => ({
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
      blocked_at: blocked?.created_at,
      expires_at: blocked?.updated_at,
      event_types: eventTypes,
      severity_counts: severityCounts,
      hourly_activity: hourlyActivity,
      recent_logs: timeline,
      risk_score: calculateRiskScore(logs, blocked)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error investigating IP:', error);
    return new Response(JSON.stringify({ error: 'Failed to investigate IP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function calculateRiskScore(logs: any[], blocked: any) {
  let score = 0;

  // Pontuação baseada em eventos
  const eventWeights: Record<string, number> = {
    'login_failed': 10,
    'brute_force_attempt': 50,
    'suspicious_activity': 30,
    'ip_blocked': 100,
    'attack_detected': 80,
    'malicious_request': 60
  };

  (logs as any[]).forEach((log: any) => {
    score += eventWeights[log.event_type] || 5;
  });

  // Aumentar pontuação se o IP estiver bloqueado
  if (blocked) score += 50;

  // Aumentar pontuação baseado na severidade
  (logs as any[]).forEach((log: any) => {
    switch (log.severity) {
      case 'high': score += 20; break;
      case 'critical': score += 40; break;
    }
  });

  // Normalizar para 0-100
  return Math.min(100, score);
}