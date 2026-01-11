PRAGMA foreign_keys = ON;

----------------------------------------------------------
-- 1. SERVICES TABLE
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT
);

----------------------------------------------------------
-- 2. CATEGORIES TABLE
-- Each category belongs to a main service
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE CASCADE
);

----------------------------------------------------------
-- 3. DRUGS TABLE (PHARMACY)
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT,
    description TEXT,
    dosage_form TEXT,
    strength TEXT,
    price REAL,
    stock INTEGER DEFAULT 0,
    manufacturer TEXT,
    expiry_date TEXT,
    prescription_required INTEGER DEFAULT 0,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);

----------------------------------------------------------
-- 4. CONSULTATION SERVICES TABLE
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    price REAL,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);

----------------------------------------------------------
-- 5. CLINIC SERVICES TABLE
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinic_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    requirements TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);

----------------------------------------------------------
-- 6. STAFF TABLE
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,     -- Doctor, Pharmacist, Nurse
    specialization TEXT,
    phone TEXT,
    email TEXT,
    bio TEXT,
    photo TEXT
);

----------------------------------------------------------
-- 7. APPOINTMENTS TABLE
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_type TEXT NOT NULL,        -- consultation or clinic
    service_id INTEGER NOT NULL,       -- links to consultations.id or clinic_services.id
    patient_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    preferred_date TEXT NOT NULL,      -- YYYY-MM-DD
    preferred_time TEXT NOT NULL,      -- HH:MM
    notes TEXT,
    CHECK(service_type IN ('consultation', 'clinic'))
);

----------------------------------------------------------
-- 8. CONTACTS TABLE (NEW)
-- General Contact Form Submissions
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_choice TEXT,       -- pharmacy, consultation, clinic, or general
    message TEXT NOT NULL
);

----------------------------------------------------------
-- 9. INSERT DEFAULT DATA
----------------------------------------------------------

-- Top-Level Services
INSERT INTO services (name, description) VALUES
('Pharmacy', 'Buy safe medicines and over-the-counter drugs'),
('Consultation', 'Get medical advice from qualified medical experts'),
('Clinic', 'Receive outpatient and preventive health services');

-- Categories for Pharmacy
INSERT INTO categories (service_id, name, description) VALUES
(1, 'Pain Relief', 'Drugs for headaches, muscle pain, and fever'),
(1, 'Cold & Flu', 'Medicines for flu, congestion, cough'),
(1, 'Digestive Health', 'Stomach pain, diarrhea, indigestion'),
(1, 'Skin Care & Allergies', 'Creams and antihistamines'),
(1, 'First Aid', 'Basic emergency supplies'),
(1, 'Reproductive Health', 'Pregnancy tests and contraceptives');

-- Categories for Consultation
INSERT INTO categories (service_id, name, description) VALUES
(2, 'General Health', 'Common day-to-day health issues'),
(2, 'Mental Health', 'Stress, anxiety, sleep issues'),
(2, 'Reproductive Health', 'Menstrual issues, pregnancy, family planning');

-- Categories for Clinic
INSERT INTO categories (service_id, name, description) VALUES
(3, 'Vaccination', 'Immunization services'),
(3, 'Lab Tests', 'Basic diagnostic services'),
(3, 'Wound & Minor Injuries', 'First aid and wound care management');