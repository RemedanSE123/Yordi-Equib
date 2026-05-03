import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Create demo users
    const adminPassword = await bcrypt.hash('Yordi@321#', 10);

    // Admin user
    await db.createUser({
      phone: '+251901234567',
      hashedPassword: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
    });

    // Manager user
    await db.createUser({
      phone: '+251902345678',
      hashedPassword: adminPassword,
      fullName: 'Manager User',
      role: 'manager',
      ekubName: 'Daily EKUB',
    });

    // Secretary user
    await db.createUser({
      phone: '+251903456789',
      hashedPassword: adminPassword,
      fullName: 'Secretary User',
      role: 'secretary',
      ekubName: 'Weekly EKUB',
    });

    // Employee user
    await db.createUser({
      phone: '+251904567890',
      hashedPassword: adminPassword,
      fullName: 'Employee User',
      role: 'employee',
      ekubName: 'Monthly EKUB',
    });

    // Create demo EKUBs
    const dailyEkub = await db.createEkub({
      name: 'Daily EKUB Group 1',
      type: 'daily',
      contributionAmount: 100,
      frequencyDays: 1,
      totalRounds: 20,
      currentRound: 5,
      startDate: new Date('2025-01-01'),
      status: 'active',
      createdBy: 'admin',
    });

    const weeklyEkub = await db.createEkub({
      name: 'Weekly EKUB Group 1',
      type: 'weekly',
      contributionAmount: 500,
      frequencyDays: 7,
      totalRounds: 15,
      currentRound: 3,
      startDate: new Date('2025-01-01'),
      status: 'active',
      createdBy: 'admin',
    });

    const monthlyEkub = await db.createEkub({
      name: 'Monthly EKUB Group 1',
      type: 'monthly',
      contributionAmount: 2000,
      frequencyDays: 30,
      totalRounds: 12,
      currentRound: 2,
      startDate: new Date('2025-01-01'),
      status: 'active',
      createdBy: 'admin',
    });

    // Create demo customers
    const customers = [];
    for (let i = 1; i <= 10; i++) {
      const customer = await db.createCustomer({
        ekubId: dailyEkub.id,
        phone: `+251905000000${i}`,
        fullName: `Customer ${i}`,
        totalContributions: i * 500,
        totalPayouts: i < 5 ? i * 2000 : 0,
        participationRounds: 5,
        winningRounds: i < 5 ? 1 : 0,
        status: 'active',
        joinedAt: new Date(),
      });
      customers.push(customer);
    }

    // Create demo payments
    for (let i = 0; i < customers.length; i++) {
      for (let round = 1; round <= 5; round++) {
        await db.createPayment({
          ekubId: dailyEkub.id,
          customerId: customers[i].id,
          round,
          amount: 100,
          dueDate: new Date(),
          paidDate: round < 5 ? new Date() : undefined,
          status: round < 5 ? 'completed' : 'pending',
        });
      }
    }

    // Create demo payouts
    for (let i = 0; i < Math.min(2, customers.length); i++) {
      await db.createPayout({
        ekubId: dailyEkub.id,
        customerId: customers[i].id,
        round: i + 1,
        amount: 1000,
        payoutDate: new Date(),
        status: 'completed',
      });
    }

    // Create demo audit logs
    await db.logAudit({
      userId: 'admin',
      action: 'CREATE',
      entityType: 'EKUB',
      entityId: dailyEkub.id,
      changes: {
        after: {
          name: dailyEkub.name,
          type: dailyEkub.type,
        },
      },
    });

    return NextResponse.json(
      { message: 'Database seeded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
