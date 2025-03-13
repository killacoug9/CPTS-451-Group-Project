-- IF NOT EXISTS: PostgreSQL will skip creating it if the table already exist
-- We use SERIAL instead of INTEGER because SERIAL auto-increments the value for each new row
    -- If we use INTEGER, we must manually insert values

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

-- Users table
    -- changed pwd from VARCHAR to TEXT so we can hash the password
        -- hashes can be very long
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pwd TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    user_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    equip_name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50),
    specifications TEXT,
    equip_status VARCHAR(50) CHECK (equip_status IN ('available', 'in_use', 'maintenance')),
    total_quantity INTEGER CHECK (total_quantity >= 0)
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    res_request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    res_start_date TIMESTAMP NOT NULL,
    res_end_date TIMESTAMP NOT NULL,
    reservation_status VARCHAR(50) CHECK (reservation_status IN ('pending', 'approved', 'denied')),
    reserved_quantity INTEGER CHECK (reserved_quantity > 0),
    CONSTRAINT unique_reservation UNIQUE(user_id, equipment_id, res_start_date)
);

-- Reservations Admins Table
CREATE TABLE IF NOT EXISTS reservations_admins (
    reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (reservation_id, admin_id),
    approval_date TIMESTAMP,
    decision VARCHAR(50) CHECK (decision IN ('approved', 'denied'))
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

-- Usage Logs Table
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_usage_log UNIQUE(user_id, equipment_id, usage_date)
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(50) NOT NULL
);

-- Supplied Table
CREATE TABLE IF NOT EXISTS supplied (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    quantity INTEGER CHECK (quantity > 0),
    date_supplied TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_supplier_equipment UNIQUE(supplier_id, equipment_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notification_message TEXT NOT NULL,
    notification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_notification UNIQUE(user_id, notification_message)
);