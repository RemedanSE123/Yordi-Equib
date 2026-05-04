import { Pool, QueryResult } from 'pg';
import { 
  User, EkubType, 
  Customer, Payment, AuditLog,
  PaymentStatus 
} from './schema-types';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

class Database {
  // Utility to validate UUID format
  private isUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  // Utility to run queries with optional session user for audit triggers
  async query<T>(text: string, params?: any[], userId?: string): Promise<QueryResult<T>> {
    const client = await pool.connect();
    try {
      if (userId && this.isUUID(userId)) {
        await client.query(`SET LOCAL "app.user_id" = '${userId}'`);
      }
      const res = await client.query(text, params);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Executed query', { text, rows: res.rowCount });
      }
      return res;
    } finally {
      client.release();
    }
  }

  // User operations
  async getUserByPhone(phone: string): Promise<User | null> {
    const res = await this.query<User>('SELECT * FROM users WHERE phone = $1', [phone]);
    return res.rows[0] || null;
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.isUUID(id)) return null;
    const res = await this.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async createUser(user: Partial<User>, adminId?: string): Promise<User> {
    const { full_name, phone, password, role } = user;
    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : null;
    
    const res = await this.query<User>(
      'INSERT INTO users (full_name, phone, password, role, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [full_name, phone, password, role, validatedAdminId],
      validatedAdminId || undefined
    );
    return res.rows[0];
  }

  async updateUser(id: string, user: Partial<User>, adminId?: string): Promise<User> {
    if (!this.isUUID(id)) throw new Error('Invalid user ID');
    const updatableFields = ['full_name', 'phone', 'password', 'role', 'is_active'];
    const fields = Object.keys(user).filter(k => updatableFields.includes(k) && user[k as keyof User] !== undefined);
    
    if (fields.length === 0) return this.getUserById(id) as any;

    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : null;
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map(f => user[f as keyof User]);
    
    const res = await this.query<User>(
      `UPDATE users SET ${setClause}, updated_by = $${fields.length + 2}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values, validatedAdminId],
      validatedAdminId || undefined
    );
    return res.rows[0];
  }

  async deleteUser(id: string, adminId?: string): Promise<void> {
    if (!this.isUUID(id)) return;
    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : undefined;
    await this.query('DELETE FROM users WHERE id = $1', [id], validatedAdminId);
  }

  async getAllUsers(): Promise<any[]> {
    const res = await this.query(`
      SELECT u1.*, u2.full_name as created_by_name 
      FROM users u1 
      LEFT JOIN users u2 ON u1.created_by = u2.id 
      ORDER BY u1.created_at DESC
    `);
    return res.rows;
  }

  // Customer operations
  async createCustomer(customer: Partial<Customer>, adminId?: string): Promise<Customer> {
    const { customer_code, full_name, phone, ekub_type } = customer;
    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : null;
    const res = await this.query<Customer>(
      'INSERT INTO customers (customer_code, full_name, phone, ekub_type, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customer_code, full_name, phone, ekub_type, validatedAdminId],
      validatedAdminId || undefined
    );
    return res.rows[0];
  }

  async updateCustomer(id: string, customer: Partial<Customer>, adminId?: string): Promise<Customer> {
    if (!this.isUUID(id)) throw new Error('Invalid customer ID');
    const updatableFields = ['customer_code', 'full_name', 'phone', 'ekub_type', 'is_active'];
    const fields = Object.keys(customer).filter(k => updatableFields.includes(k) && customer[k as keyof Customer] !== undefined);
    
    if (fields.length === 0) return this.getCustomerById(id) as any;

    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : null;
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map(f => customer[f as keyof Customer]);
    
    const res = await this.query<Customer>(
      `UPDATE customers SET ${setClause}, updated_by = $${fields.length + 2}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values, validatedAdminId],
      validatedAdminId || undefined
    );
    return res.rows[0];
  }

  async deleteCustomer(id: string, adminId?: string): Promise<void> {
    if (!this.isUUID(id)) return;
    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : undefined;
    await this.query('DELETE FROM customers WHERE id = $1', [id], validatedAdminId);
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const res = await this.query<Customer>('SELECT * FROM customers WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async getAllCustomers(role?: string, userId?: string): Promise<any[]> {
    let query = `
      SELECT c.*, u.full_name as created_by_name 
      FROM customers c 
      LEFT JOIN users u ON c.created_by = u.id
    `;
    const params = [];
    
    if (role === 'EMPLOYEE' && userId) {
      query += ' WHERE c.created_by = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY c.created_at DESC';
    const res = await this.query<any>(query, params);
    return res.rows;
  }

  // Payment operations
  async createPayment(payment: Partial<Payment>, adminId?: string): Promise<Payment> {
    const { customer_id, customer_name, phone, ekub_type, amount, round_number, payment_period, payment_status, payment_date } = payment;
    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : null;
    const res = await this.query<Payment>(
      `INSERT INTO payments (
        customer_id, customer_name, phone, ekub_type, 
        amount, round_number, payment_period, 
        payment_status, payment_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        customer_id, customer_name, phone, ekub_type, 
        amount, round_number, payment_period, 
        payment_status, payment_date, validatedAdminId
      ],
      validatedAdminId || undefined
    );
    return res.rows[0];
  }

  async getPaymentsByCustomerId(customerId: string): Promise<Payment[]> {
    const res = await this.query<Payment>(
      `SELECT p.*, u.full_name as created_by_name 
       FROM payments p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.customer_id = $1 
       ORDER BY p.created_at DESC`,
      [customerId]
    );
    return res.rows;
  }

  async updatePayment(id: string, payment: Partial<Payment>, adminId?: string): Promise<Payment> {
    if (!this.isUUID(id)) throw new Error('Invalid payment ID');
    const updatableFields = ['amount', 'round_number', 'payment_period', 'payment_status', 'payment_date'];
    const fields = Object.keys(payment).filter(k => updatableFields.includes(k) && payment[k as keyof Payment] !== undefined);
    
    if (fields.length === 0) return this.getPaymentById(id) as any;

    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : null;
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map(f => payment[f as keyof Payment]);
    
    const res = await this.query<Payment>(
      `UPDATE payments SET ${setClause}, updated_by = $${fields.length + 2}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values, validatedAdminId],
      validatedAdminId || undefined
    );
    return res.rows[0];
  }

  async deletePayment(id: string, adminId?: string): Promise<void> {
    if (!this.isUUID(id)) return;
    const validatedAdminId = adminId && this.isUUID(adminId) ? adminId : undefined;
    await this.query('DELETE FROM payments WHERE id = $1', [id], validatedAdminId);
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    const res = await this.query<Payment>('SELECT * FROM payments WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  // Audit Log operations (Legacy manual logging, but triggers are preferred)
  async logAudit(log: Partial<AuditLog>): Promise<AuditLog> {
    const { user_id, action, table_name, record_id, old_data, new_data } = log;
    const res = await this.query<AuditLog>(
      'INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, action, table_name, record_id, JSON.stringify(old_data), JSON.stringify(new_data)],
      user_id
    );
    return res.rows[0];
  }

  async getRecentAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    const res = await this.query<AuditLog>(
      'SELECT al.*, u.full_name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT $1',
      [limit]
    );
    return res.rows;
  }

  // Specialized Stats Query for Dashboard
  async getDashboardStats(role?: string, userId?: string): Promise<any> {
    const isEmployee = (role === 'EMPLOYEE' || role === 'SECRETARY') && userId;
    const isAdmin = role === 'ADMIN' || role === 'MANAGER';
    
    // For KPIs and Trends, we usually want system-wide visibility even for staff
    // For specific lists, we filter by user if they are staff
    const params = isEmployee ? [userId] : [];

    // 1. Get Summary by EKUB Type - Fully Role Aware
    const typeSummaryRes = await this.query(`
      SELECT 
        ekub_type as type,
        COUNT(id) as total_users,
        (SELECT SUM(amount) FROM payments p 
         WHERE p.ekub_type = c.ekub_type 
         AND p.payment_status = 'PAID'
         ${isEmployee ? 'AND p.created_by = $1' : ''}) as total_contributions,
        (SELECT SUM(amount) FROM payments p 
         WHERE p.ekub_type = c.ekub_type 
         AND p.payment_status = 'PAID' 
         AND p.payment_date = CURRENT_DATE
         ${isEmployee ? 'AND p.created_by = $1' : ''}) as today_collection,
        (SELECT MAX(round_number) FROM payments p 
         WHERE p.ekub_type = c.ekub_type
         ${isEmployee ? 'AND p.created_by = $1' : ''}) as current_round
      FROM customers c
      ${isEmployee ? 'WHERE c.created_by = $1' : ''}
      GROUP BY ekub_type
    `, params);

    // 2. Get Recent Payments
    const recentPaymentsRes = await this.query(`
      SELECT 
        p.id,
        p.amount,
        p.round_number as round,
        p.payment_period as period,
        p.payment_date as date,
        TO_CHAR(p.created_at, 'HH24:MI') as time,
        p.customer_name,
        c.customer_code as customer_id,
        p.ekub_type,
        u.full_name as recorded_by_name
      FROM payments p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN customers c ON p.customer_id = c.id
      ${isEmployee ? 'WHERE p.created_by = $1' : ''}
      ORDER BY p.created_at DESC
      LIMIT 50
    `, params);
    
    // 3. Overall Totals
    const totalsRes = await this.query(`
      SELECT 
        SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END) as total_collected,
        SUM(CASE WHEN payment_status = 'PAID' AND payment_date = CURRENT_DATE THEN amount ELSE 0 END) as today_total
      FROM payments
      ${isEmployee ? 'WHERE created_by = $1' : ''}
    `, params);

    const totalCustomersRes = await this.query(`
      SELECT COUNT(*) as total FROM customers
      ${isEmployee ? 'WHERE created_by = $1' : ''}
    `, params);

    // 4. Trends - Role Aware
    const weeklyTrendRes = await this.query(`
      SELECT 
        TO_CHAR(d, 'Dy') as label,
        COALESCE(SUM(p.amount), 0) as amount
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') d
      LEFT JOIN payments p ON DATE(p.payment_date) = d AND p.payment_status = 'PAID'
      ${isEmployee ? 'AND p.created_by = $1' : ''}
      GROUP BY d
      ORDER BY d
    `, params);

    const monthlyTrendRes = await this.query(`
      SELECT 
        TO_CHAR(d, 'DD Mon') as label,
        COALESCE(SUM(p.amount), 0) as amount
      FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') d
      LEFT JOIN payments p ON DATE(p.payment_date) = d AND p.payment_status = 'PAID'
      ${isEmployee ? 'AND p.created_by = $1' : ''}
      GROUP BY d
      ORDER BY d
    `, params);

    const yearlyTrendRes = await this.query(`
      SELECT 
        TO_CHAR(d, 'Mon') as label,
        COALESCE(SUM(p.amount), 0) as amount
      FROM generate_series(DATE_TRUNC('year', CURRENT_DATE), DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '11 months', '1 month') d
      LEFT JOIN payments p ON DATE_TRUNC('month', p.payment_date) = d AND p.payment_status = 'PAID'
      ${isEmployee ? 'AND p.created_by = $1' : ''}
      GROUP BY d
      ORDER BY d
    `, params);

    return {
      ekubs: typeSummaryRes.rows.map(row => ({
        type: row.type,
        name: row.type, 
        totalContributions: Number(row.total_contributions || 0),
        todayCollection: Number(row.today_collection || 0),
        totalUsers: Number(row.total_users || 0),
        currentRound: Number(row.current_round || 0),
      })),
      recentPayments: recentPaymentsRes.rows,
      totals: {
        totalCollected: Number(totalsRes.rows[0]?.total_collected || 0),
        todayTotal: Number(totalsRes.rows[0]?.today_total || 0),
        totalCustomers: Number(totalCustomersRes.rows[0]?.total || 0),
      },
      trends: {
        weekly: weeklyTrendRes.rows.map(r => ({ label: r.label, amount: Number(r.amount) })),
        monthly: monthlyTrendRes.rows.map(r => ({ label: r.label, amount: Number(r.amount) })),
        yearly: yearlyTrendRes.rows.map(r => ({ label: r.label, amount: Number(r.amount) })),
      }
    };
  }
}

// Export singleton instance
export const db = new Database();
