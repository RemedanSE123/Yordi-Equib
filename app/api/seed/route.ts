import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if any users exist
    const users = await db.getAllUsers();
    
    if (users.length > 0) {
      return NextResponse.json(
        { message: 'Database already has users. Seeding skipped.' },
        { status: 200 }
      );
    }

    // Create initial Admin user
    const adminPassword = await bcrypt.hash('Yordi@321#', 10);
    
    await db.createUser({
      full_name: 'Admin User',
      phone: '+251901234567',
      email: 'admin@yordi.com',
      password: adminPassword,
      role: 'ADMIN',
    });

    return NextResponse.json(
      { message: 'Initial data seeded successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed initial data' },
      { status: 500 }
    );
  }
}
