import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.getAllUsers();
    // Remove passwords from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone, role, password } = body;

    if (!full_name || !phone || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.getUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this phone already exists' }, { status: 400 });
    }

    // Default password if not provided
    const finalPassword = password || 'Yordi@321#';
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    
    const user = await db.createUser({
      full_name,
      phone,
      role,
      password: hashedPassword,
    }, (session.user as any).id);

    const { password: _, ...sanitizedUser } = user;
    return NextResponse.json(sanitizedUser, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
