import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { days, severity, ip_address } = await request.json();

    let query = db.deleteFrom('security_logs');
    
    // Filter by days if provided
    if (days && days > 0) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      query = query.where('created_at', '<=', cutoffDate.toISOString() as any);
    }

    // Filter by severity if provided
    if (severity && severity !== 'all') {
      query = query.where('severity', '=', severity as any);
    }

    // Filter by IP address if provided
    if (ip_address) {
      query = query.where('ip_address', '=', ip_address);
    }

    const result = await query.execute() as any;

    // Log the cleanup action
    await db
      .insertInto('security_logs')
      .values({
        event_type: 'logs_cleared',
        ip_address: 'admin',
        severity: 'medium',
        message: `Security logs cleared: ${(result as any).numDeletedRows} records deleted`,
        details: JSON.stringify({ 
          days: days || 'all',
          severity: severity || 'all',
          ip_address: ip_address || 'all',
          deleted_count: (result as any).numDeletedRows
        }),
        created_at: new Date()
      } as any)
      .execute();

    return new Response(JSON.stringify({ 
      success: true, 
      deleted_count: (result as any).numDeletedRows,
      message: `${(result as any).numDeletedRows} security logs have been cleared`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return new Response(JSON.stringify({ error: 'Failed to clear security logs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};