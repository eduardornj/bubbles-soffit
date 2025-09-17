import type { APIRoute } from 'astro';
import { db } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ip_address, reason, severity } = await request.json();

    if (!ip_address || !reason) {
      return new Response(JSON.stringify({ error: 'IP address and reason are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if IP is already blocked
    const existingBlock = await db
      .selectFrom('blocked_ips')
      .select('id')
      .where('ip_address', '=', ip_address)
      .where('is_active', '=', true)
      .executeTakeFirst() as any;

    if (existingBlock) {
      return new Response(JSON.stringify({ error: 'IP is already blocked' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Block the IP
    const result = await db
      .insertInto('blocked_ips')
      .values({
        ip_address,
        reason,
        severity: severity || 'high',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        blocked_by: 'admin'
      } as any)
      .executeTakeFirst();

    // Log the blocking action
    await db
      .insertInto('security_logs')
      .values({
        event_type: 'ip_blocked',
        ip_address: ip_address,
        severity: severity || 'high',
        message: `IP ${ip_address} blocked: ${reason}`,
        details: JSON.stringify({ reason, severity }),
        created_at: new Date()
      } as any)
      .execute();

    return new Response(JSON.stringify({ 
      success: true, 
      id: Number((result as any).insertId),
      message: `IP ${ip_address} has been blocked` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error blocking IP:', error);
    return new Response(JSON.stringify({ error: 'Failed to block IP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { ip_address } = await request.json();

    if (!ip_address) {
      return new Response(JSON.stringify({ error: 'IP address is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unblock the IP
    const result = await db
      .updateTable('blocked_ips')
      .set({ 
        is_active: false,
        updated_at: new Date()
      })
      .where('ip_address', '=', ip_address)
      .where('is_active', '=', true)
      .execute() as any;

    if ((result as any).numUpdatedRows === 0) {
      return new Response(JSON.stringify({ error: 'IP not found or already unblocked' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log the unblocking action
    await db
      .insertInto('security_logs')
      .values({
        event_type: 'ip_unblocked',
        ip_address: ip_address,
        severity: 'medium',
        message: `IP ${ip_address} has been unblocked`,
        details: JSON.stringify({ action: 'manual_unblock' }),
        created_at: new Date()
      } as any)
      .execute();

    return new Response(JSON.stringify({ 
      success: true, 
      message: `IP ${ip_address} has been unblocked` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    return new Response(JSON.stringify({ error: 'Failed to unblock IP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};