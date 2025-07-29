-- Remove favorites table and related components since it's not needed
DROP TABLE IF EXISTS user_favorites CASCADE;

-- Remove favorites-related policies (they were already created but we'll clean up)
-- The policies will be automatically dropped with the table
