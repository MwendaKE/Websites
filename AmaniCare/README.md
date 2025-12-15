# AmaniCare Center

**Caption:** Your Health, Our Priority

AmaniCare Center is a professional healthcare website designed to provide easy access to **Pharmacy**, **Consultation**, and **Clinic** services. The platform is simple, clean, and professional, allowing patients to quickly find the services they need, view available medicines, book consultations, and contact the healthcare center.

---

## Table of Contents

- [Features](#features)
- [Services](#services)
- [Technologies](#technologies)
- [Database Structure](#database-structure)
- [Contact](#contact)

---

## Features

- Simple and professional user interface with **navigation links**:
  - Home
  - Pharmacy
  - Consultation
  - Clinic
  - Contact
- **Three core services**:
  - Pharmacy: Browse and purchase medicines organized by categories
  - Consultation: Book appointments with qualified medical practitioners
  - Clinic: Access outpatient services and preventive health care
- **Appointment booking** and **contact forms** for easy patient communication
- Fully responsive and mobile-friendly
- **Color Theme**:
  - **Deep Blue:** `#003366`  
  - **Pine Green:** `#01796F`  
  - **Graphite Black:** `#2A2A2A`  
  - **Background:** White `#FFFFFF`
- Secure data storage using **SQLite** database
- Simple, beginner-friendly backend using **Node.js and Express**

---

## Services

### 1. Pharmacy
- Browse medicines divided into categories such as:
  - Pain Relief
  - Cold & Flu
  - Digestive Health
  - Skin Care & Allergies
  - First Aid
  - Reproductive Health
- View medicine details including:
  - Generic name
  - Description
  - Dosage form
  - Strength
  - Price
  - Stock
  - Manufacturer
  - Prescription requirement
  - Expiry date

### 2. Consultation
- Book consultations with qualified medical practitioners
- Categories include:
  - General Health
  - Mental Health
  - Reproductive Health
- View details such as:
  - Service description
  - Duration
  - Price

### 3. Clinic
- Access clinic services such as:
  - Vaccination
  - Lab Tests
  - Wound & Minor Injuries
- View details such as:
  - Service description
  - Price
  - Requirements

---

## Technologies

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js with Express
- **Database:** SQLite
- **Other Tools:**
  - npm for package management
  - sqlite3 for database connection

---

## Database Structure

The database consists of the following tables:

1. **services** – Top-level services: Pharmacy, Consultation, Clinic  
2. **categories** – Categories for each service  
3. **drugs** – Medicine information for Pharmacy  
4. **consultations** – Available consultation services  
5. **clinic_services** – Clinic procedures and services  
6. **staff** – Doctors, pharmacists, nurses  
7. **appointments** – Patient appointment bookings  
8. **contacts** – Patient contact form submissions

---

## Contact

- Patients can submit inquiries via the **Contact page**.
- Each contact includes:
  - Name
  - Email
  - Phone
  - Service choice
  - Message

---

**AmaniCare Center** – Bringing professional healthcare services to your fingertips.