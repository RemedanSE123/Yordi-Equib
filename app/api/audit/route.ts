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
      LIMIT 100
    `;
    const res = await db.query<any>(query);

    const logs = res.rows.map(row => ({
      id: row.id,
      timestamp: new Date(row.created_at).toLocaleString(),
      user: row.user_name || 'System',
      action: row.action,
      entityType: row.table_name,
      entityId: row.record_id || 'N/A',
      details: `${row.action} on ${row.table_name}`,
      old_data: row.old_data,
      new_data: row.new_data,
    }));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
