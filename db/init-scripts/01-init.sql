-- Tulboxx CRM - Initial Database Setup Script (01-init.sql)
-- This script is executed when the PostgreSQL container starts for the first time.
-- It sets up a dedicated application user, schema, enables extensions,
-- and configures default privileges for a secure and organized database environment.

-- Best practice: Do not run Drizzle migrations as a superuser in production.
-- Create a dedicated application user with least privileges.
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tulboxx_app_user') THEN
      CREATE ROLE tulboxx_app_user WITH LOGIN PASSWORD 'app_user_strong_password'; -- Replace with a strong password, ideally from env
   END IF;
END
$$;

-- Create a dedicated schema for the application tables
CREATE SCHEMA IF NOT EXISTS app_schema AUTHORIZATION postgres; -- Assuming 'postgres' is the superuser running migrations

-- Grant usage on the schema to the application user
GRANT USAGE ON SCHEMA app_schema TO tulboxx_app_user;

-- Set the default search path for the application user.
-- This ensures that 'app_schema' is searched first, then 'public'.
-- Note: This applies to new sessions for this user.
ALTER ROLE tulboxx_app_user SET search_path = app_schema, public;

-- Set the database timezone to UTC for consistency
-- This affects how timestamp with time zone are stored and retrieved
ALTER DATABASE tulboxx_dev SET timezone TO 'UTC';
-- For the current session (important for subsequent commands if any relied on it)
SET TIMEZONE TO 'UTC';

-- Enable necessary extensions.
-- It's common to install extensions into the 'public' schema or their own schemas.
-- If Drizzle expects them in 'public', this is fine.
-- Otherwise, use `CREATE EXTENSION IF NOT EXISTS extension_name WITH SCHEMA app_schema;`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- For UUID generation (e.g., uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "citext";      -- For case-insensitive text type (useful for emails, tags)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- For trigram similarity (speeds up ILIKE, fuzzy search)

-- Default privileges for tables and sequences created by the 'postgres' user (migration runner)
-- in 'app_schema'. This ensures 'tulboxx_app_user' can operate on them.
-- Adjust 'postgres' if your migration runner user is different.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app_schema
   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tulboxx_app_user;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app_schema
   GRANT USAGE, SELECT ON SEQUENCES TO tulboxx_app_user;

-- (Optional but recommended) Grant execute on functions if you have any in app_schema
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app_schema
--    GRANT EXECUTE ON FUNCTIONS TO tulboxx_app_user;

-- Secure the 'public' schema by revoking default create permissions from the PUBLIC role.
-- This prevents users from creating objects in 'public' unless explicitly granted.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Grant connect to the database for the app user
GRANT CONNECT ON DATABASE tulboxx_dev TO tulboxx_app_user;

-- Informational messages (will appear in Docker logs)
\echo '----------------------------------------------------'
\echo 'Tulboxx CRM Database Initialization Complete.'
\echo 'User ''tulboxx_app_user'' created.'
\echo 'Schema ''app_schema'' created and configured.'
\echo 'Required extensions enabled.'
\echo 'Default privileges set for ''tulboxx_app_user'' on objects created by ''postgres'' in ''app_schema''.'
\echo 'Database timezone set to UTC.'
\echo 'Remember to update your application''s DATABASE_URL to use ''tulboxx_app_user'' for connections.'
\echo 'Example for .env: DATABASE_URL="postgresql://tulboxx_app_user:app_user_strong_password@localhost:5432/tulboxx_dev?schema=app_schema"'
\echo '----------------------------------------------------'

-- Note on Indexing:
-- Specific table indexes should be defined within your Drizzle ORM schema (shared/schema.ts).
-- This init script focuses on foundational setup.
-- Examples of general indexing strategies (applied via Drizzle schema):
-- 1. Index foreign key columns.
-- 2. Index columns frequently used in WHERE clauses (e.g., status, email, phone).
-- 3. For text search, consider GIN or GIST indexes with pg_trgm (e.g., on customer names, descriptions).
--    CREATE INDEX idx_contacts_name_trgm ON app_schema.contacts USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);
-- 4. Use BRIN indexes for very large tables ordered by a correlation (e.g., createdAt).
-- 5. Create partial indexes for common filtered queries (e.g., active leads).
--    CREATE INDEX idx_contacts_active_leads ON app_schema.contacts (id) WHERE status = 'lead' AND is_active = true; (assuming is_active field)
