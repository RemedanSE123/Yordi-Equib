// Mock Database Layer - Replace with real PostgreSQL when ready
// This simulates the complete YORDI EKUB system database schema

import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'manager' | 'secretary' | 'employee' | 'customer';
export type EkubType = 'daily' | 'weekly' | 'monthly' | '105days' | 'share';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type PayoutStatus = 'pending' | 'completed' | 'unclaimed';

export interface User {
  id: string;
  phone: string;
  hashedPassword: string;
  fullName: string;
  role: UserRole;
  ekubName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  ekubId: string;
  phone: string;
  fullName: string;
  totalContributions: number;
  totalPayouts: number;
  participationRounds: number;
  winningRounds: number;
  status: 'active' | 'inactive';
  joinedAt: Date;
}

export interface EkubConfig {
  id: string;
  name: string;
  type: EkubType;
  contributionAmount: number;
  frequencyDays: number;
  totalRounds: number;
  currentRound: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'closed';
  createdBy: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  ekubId: string;
  customerId: string;
  round: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  createdAt: Date;
}

export interface Payout {
  id: string;
  ekubId: string;
  customerId: string;
  round: number;
  amount: number;
  payoutDate?: Date;
  status: PayoutStatus;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: {
    before?: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress?: string;
  timestamp: Date;
}

// In-memory database storage
class MockDatabase {
  private users: Map<string, User> = new Map();
  private customers: Map<string, Customer> = new Map();
  private ekubs: Map<string, EkubConfig> = new Map();
  private payments: Map<string, Payment> = new Map();
  private payouts: Map<string, Payout> = new Map();
  private auditLogs: AuditLog[] = [];
  private demoUsersSeedPromise: Promise<void> | null = null;

  private async ensureDemoUsers(): Promise<void> {
    if (this.users.size > 0) {
      return;
    }

    if (!this.demoUsersSeedPromise) {
      this.demoUsersSeedPromise = (async () => {
        const hashedPassword = await bcrypt.hash('Yordi@321#', 10);

        await this.createUser({
          phone: '+251901234567',
          hashedPassword,
          fullName: 'Admin User',
          role: 'admin',
        });

        await this.createUser({
          phone: '+251902345678',
          hashedPassword,
          fullName: 'Manager User',
          role: 'manager',
          ekubName: 'Daily EKUB',
        });

        await this.createUser({
          phone: '+251903456789',
          hashedPassword,
          fullName: 'Secretary User',
          role: 'secretary',
          ekubName: 'Weekly EKUB',
        });

        await this.createUser({
          phone: '+251904567890',
          hashedPassword,
          fullName: 'Employee User',
          role: 'employee',
          ekubName: 'Monthly EKUB',
        });
      })().finally(() => {
        this.demoUsersSeedPromise = null;
      });
    }

    await this.demoUsersSeedPromise;
  }

  // User operations
  async getUserByPhone(phone: string): Promise<User | null> {
    await this.ensureDemoUsers();
    return Array.from(this.users.values()).find(u => u.phone === phone) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // EKUB Config operations
  async createEkub(ekub: Omit<EkubConfig, 'id' | 'createdAt'>): Promise<EkubConfig> {
    const id = `ekub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEkub: EkubConfig = {
      ...ekub,
      id,
      createdAt: new Date(),
    };
    this.ekubs.set(id, newEkub);
    return newEkub;
  }

  async getEkubById(id: string): Promise<EkubConfig | null> {
    return this.ekubs.get(id) || null;
  }

  async getAllEkubs(): Promise<EkubConfig[]> {
    return Array.from(this.ekubs.values());
  }

  async updateEkub(id: string, data: Partial<EkubConfig>): Promise<EkubConfig | null> {
    const ekub = this.ekubs.get(id);
    if (!ekub) return null;
    const updated = { ...ekub, ...data };
    this.ekubs.set(id, updated);
    return updated;
  }

  // Customer operations
  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const id = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCustomer: Customer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return this.customers.get(id) || null;
  }

  async getCustomersByEkub(ekubId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(c => c.ekubId === ekubId);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const customer = this.customers.get(id);
    if (!customer) return null;
    const updated = { ...customer, ...data };
    this.customers.set(id, updated);
    return updated;
  }

  // Payment operations
  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date(),
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async getPaymentsByEkub(ekubId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.ekubId === ekubId);
  }

  async getPaymentsByCustomer(customerId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.customerId === customerId);
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;
    const updated = { ...payment, ...data };
    this.payments.set(id, updated);
    return updated;
  }

  // Payout operations
  async createPayout(payout: Omit<Payout, 'id' | 'createdAt'>): Promise<Payout> {
    const id = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPayout: Payout = {
      ...payout,
      id,
      createdAt: new Date(),
    };
    this.payouts.set(id, newPayout);
    return newPayout;
  }

  async getPayoutsByEkub(ekubId: string): Promise<Payout[]> {
    return Array.from(this.payouts.values()).filter(p => p.ekubId === ekubId);
  }

  async updatePayout(id: string, data: Partial<Payout>): Promise<Payout | null> {
    const payout = this.payouts.get(id);
    if (!payout) return null;
    const updated = { ...payout, ...data };
    this.payouts.set(id, updated);
    return updated;
  }

  // Audit Log operations
  async logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLog: AuditLog = {
      ...log,
      id,
      timestamp: new Date(),
    };
    this.auditLogs.push(newLog);
    return newLog;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogs.slice(-limit).reverse();
  }

  async getAuditLogsForEntity(entityId: string): Promise<AuditLog[]> {
    return this.auditLogs.filter(log => log.entityId === entityId);
  }
}

// Export singleton instance
export const db = new MockDatabase();
