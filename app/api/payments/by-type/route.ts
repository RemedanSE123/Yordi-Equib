import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'EKUB type is required' }, { status: 400 });
    }

    const typeMapping: Record<string, string> = {
      'daily': 'DAILY',
      'weekly': 'WEEKLY',
      'monthly': 'MONTHLY',
      '105-days': 'DAY_105',
      'share': 'SHARE'
    };

    const dbType = typeMapping[type.toLowerCase()] || type.toUpperCase();

    // Fetch all payments for this EKUB type
    let query = `
      SELECT 
        p.*, 
        u.full_name as recorded_by_name,
        c.customer_code
      FROM payments p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.ekub_type = $1
    `;
    const params = [dbType];

    // Role-based filtering for Employees
    if ((session.user as any).role === 'EMPLOYEE') {
      query += ' AND p.created_by = $2';
      params.push((session.user as any).id);
    }

    query += ' ORDER BY p.created_at DESC';

    const res = await db.query<any>(query, params);
    
    // Also fetch all customers of this type to ensure matrix shows everyone
    let custQuery = 'SELECT * FROM customers WHERE ekub_type = $1';
    const custParams = [dbType];
    if ((session.user as any).role === 'EMPLOYEE') {
      custQuery += ' AND created_by = $2';
      custParams.push((session.user as any).id);
    }
    const custRes = await db.query<any>(custQuery, custParams);

    return NextResponse.json({
      payments: res.rows,
      customers: custRes.rows
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
