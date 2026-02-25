CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS products (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(50) UNIQUE NOT NULL,

    description TEXT NOT NULL,

    balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);