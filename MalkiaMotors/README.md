# **MalkiaMotors**

**“Where Every Ride Feels Royal.”**

MalkiaMotors is a luxury African car marketplace built with **Django, HTML, CSS, JavaScript, and SQLAlchemy**.  
The brand name **“Malkia”** means *Queen* in Swahili, representing royalty, quality, and elegance — the exact feeling the platform gives to car buyers.

The goal of this project is to present cars in a premium, futuristic, showroom-like interface, with **dark mode, neon accents, glass effects, and reflections**.

---

## 🚗 Project Overview

MalkiaMotors provides:

- Detailed car listings  
- Full specifications for each vehicle  
- Up to **4 car images per vehicle**  
- Admin dashboard for adding and managing cars  
- Modern UI with glassmorphism + neon glow  
- Reflections added to images, logo, and section dividers  
- A premium dark showroom theme  

---

# 🖼️ Brand Identity

### **Name**
**MalkiaMotors** — inspired by royalty (Malkia = Queen in Swahili).

### **Brand Feel**
- Luxurious  
- Futuristic  
- Royal  
- African Identity  
- Premium and trustworthy  

---

# 🎨 Theme & Colors (Dark + Neon + Glass)

This project uses a **dark luxury showroom theme** with neon highlights and glass-like surfaces.

### **Primary Colors**
```css
/* Main Background */
--midnight-black: #0C0C0C;

/* Section Background */
--deep-charcoal: #1A1A1A;

---

Neon Accents

/* Neon Blue for highlights */
--royal-neon-blue: #00A2FF;

/* Neon Purple for glow effects */
--neon-purple: #7B2CFF;

Optional Gold (Royal Accent)

--crown-gold: #D4AF37;

Neutral Colors

--soft-silver: #C5C5C5;
--pure-white: #FFFFFF;


---

🌫️ Glassmorphism Style

Used on navbars, cards, search bars, and UI sections.

background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.15);
border-radius: 16px;

This creates the frosted glass effect.


---

🌟 Reflections

Reflections are added to:

Car images
The MalkiaMotors logo
Section dividers
Some buttons and hero elements


Reflection effect uses:

transform: scaleY(-1);
opacity: 0.3;
mask-image: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);

---

🔧 Features

User Features:

Browse all cars
Search and filter (make, model, year, fuel type, etc.)
View full car details
See up to 4 images per car
High-quality glass UI and reflections


Admin Features:

Add new car listings
Add up to 4 car images per car
Add/edit/delete car details
Manage all posts from the dashboard

---

🚘 Car Specifications Collected

MalkiaMotors stores full car details, including:

A. Basic Info

Make
Model
Year
Body type
Fuel type
Transmission
Mileage
Condition


B. Engine & Performance

Engine size (cc)
Engine type
Horsepower
Drive type (FWD, AWD, etc.)
Fuel efficiency


C. Exterior Features

Color
Wheel type
Tyre size
Headlight type
Sunroof / Moonroof


D. Interior

Seat materials
Infotainment
Interior color
Number of seats
Comfort features


E. Safety

Airbags
ABS
Parking sensors
Rear camera
Blind spot monitoring


F. Ownership Info

Registration details
Service history
Previous owners
Accident history


G. Price

Price
Negotiable / fixed
Location
Seller type



---

🛠️ Technologies Used

Django
HTML / CSS / JavaScript
SQLAlchemy
SQLite 
Glassmorphism UI
Dark + Neon UI theme



---

🏁 Status

Early design stage:

Branding and theme ✔ Complete
Feature list ✔ Complete
Database planning ⬜ Not started
UI design ⬜ In progress



---