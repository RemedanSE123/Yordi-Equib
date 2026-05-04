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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportCategory = searchParams.get('category') || 'financial'; // financial, growth, operational, staff

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const isAdmin = role === 'ADMIN' || role === 'MANAGER';
    
    const params: any[] = [];
    let pIdx = 1;
    let userFilter = '';
    
    if (!isAdmin) {
      userFilter = `AND p.created_by = $${pIdx++}`;
      params.push(userId);
    }

    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND p.payment_date BETWEEN $${pIdx++} AND $${pIdx++}`;
      params.push(startDate, endDate);
    }

    // --- 1. CORE FINANCIAL DATA ---
    const paymentsQuery = `
      SELECT 
        p.id, p.amount, p.round_number as round, p.payment_date as date,
        p.customer_name, c.customer_code as customer_id, p.ekub_type,
        u.full_name as recorded_by
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.payment_status = 'PAID' ${userFilter} ${dateFilter}
      ORDER BY p.payment_date DESC
    `;
    const payments = await db.query<any>(paymentsQuery, params);

    // --- 2. INTELLIGENCE LAYERS ---
    const intelligence: any = {};

    if (isAdmin) {
      const staffPerf = await db.query(`
        SELECT u.full_name, COUNT(p.id) as tx_count, SUM(p.amount) as total_volume
        FROM payments p
        JOIN users u ON p.created_by = u.id
        WHERE p.payment_status = 'PAID' ${dateFilter.replace(/p\./g, '')}
        GROUP BY u.full_name
        ORDER BY total_volume DESC
      `, params.filter(p => p !== userId));
      intelligence.staffPerformance = staffPerf.rows;

      const schemeStats = await db.query(`
        SELECT ekub_type, COUNT(id) as members_active, SUM(amount) as revenue
        FROM payments
        WHERE payment_status = 'PAID' ${dateFilter.replace(/p\./g, '')}
        GROUP BY ekub_type
      `, params.filter(p => p !== userId));
      intelligence.schemeStats = schemeStats.rows;
    } else {
      const myStats = await db.query(`
        SELECT payment_date as label, SUM(amount) as amount
        FROM payments p
        WHERE p.created_by = $1 ${dateFilter}
        GROUP BY payment_date
        ORDER BY payment_date ASC
      `, params);
      intelligence.personalVelocity = myStats.rows;
    }

    // --- 3. TRENDS (Filtered by role if needed) ---
    const trendParams = [...params];
    const trendUserFilter = isAdmin ? '' : `AND p.created_by = $1`;
    const trendDateFilter = isAdmin 
      ? `WHERE p.payment_date BETWEEN $1 AND $2` 
      : `AND p.payment_date BETWEEN $2 AND $3`;

    const growthTrend = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as label, COUNT(id) as count
      FROM customers
      WHERE created_at::date BETWEEN $${isAdmin ? 1 : 2}::date AND $${isAdmin ? 2 : 3}::date
      ${isAdmin ? '' : 'AND created_by = $1'}
      GROUP BY label
      ORDER BY label ASC
    `, trendParams);

    const opsTrend = await db.query(`
      SELECT TO_CHAR(p.payment_date, 'YYYY-MM-DD') as label, COUNT(p.id) as count
      FROM payments p
      WHERE p.payment_date BETWEEN $${isAdmin ? 1 : 2}::date AND $${isAdmin ? 2 : 3}::date
      ${trendUserFilter}
      GROUP BY label
      ORDER BY label ASC
    `, trendParams);

    const financialTrend = await db.query(`
      SELECT TO_CHAR(p.payment_date, 'YYYY-MM-DD') as label, SUM(p.amount) as amount
      FROM payments p
      WHERE p.payment_date BETWEEN $${isAdmin ? 1 : 2}::date AND $${isAdmin ? 2 : 3}::date
      ${trendUserFilter}
      GROUP BY label
      ORDER BY label ASC
    `, trendParams);

    return NextResponse.json({
      role,
      payments: payments.rows,
      intelligence,
      growthTrend: growthTrend.rows.map(r => ({ label: r.label, count: Number(r.count) })),
      opsTrend: opsTrend.rows.map(r => ({ label: r.label, count: Number(r.count) })),
      financialTrend: financialTrend.rows.map(r => ({ label: r.label, amount: Number(r.amount) })),
      summary: {
        totalVolume: payments.rows.reduce((acc, p) => acc + Number(p.amount), 0),
        avgTx: payments.rows.length > 0 ? payments.rows.reduce((acc, p) => acc + Number(p.amount), 0) / payments.rows.length : 0,
        txCount: payments.rows.length
      }
    });
  } catch (error) {
    console.error('Advanced Reports API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
