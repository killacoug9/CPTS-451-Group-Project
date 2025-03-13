-- Inserting the three main roles in this system
    -- If an entry with id = 1, 2, or 3 already exist, do nothing
        -- This ensures we don't insert duplicates
INSERT INTO roles (id, role_name) VALUES
(1, 'Admin'),
(2, 'Researcher'),
(3, 'Student')
ON CONFLICT (id) DO NOTHING;

-- Inserting sample users
    -- https://www.postgresql.fastware.com/blog/further-protect-your-data-with-pgcrypto
        -- article for password encryption: crypt() hashes passwords, gen_salt() generates a random salt, 'bf' is the hashing alg.
INSERT INTO users (email, pwd, role_id, user_name) VALUES
('admin@wsu.edu', crypt('admin123', gen_salt('bf')), 1, 'Administrator User'),
('researcher@wsu.edu', crypt('researcher123', gen_salt('bf')), 2, 'Researcher User'),
('student@wsu.edu', crypt('student123', gen_salt('bf')), 3, 'Student User')
ON CONFLICT (email) DO NOTHING;

-- Inserting sample equipment
INSERT INTO equipment (equip_name, category, specifications, equip_status, total_quantity) VALUES
('Microscope', 'General Laboratory Equipment', '40X to 2000X magnification range using four achromatically-corrected objective lenses and two pairs of eyepieces.', 'available', 5),
('Spectrophotometer', 'Analytical Instruments', 'Photometric range of 0-200%T and -0.3A~3A', 'maintenance', 2),
('Flow Cytometer', 'Cell Culture & Biotechnology Equipment', 'The BD FACSCanto Special Order Flow Cytometer features three lasers enabling detection of up to 10 colors.', 'in_use', 1)
ON CONFLICT (equip_name) DO NOTHING;

-- Inserting sample reservations
INSERT INTO reservations (user_id, equipment_id, res_request_date, res_start_date, res_end_date, reservation_status, reserved_quantity) VALUES
(1, 1, CURRENT_TIMESTAMP, '2025-04-01', '2025-04-08', 'approved', 1),
(2, 2, CURRENT_TIMESTAMP, '2025-04-03', '2025-04-10', 'pending', 1),
(3, 3, CURRENT_TIMESTAMP, '2025-04-05', '2025-04-12', 'denied', 1)
ON CONFLICT (user_id, equipment_id, res_start_date) DO NOTHING;

-- Inserting sample reservations approvals by admins
INSERT INTO reservations_admins (reservation_id, admin_id, approval_date, decision) VALUES
(1, 1, CURRENT_TIMESTAMP, 'approved'),
(2, 1, CURRENT_TIMESTAMP, 'approved'),
(3, 1, CURRENT_TIMESTAMP, 'denied')
ON CONFLICT (reservation_id, admin_id) DO NOTHING;

-- Inserting sample admins
INSERT INTO admins (user_id)
SELECT id FROM users WHERE role_id = 1
ON CONFLICT (user_id) DO NOTHING;

-- Inserting sample usage logs
INSERT INTO usage_logs (user_id, equipment_id, usage_date) VALUES
(1, 1, CURRENT_TIMESTAMP), 
(2, 2, CURRENT_TIMESTAMP), 
(3, 3, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, equipment_id, usage_date) DO NOTHING;

-- Inserting sample suppliers
INSERT INTO suppliers (id, supplier_name) VALUES
(1, 'WSU Life Sciences'),
(2, 'WSU Webster Hall'),
(3, 'WSU Abelson Hall')
ON CONFLICT (id) DO NOTHING;

-- Inserting sample supplied equipment
INSERT INTO supplied (supplier_id, equipment_id, quantity, date_supplied) VALUES
(1, 1, 5, '2025-01-01'),
(2, 2, 2, '2025-01-12'),
(3, 3, 1, '2025-01-23')
ON CONFLICT (supplier_id, equipment_id) DO NOTHING;

-- Inserting sample notifications
INSERT INTO notifications (user_id, notification_message, notification_timestamp) VALUES
(1, 'Your reservation for the Microscope has been approved!', CURRENT_TIMESTAMP),
(2, 'Your reservation for the Spectrophotometer is pending.', CURRENT_TIMESTAMP),
(3, 'Your reservation for the Flow Cytometer has been denied...', CURRENT_TIMESTAMP)
ON CONFLICT (user_id, notification_message) DO NOTHING;