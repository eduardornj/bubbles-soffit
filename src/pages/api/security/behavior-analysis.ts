import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const GET: APIRoute = async () => {
  try {
    // Analyze behavior patterns from security logs
    const behaviorPatterns = await db
      .selectFrom('security_logs')
      .select([
        'ip_address',
        db.fn.count('id').as('request_count'),
        db.fn.max('created_at').as('last_seen'),
        db.fn.sum(
          db.case()
            .when('event_type', '=', 'login_failed')
            .then(1)
            .else(0)
            .end()
        ).as('failed_logins')
      ])
      .groupBy('ip_address')
      .orderBy(db.fn.count('id'), 'desc')
      .limit(50)
      .execute();

    return new Response(JSON.stringify(behaviorPatterns), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching behavior analysis:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch behavior analysis' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};