export type UserRole = 'ADMIN' | 'MANAGER' | 'SECRETARY' | 'EMPLOYEE' | 'CUSTOMER';
export type EkubType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'DAY_105' | 'SHARE';
export type PaymentStatus = 'PAID' | 'UNPAID';

export interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string;
  ekub_type: EkubType;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  customer_id: string;
  customer_name?: string; // Snapshot
  phone?: string; // Snapshot
  ekub_type?: string; // Snapshot
  amount: number;
  round_number: number;
  payment_period: number;
  payment_status: PaymentStatus;
  payment_date?: Date;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  created_at: Date;
}
