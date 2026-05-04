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

    const typeMapping: Record<string, string> = {
      'daily': 'DAILY',
      'weekly': 'WEEKLY',
      'monthly': 'MONTHLY',
      '105-days': 'DAY_105',
      'share': 'SHARE'
    };

    let query = `
      SELECT 
        c.*, 
        u.full_name as created_by_name,
        (SELECT MAX(round_number) FROM payments WHERE customer_id = c.id) as current_round,
        (SELECT MAX(payment_period) FROM payments WHERE customer_id = c.id) as current_period,
        (SELECT payment_status FROM payments WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1) as last_payment_status,
        (SELECT SUM(amount) FROM payments WHERE customer_id = c.id AND payment_status = 'PAID') as total_paid
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
    `;
    const params = [];

    if (type) {
      const dbType = typeMapping[type.toLowerCase()] || type.toUpperCase();
      query += ' WHERE c.ekub_type = $1';
      params.push(dbType);
    }

    query += ' ORDER BY c.created_at DESC';

    const res = await db.query<any>(query, params, (session.user as any).id);
    
    let filteredRows = res.rows;
    if ((session.user as any).role === 'EMPLOYEE') {
      filteredRows = filteredRows.filter((row: any) => row.created_by === (session.user as any).id);
    }

    // Map to UI format
    const customers = filteredRows.map(row => ({
      id: row.id,
      customerId: row.customer_code,
      fullName: row.full_name,
      phone: row.phone,
      ekubType: row.ekub_type,
      isActive: row.is_active,
      round: row.current_round || 1,
      period: row.current_period || 1,
      paymentStatus: row.last_payment_status === 'PAID' ? 'Paid' : 'Unpaid',
      totalPaid: Number(row.total_paid || 0),
      createdByName: row.created_by_name || 'System',
      amount: 100, // Placeholder or default contribution amount
    }));

    return NextResponse.json(customers);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !['ADMIN', 'MANAGER', 'SECRETARY', 'EMPLOYEE'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customer_code, full_name, phone, ekub_type } = body;

    if (!customer_code || !full_name || !phone || !ekub_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const customer = await db.createCustomer({
      customer_code,
      full_name,
      phone,
      ekub_type,
    }, (session.user as any).id);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
