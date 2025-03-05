-- IF NOT EXISTS: PostgreSQL will skip creating it if the table already exist
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL
);