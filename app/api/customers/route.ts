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
  // Parse body BEFORE try so variables are accessible in catch
  const body = await request.json().catch(() => ({}));
  const { customer_code, full_name, phone, ekub_type } = body;

  try {
    const session = await getServerSession(authConfig);
    if (!session || !['ADMIN', 'MANAGER', 'SECRETARY', 'EMPLOYEE'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!customer_code || !full_name || !phone || !ekub_type) {
      return NextResponse.json({ error: 'All fields are required: Customer ID, Full Name, Phone Number, and EKUB Type.' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Phone number must be exactly 10 digits.' }, { status: 400 });
    }

    // ── Pre-insert duplicate checks ───────────────────────────────────────────
    const dupCheck = await db.query<any>(
      `SELECT
         COUNT(*) FILTER (WHERE LOWER(full_name) = LOWER($1)) AS name_count,
         COUNT(*) FILTER (WHERE customer_code = $2)            AS code_count,
         COUNT(*) FILTER (WHERE phone = $3)                    AS phone_count
       FROM customers`,
      [full_name, customer_code, phone],
      (session.user as any).id
    );

    const { name_count, code_count, phone_count } = dupCheck.rows[0];

    if (Number(code_count) > 0) {
      return NextResponse.json(
        { error: `Customer ID "${customer_code}" is already in use. Please choose a different Customer ID.` },
        { status: 409 }
      );
    }
    if (Number(phone_count) > 0) {
      return NextResponse.json(
        { error: 'This phone number is already registered to another customer. Please use a different phone number.' },
        { status: 409 }
      );
    }
    if (Number(name_count) > 0) {
      return NextResponse.json(
        { error: `A customer named "${full_name}" already exists. Please verify the name or use a unique full name.` },
        { status: 409 }
      );
    }

    const customer = await db.createCustomer({
      customer_code,
      full_name,
      phone,
      ekub_type,
    }, (session.user as any).id);

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);

    // PostgreSQL unique constraint violation (duplicate key)
    if (error?.code === '23505') {
      const detail: string = error?.detail || '';
      if (detail.includes('customer_code')) {
        return NextResponse.json(
          { error: `Customer ID "${customer_code}" is already in use. Please choose a different Customer ID.` },
          { status: 409 }
        );
      }
      if (detail.includes('phone')) {
        return NextResponse.json(
          { error: 'This phone number is already registered to another customer. Please use a different phone number.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'A customer with this Customer ID or phone number already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
