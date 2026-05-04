import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone, role, password, is_active } = body;

    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await db.updateUser(id, updateData, (session.user as any).id);


    const { password: _, ...sanitizedUser } = user;
    return NextResponse.json(sanitizedUser);
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
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Don't allow deleting self
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await db.deleteUser(id, (session.user as any).id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.updateUser(id, { 
      password: hashedPassword,
    }, (session.user as any).id);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
