import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { investigation_type, params } = await request.json();

    let results;

    switch (investigation_type) {
      case 'timeline_analysis':
        results = await db.selectFrom('security_logs')
          .selectAll()
          .where('ip_address', '=', params.ip)
          .where('created_at', '>=', new Date(params.start_time))
          .where('created_at', '<=', new Date(params.end_time))
          .orderBy('created_at', 'asc')
          .execute();
        break;
      case 'attack_pattern_analysis':
        // Analyze attack patterns from security logs
        results = await db.selectFrom('security_logs')
          .select([
            'event_type',
            'severity',
            'ip_address',
            'message',
            'created_at'
          ])
          .where('message', 'like', `%${params.pattern}%`)
          .orderBy('created_at', 'desc')
          .limit(100)
          .execute();
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid investigation type' }), { status: 400 });
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error during forensic investigation:', error);
    return new Response(JSON.stringify({ error: 'Failed to perform forensic investigation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};