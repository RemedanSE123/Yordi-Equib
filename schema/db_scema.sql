-- =========================================
-- ENABLE EXTENSION
-- =========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =========================================
-- USERS TABLE
-- =========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255) NOT NULL,

  role TEXT CHECK (role IN ('ADMIN','MANAGER','SECRETARY','EMPLOYEE','CUSTOMER'))
    DEFAULT 'CUSTOMER',

  is_active BOOLEAN DEFAULT TRUE,

  created_by UUID,
  updated_by UUID,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_role ON users(role);


-- =========================================
-- CUSTOMERS TABLE
-- =========================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,

  ekub_type TEXT CHECK (
    ekub_type IN ('DAILY','WEEKLY','MONTHLY','DAY_105','SHARE')
  ) NOT NULL,

  created_by UUID,
  updated_by UUID,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_type ON customers(ekub_type);


-- =========================================
-- PAYMENTS TABLE (SNAPSHOT BASED)
-- =========================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id UUID NOT NULL,

  -- SNAPSHOT DATA (VERY IMPORTANT)
  customer_name VARCHAR(150),
  phone VARCHAR(30),
  ekub_type TEXT,

  amount DECIMAL(10,2) NOT NULL,

  round_number TEXT NOT NULL,
  payment_period TEXT NOT NULL,

  payment_status TEXT CHECK (payment_status IN ('PAID','UNPAID'))
    DEFAULT 'PAID',

  payment_date DATE DEFAULT CURRENT_DATE,

  -- Ethiopian fiscal year (e.g. 2018)
  ethiopian_year INTEGER,

--   ALTER TABLE payments ADD COLUMN IF NOT EXISTS ethiopian_year INTEGER;
-- CREATE INDEX IF NOT EXISTS idx_payments_year ON payments(ethiopian_year);

  

  created_by UUID,
  updated_by UUID,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_round ON payments(round_number);
CREATE INDEX idx_payments_period ON payments(payment_period);
CREATE INDEX idx_payments_year ON payments(ethiopian_year);


-- =========================================
-- AUDIT LOGS (FULL TRACKING)
-- =========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID,

  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
  table_name VARCHAR(100),
  record_id UUID,

  old_data JSONB,
  new_data JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);


-- =========================================
-- AUTO UPDATE updated_at
-- =========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customers_updated
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =========================================
-- GENERIC AUDIT FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- try to get user from app (set in session)
  BEGIN
    v_user_id := current_setting('app.user_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs(user_id, action, table_name, record_id, new_data)
    VALUES (v_user_id, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs(user_id, action, table_name, record_id, old_data, new_data)
    VALUES (v_user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs(user_id, action, table_name, record_id, old_data)
    VALUES (v_user_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- =========================================
-- APPLY AUDIT TRIGGERS
-- =========================================
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_customers
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION audit_trigger();