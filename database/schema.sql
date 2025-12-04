-- Drop tables if they exist
DROP TABLE IF EXISTS column_permissions;
DROP TABLE IF EXISTS sales_campaign;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales campaign table
CREATE TABLE sales_campaign (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10, 2),
  start_date DATE,
  end_date DATE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Column permissions
CREATE TABLE column_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  column_name VARCHAR(100) NOT NULL,
  can_read BOOLEAN DEFAULT false,
  UNIQUE(role, table_name, column_name)
);

-- Insert test users (password is 'password123')
-- Hash: $2b$10$rZ5qH8QH9vYxH9YxH9YxHOqH9YxH9YxH9YxH9YxH9YxH9YxH9YxH9Y
INSERT INTO users (email, password_hash, role) VALUES
('admin@test.com', '$2b$10$rZ5qH8QH9vYxH9YxH9YxHOqH9YxH9YxH9YxH9YxH9YxH9YxH9YxH9Y', 'ADMIN'),
('user@test.com', '$2b$10$rZ5qH8QH9vYxH9YxH9YxHOqH9YxH9YxH9YxH9YxH9YxH9YxH9YxH9Y', 'USER');

-- Column permissions for ADMIN
INSERT INTO column_permissions (role, table_name, column_name, can_read) VALUES
('ADMIN', 'sales_campaign', 'id', true),
('ADMIN', 'sales_campaign', 'name', true),
('ADMIN', 'sales_campaign', 'budget', true),
('ADMIN', 'sales_campaign', 'start_date', true),
('ADMIN', 'sales_campaign', 'end_date', true),
('ADMIN', 'sales_campaign', 'created_by', true),
('ADMIN', 'sales_campaign', 'created_at', true),
('ADMIN', 'sales_campaign', 'updated_at', true);

-- Column permissions for USER (no budget)
INSERT INTO column_permissions (role, table_name, column_name, can_read) VALUES
('USER', 'sales_campaign', 'id', true),
('USER', 'sales_campaign', 'name', true),
('USER', 'sales_campaign', 'budget', false),
('USER', 'sales_campaign', 'start_date', true),
('USER', 'sales_campaign', 'end_date', true),
('USER', 'sales_campaign', 'created_by', true),
('USER', 'sales_campaign', 'created_at', true),
('USER', 'sales_campaign', 'updated_at', true);
