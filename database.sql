-- Create the projects table
CREATE TABLE projects (
    project_id VARCHAR(50) PRIMARY KEY,
    project_name VARCHAR(255),
    status VARCHAR(50),
    start_date DATE,
    end_date_planned DATE,
    predicted_end_date DATE,
    total_budget NUMERIC(15, 2),
    budget_spent NUMERIC(15, 2),
    risk_score INT
);

-- Insert data into the projects table
INSERT INTO projects (project_id, project_name, status, start_date, end_date_planned, predicted_end_date, total_budget, budget_spent, risk_score) VALUES
('P_001', 'Frigate Modernization', 'At Risk', '2023-01-15', '2025-12-31', '2026-03-15', 5500000000, 4200000000, 8),
('P_002', 'Commercial Vessel Design', 'On Track', '2024-03-01', '2025-06-30', '2025-06-30', 800000000, 250000000, 3),
('P_003', 'Dockyard Expansion', 'Delayed', '2023-09-10', '2024-11-30', '2025-02-28', 1200000000, 950000000, 9),
('P_004', 'Marine Engine R&D', 'On Track', '2024-02-20', '2026-02-20', '2026-02-10', 450000000, 120000000, 2),
('P_005', 'Supply Chain Digitization', 'At Risk', '2024-01-01', '2024-12-31', '2025-01-15', 150000000, 110000000, 6);

-- Create the financials table
CREATE TABLE financials (
    quarter VARCHAR(50) PRIMARY KEY,
    total_revenue NUMERIC(15, 2),
    total_expenditure NUMERIC(15, 2),
    budgeted_expenditure NUMERIC(15, 2)
);

-- Insert data into the financials table
INSERT INTO financials (quarter, total_revenue, total_expenditure, budgeted_expenditure) VALUES
('Q1 2024', 6800000000, 6500000000, 6600000000),
('Q2 2024', 7300000000, 7100000000, 7000000000),
('Q3 2024', 7900000000, 7600000000, 7800000000),
('Q4 2024', 8500000000, 7950000000, 7500000000);

-- Create the suppliers table
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255),
    product VARCHAR(255),
    delivery_rate INT,
    quality_score INT,
    avg_lead_time INT,
    risk_level VARCHAR(50)
);

-- Insert data into the suppliers table
INSERT INTO suppliers (supplier_name, product, delivery_rate, quality_score, avg_lead_time, risk_level) VALUES
('Marine Parts Inc.', 'Hull Plates', 98, 95, 25, 'Low'),
('Electronics Global', 'Sensor Systems', 85, 90, 40, 'Medium'),
('SteelFab Corp.', 'Structural Steel', 92, 97, 35, 'Low'),
('ShipPower Systems', 'Propulsion Units', 75, 88, 60, 'High'),
('Defense Systems Ltd.', 'Navigation Modules', 95, 92, 30, 'Medium');



-- Drop the existing users table to add the new column
DROP TABLE IF EXISTS users;

-- Create the users table with a password_hash and dashboard_permissions column
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50),
    dashboard_permissions TEXT
);

-- Insert data into the users table with hashed passwords and permissions
-- The passwords are 'admin' and 'user' respectively
INSERT INTO users (name, username, password_hash, role, dashboard_permissions) VALUES
('Girish', 'Girish', 'scrypt:32768:8:1$KMU9k1LtnKswzQhr$a1cb4f18049137d8157fd1107b7307219fa66ced57445c88361aced02432135bd69738e3516f051905f66a0d75dabfa5ebe451e9a5d780f765e669606d2b0f01', 'Admin', 'home,projects,financials,supply-chain,what-if,admin'),
('Regular User', 'user', 'pbkdf2:sha256:260000$P4xQ7w1a$1f34d3b6a987d6e4f3a2c2b8a01235b91c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f', 'User', 'home,projects,financials,supply-chain'),
('Viewer User', 'viewer', 'pbkdf2:sha256:260000$T5xQ7w2a$2f34d3b6a987d6e4f3a2c2b8a01235b91c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f', 'Viewer', 'home,projects');

update users set password_hash=
'scrypt:32768:8:1$7KFlxdQxFXW4LdJG$2c0832b9e20b6b236cf1a5eb9eb7763c4f6086a604804ec95da34294cbd65fe3ce7a0da37e89caf164984aba46ba11cd9bddc3433510b5be277dc07cf09e29d1'
where username='user'
