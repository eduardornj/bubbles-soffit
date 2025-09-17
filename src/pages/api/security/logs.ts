import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';
import { sql } from 'kysely';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '15', 10);
  const offset = (page - 1) * limit;
  const search = url.searchParams.get('search') || '';
  const type = url.searchParams.get('type') || '';
  const date = url.searchParams.get('date') || '';
  const severity = url.searchParams.get('severity') || '';

  try {
    let query = db.selectFrom('security_logs').selectAll();

    if (search) {
      query = query.where((eb) => 
        eb.or([
          eb('event_type', 'like', `%${search}%`),
          eb('ip_address', 'like', `%${search}%`),
          eb('message', 'like', `%${search}%`)
        ])
      );
    }

    if (type) {
      query = query.where('event_type', '=', type);
    }

    if (date) {
      query = query.where('created_at', '>=', new Date(`${date} 00:00:00`))
                  .where('created_at', '<=', new Date(`${date} 23:59:59`));
    }

    if (severity) {
      query = query.where('severity', '=', severity as any);
    }

    const logs = await query.orderBy('created_at', 'desc').limit(limit).offset(offset).execute();

    let countQuery = db.selectFrom('security_logs').select((eb) => eb.fn.count('id').as('total'));

    if (search) {
      countQuery = countQuery.where((eb) => 
        eb.or([
          eb('event_type', 'like', `%${search}%`),
          eb('ip_address', 'like', `%${search}%`),
          eb('message', 'like', `%${search}%`)
        ])
      );
    }

    if (type) {
      countQuery = countQuery.where('event_type', '=', type);
    }

    if (date) {
      countQuery = countQuery.where('created_at', '>=', new Date(`${date} 00:00:00`))
                             .where('created_at', '<=', new Date(`${date} 23:59:59`));
    }

    if (severity) {
      countQuery = countQuery.where('severity', '=', severity as any);
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = Number(countResult?.total) || 0;

    return new Response(JSON.stringify({ logs, total, page, limit }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch security logs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};