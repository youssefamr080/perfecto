-- Fix RLS policies for admin operations
-- This script will allow admins to update order statuses

-- Temporarily disable RLS for orders table
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_update_all" ON orders;
DROP POLICY IF EXISTS "orders_insert_all" ON orders;

-- Create comprehensive policies for orders
CREATE POLICY "orders_select_all" ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "orders_update_all" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "orders_insert_all" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Also fix order_items table
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_all" ON order_items;
DROP POLICY IF EXISTS "order_items_update_all" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_all" ON order_items;

CREATE POLICY "order_items_select_all" ON order_items
  FOR SELECT
  USING (true);

CREATE POLICY "order_items_update_all" ON order_items
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "order_items_insert_all" ON order_items
  FOR INSERT
  WITH CHECK (true);

-- Fix users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_update_all" ON users;
DROP POLICY IF EXISTS "users_delete_all" ON users;

CREATE POLICY "users_select_all" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "users_update_all" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_delete_all" ON users
  FOR DELETE
  USING (true);

-- Fix products table
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_update_all" ON products;
DROP POLICY IF EXISTS "products_insert_all" ON products;
DROP POLICY IF EXISTS "products_delete_all" ON products;

CREATE POLICY "products_select_all" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "products_update_all" ON products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_insert_all" ON products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "products_delete_all" ON products
  FOR DELETE
  USING (true);
