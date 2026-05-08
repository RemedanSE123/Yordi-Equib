import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = `
      SELECT 
        al.*, 
        u.full_name as user_name 
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 500
    `;
    const res = await db.query<any>(query);

    const logs = res.rows.map(row => {
      let details = `${row.action} on ${row.table_name}`;
      const data = row.new_data || row.old_data || {};
      
      if (row.table_name === 'payments') {
        details = `${row.action === 'INSERT' ? 'Recorded' : row.action === 'DELETE' ? 'Removed' : 'Updated'} payment of ETB ${data.amount?.toLocaleString() || '0'} for ${data.customer_name || 'unknown'}`;
      } else if (row.table_name === 'customers') {
        details = `${row.action === 'INSERT' ? 'Registered' : row.action === 'DELETE' ? 'Archived' : 'Modified'} member: ${data.full_name || 'unknown'}`;
      } else if (row.table_name === 'users') {
        details = `${row.action === 'INSERT' ? 'Created' : 'Updated'} staff account: ${data.full_name || 'unknown'}`;
      } else if (row.table_name === 'auth_sessions') {
        if (row.action === 'LOGIN_SUCCESS') {
          details = 'Successful login';
        } else if (row.action === 'SESSION_START') {
          details = 'Session started';
        } else if (row.action === 'MANUAL_LOGOUT') {
          details = 'Manual logout';
        } else if (row.action === 'SESSION_END') {
          details = 'Session ended';
        } else {
          details = row.action;
        }
      }

      return {
        id: row.id,
        createdAt: row.created_at,
        timestamp: new Date(row.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        user: row.user_name || 'System',
        action: row.action,
        entityType: row.table_name,
        entityId: row.record_id || 'N/A',
        details,
        old_data: row.old_data,
        new_data: row.new_data,
      };
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
