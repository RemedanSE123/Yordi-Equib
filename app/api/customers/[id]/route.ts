import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone, customer_code, ekub_type, is_active } = body;

    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (customer_code) updateData.customer_code = customer_code;
    if (ekub_type) updateData.ekub_type = ekub_type;
    if (is_active !== undefined) updateData.is_active = is_active;

    const customer = await db.updateCustomer(id, updateData, (session.user as any).id);

    return NextResponse.json(customer);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session || !['ADMIN', 'MANAGER'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.deleteCustomer(id, (session.user as any).id);

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
