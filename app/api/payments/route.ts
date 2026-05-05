import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || !['ADMIN', 'MANAGER', 'SECRETARY', 'EMPLOYEE'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      customer_id, 
      customer_name, 
      phone, 
      ekub_type, 
      amount, 
      round_number, 
      payment_period, 
      payment_status, 
      payment_date,
      ethiopian_year
    } = body;

    if (!customer_id || !amount || !round_number || !payment_period) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Role-based validation: Employees can only add payments for their own customers
    if ((session.user as any).role === 'EMPLOYEE') {
      const customer = await db.getCustomerById(customer_id);
      if (!customer || customer.created_by !== (session.user as any).id) {
        return NextResponse.json({ error: 'Unauthorized: You can only record payments for your own customers' }, { status: 401 });
      }
    }

    const payment = await db.createPayment({
      customer_id,
      customer_name,
      phone,
      ekub_type,
      amount,
      round_number,
      payment_period,
      payment_status: payment_status || 'PAID',
      payment_date: payment_date ? new Date(payment_date) : new Date(),
      ethiopian_year: ethiopian_year ?? 2018,
    } as any, (session.user as any).id);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Role check for Employee
    if ((session.user as any).role === 'EMPLOYEE') {
      const customer = await db.getCustomerById(customerId);
      if (!customer || customer.created_by !== (session.user as any).id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const payments = await db.getPaymentsByCustomerId(customerId);
    return NextResponse.json(payments);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
