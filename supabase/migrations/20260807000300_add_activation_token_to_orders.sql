-- Migration: Add activation_token column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS activation_token VARCHAR(100);

-- Reload PostgREST schema cache to make the new column immediately accessible
NOTIFY pgrst, 'reload schema';
