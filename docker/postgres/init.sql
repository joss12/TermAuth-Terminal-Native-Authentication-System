-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'pending', -- Roles: pending, user, admin
  is_verified BOOLEAN DEFAULT FALSE,
  reset_token TEXT,
  reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enforce case-insensitive unique emails (optional but recommended)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'unique_email_lower'
  ) THEN
    CREATE UNIQUE INDEX unique_email_lower ON users (LOWER(email));
  END IF;
END
$$;

-- Create the OTPs table
CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
