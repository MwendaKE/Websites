const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory database (replaces external db.json)
let db = {
    services: [
        {
            "id": 1,
            "name": "Pharmacy",
            "description": "Buy safe medicines and over-the-counter drugs"
        },
        {
            "id": 2,
            "name": "Consultation",
            "description": "Get medical advice from qualified medical experts"
        },
        {
            "id": 3,
            "name": "Clinic",
            "description": "Receive outpatient and preventive health services"
        }
    ],
    categories: [
        {
            "id": 1,
            "service_id": 1,
            "name": "Pain Relief",
            "description": "Drugs for headaches, muscle pain, and fever"
        },
        {
            "id": 2,
            "service_id": 1,
            "name": "Cold & Flu",
            "description": "Medicines for flu, congestion, cough"
        },
        {
            "id": 3,
            "service_id": 1,
            "name": "Digestive Health",
            "description": "Stomach pain, diarrhea, indigestion"
        },
        {
            "id": 4,
            "service_id": 1,
            "name": "Skin Care & Allergies",
            "description": "Creams and antihistamines"
        },
        {
            "id": 5,
            "service_id": 1,
            "name": "First Aid",
            "description": "Basic emergency supplies"
        },
        {
            "id": 6,
            "service_id": 1,
            "name": "Reproductive Health",
            "description": "Pregnancy tests and contraceptives"
        },
        {
            "id": 7,
            "service_id": 2,
            "name": "General Health",
            "description": "Common day-to-day health issues"
        },
        {
            "id": 8,
            "service_id": 2,
            "name": "Mental Health",
            "description": "Stress, anxiety, sleep issues"
        },
        {
            "id": 9,
            "service_id": 2,
            "name": "Reproductive Health",
            "description": "Menstrual issues, pregnancy, family planning"
        },
        {
            "id": 10,
            "service_id": 3,
            "name": "Vaccination",
            "description": "Immunization services"
        },
        {
            "id": 11,
            "service_id": 3,
            "name": "Lab Tests",
            "description": "Basic diagnostic services"
        },
        {
            "id": 12,
            "service_id": 3,
            "name": "Wound & Minor Injuries",
            "description": "First aid and wound care management"
        }
    ],
    drugs: [
        {
            "id": 1,
            "category_id": 1,
            "name": "Paracetamol",
            "generic_name": "Acetaminophen",
            "description": "Effective pain reliever and fever reducer",
            "dosage_form": "Tablets",
            "strength": "500mg",
            "price": 5.99,
            "stock": 50,
            "manufacturer": "Health Pharma",
            "prescription_required": 0,
            "expiry_date": "2025-12-31"
        },
        {
            "id": 2,
            "category_id": 1,
            "name": "Ibuprofen",
            "generic_name": "Ibuprofen",
            "description": "Anti-inflammatory pain reliever",
            "dosage_form": "Tablets",
            "strength": "400mg",
            "price": 8.99,
            "stock": 30,
            "manufacturer": "MediCare",
            "prescription_required": 0,
            "expiry_date": "2025-10-15"
        },
        {
            "id": 3,
            "category_id": 2,
            "name": "Cold & Flu Relief",
            "generic_name": "Paracetamol + Phenylephrine",
            "description": "Multi-symptom cold and flu relief",
            "dosage_form": "Capsules",
            "strength": "500mg + 10mg",
            "price": 12.99,
            "stock": 25,
            "manufacturer": "ColdCare",
            "prescription_required": 0,
            "expiry_date": "2025-11-20"
        },
        {
            "id": 4,
            "category_id": 3,
            "name": "Antacid Tablets",
            "generic_name": "Calcium Carbonate",
            "description": "Fast relief from heartburn and indigestion",
            "dosage_form": "Chewable Tablets",
            "strength": "750mg",
            "price": 6.99,
            "stock": 40,
            "manufacturer": "DigestWell",
            "prescription_required": 0,
            "expiry_date": "2025-09-30"
        },
        {
            "id": 5,
            "category_id": 4,
            "name": "Antihistamine Cream",
            "generic_name": "Diphenhydramine",
            "description": "Relieves itching from rashes and insect bites",
            "dosage_form": "Cream",
            "strength": "2%",
            "price": 9.99,
            "stock": 20,
            "manufacturer": "SkinCare Plus",
            "prescription_required": 0,
            "expiry_date": "2025-08-15"
        },
        {
            "id": 6,
            "category_id": 1,
            "name": "Aspirin",
            "generic_name": "Acetylsalicylic Acid",
            "description": "Pain reliever, anti-inflammatory, antiplatelet",
            "dosage_form": "Tablets",
            "strength": "300mg",
            "price": 7.50,
            "stock": 45,
            "manufacturer": "Bayer",
            "prescription_required": 0,
            "expiry_date": "2025-11-30"
        },
        {
            "id": 7,
            "category_id": 1,
            "name": "Diclofenac",
            "generic_name": "Diclofenac Sodium",
            "description": "Non-steroidal anti-inflammatory drug for pain and inflammation",
            "dosage_form": "Tablets",
            "strength": "50mg",
            "price": 15.00,
            "stock": 35,
            "manufacturer": "Novartis",
            "prescription_required": 1,
            "expiry_date": "2025-10-25"
        },
        {
            "id": 8,
            "category_id": 1,
            "name": "Naproxen",
            "generic_name": "Naproxen Sodium",
            "description": "For arthritis, menstrual cramps, gout",
            "dosage_form": "Tablets",
            "strength": "250mg",
            "price": 18.00,
            "stock": 25,
            "manufacturer": "Pfizer",
            "prescription_required": 1,
            "expiry_date": "2025-12-15"
        },
        {
            "id": 9,
            "category_id": 2,
            "name": "Cetirizine",
            "generic_name": "Cetirizine Hydrochloride",
            "description": "Antihistamine for allergy relief",
            "dosage_form": "Tablets",
            "strength": "10mg",
            "price": 12.00,
            "stock": 40,
            "manufacturer": "UCB",
            "prescription_required": 0,
            "expiry_date": "2026-01-20"
        },
        {
            "id": 10,
            "category_id": 2,
            "name": "Loratadine",
            "generic_name": "Loratadine",
            "description": "Non-drowsy antihistamine for allergies",
            "dosage_form": "Tablets",
            "strength": "10mg",
            "price": 14.00,
            "stock": 30,
            "manufacturer": "Schering-Plough",
            "prescription_required": 0,
            "expiry_date": "2026-02-15"
        },
        {
            "id": 11,
            "category_id": 2,
            "name": "Pseudoephedrine",
            "generic_name": "Pseudoephedrine HCl",
            "description": "Decongestant for nasal congestion",
            "dosage_form": "Tablets",
            "strength": "60mg",
            "price": 16.00,
            "stock": 20,
            "manufacturer": "Johnson & Johnson",
            "prescription_required": 1,
            "expiry_date": "2025-09-30"
        },
        {
            "id": 12,
            "category_id": 2,
            "name": "Amoxicillin",
            "generic_name": "Amoxicillin Trihydrate",
            "description": "Broad-spectrum antibiotic for bacterial infections",
            "dosage_form": "Capsules",
            "strength": "500mg",
            "price": 25.00,
            "stock": 50,
            "manufacturer": "GlaxoSmithKline",
            "prescription_required": 1,
            "expiry_date": "2025-12-31"
        }
    ],
    consultations: [
        {
            "id": 1,
            "category_id": 7,
            "name": "General Health Checkup",
            "description": "Comprehensive health assessment and preventive care consultation",
            "duration": "30 minutes",
            "price": 45.00
        },
        {
            "id": 2,
            "category_id": 7,
            "name": "Chronic Disease Management",
            "description": "Ongoing care for diabetes, hypertension, and other chronic conditions",
            "duration": "45 minutes",
            "price": 60.00
        },
        {
            "id": 3,
            "category_id": 8,
            "name": "Mental Health Assessment",
            "description": "Professional evaluation and counseling for mental wellness",
            "duration": "60 minutes",
            "price": 75.00
        },
        {
            "id": 4,
            "category_id": 9,
            "name": "Family Planning Consultation",
            "description": "Expert advice on contraception and reproductive health",
            "duration": "30 minutes",
            "price": 50.00
        }
    ],
    clinic_services: [
        {
            "id": 1,
            "category_id": 10,
            "name": "COVID-19 Vaccination",
            "description": "Latest COVID-19 vaccine administration with professional medical supervision",
            "price": 0.00,
            "requirements": "Government ID, Previous vaccination card if applicable"
        },
        {
            "id": 2,
            "category_id": 10,
            "name": "Childhood Immunization",
            "description": "Complete childhood vaccination schedule as per national guidelines",
            "price": 15.00,
            "requirements": "Child's immunization card, Parent/Guardian ID"
        },
        {
            "id": 3,
            "category_id": 11,
            "name": "Basic Blood Tests",
            "description": "Complete blood count, blood sugar, cholesterol, and liver function tests",
            "price": 35.00,
            "requirements": "Fasting for 8-12 hours for accurate results"
        },
        {
            "id": 4,
            "category_id": 12,
            "name": "Wound Dressing & Care",
            "description": "Professional wound cleaning, dressing, and infection prevention",
            "price": 25.00,
            "requirements": "None"
        }
    ],
    staff: [
        {
            "id": 1,
            "name": "Dr. Sarah Johnson",
            "specialization": "General Practitioner",
            "qualification": "MD, MBBS",
            "experience": "12 years",
            "availability": "Mon, Wed, Fri"
        },
        {
            "id": 2,
            "name": "Dr. Michael Chen",
            "specialization": "Mental Health Specialist",
            "qualification": "MD, Psychiatry",
            "experience": "8 years",
            "availability": "Tue, Thu, Sat"
        },
        {
            "id": 3,
            "name": "Dr. Amina Bello",
            "specialization": "Reproductive Health",
            "qualification": "MD, Gynecology",
            "experience": "10 years",
            "availability": "Mon, Tue, Thu"
        },
        {
            "id": 4,
            "name": "Pharmacist James Wilson",
            "specialization": "Clinical Pharmacy",
            "qualification": "PharmD",
            "experience": "6 years",
            "availability": "Mon-Sat"
        }
    ],
    appointments: [],
    contacts: [],
    cart: [],
    orders: []
};

// Remove the loadDatabase function and initialization since we're using in-memory data
console.log('Database initialized with in-memory data');
console.log(`Loaded ${db.drugs.length} drugs, ${db.categories.length} categories`);

// In-memory cart storage (temporary)
let cartData = [];

// API Routes
app.get('/api/categories/:service_id', (req, res) => {
    try {
        const serviceId = parseInt(req.params.service_id);
        const categories = db.categories.filter(cat => cat.service_id === serviceId);
        console.log(`Returning ${categories.length} categories for service ${serviceId}`);
        res.json(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

app.get('/api/drugs', (req, res) => {
    try {
        const drugs = db.drugs || [];
        console.log(`Returning ${drugs.length} drugs from database`);
        res.json(drugs);
    } catch (error) {
        console.error('Error loading drugs:', error);
        res.status(500).json({ error: 'Failed to load drugs' });
    }
});

app.get('/api/drugs/:id', (req, res) => {
    try {
        const drugId = parseInt(req.params.id);
        const drug = db.drugs.find(d => d.id === drugId);
        if (!drug) {
            return res.status(404).json({ error: 'Drug not found' });
        }
        res.json(drug);
    } catch (error) {
        console.error('Error loading drug details:', error);
        res.status(500).json({ error: 'Failed to load drug details' });
    }
});

// Test API endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working',
        drugsCount: db.drugs?.length || 0,
        categoriesCount: db.categories?.length || 0
    });
});

// Cart API endpoints
app.get('/api/cart', (req, res) => {
    res.json({ success: true, cart: cartData });
});

app.post('/api/cart/add', (req, res) => {
    try {
        const { drugId, quantity } = req.body;
        const drug = db.drugs.find(d => d.id === drugId);
        
        if (!drug) {
            return res.status(404).json({ success: false, error: 'Drug not found' });
        }
        
        // Check if drug already in cart
        const existingIndex = cartData.findIndex(item => item.drug_id === drugId);
        
        if (existingIndex > -1) {
            // Update quantity
            cartData[existingIndex].quantity += quantity;
        } else {
            // Add new item
            cartData.push({
                id: Date.now(),
                drug_id: drugId,
                name: drug.name,
                generic_name: drug.generic_name,
                price: drug.price,
                quantity: quantity,
                prescription_required: drug.prescription_required,
                added_at: new Date().toISOString()
            });
        }
        
        res.json({ success: true, cart: cartData });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, error: 'Failed to add to cart' });
    }
});

app.put('/api/cart/update/:itemId', (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId);
        const { quantity } = req.body;
        
        const itemIndex = cartData.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, error: 'Item not found in cart' });
        }
        
        if (quantity < 1) {
            // Remove item if quantity is 0
            cartData.splice(itemIndex, 1);
        } else {
            // Update quantity
            cartData[itemIndex].quantity = quantity;
        }
        
        res.json({ success: true, cart: cartData });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false, error: 'Failed to update cart' });
    }
});

app.delete('/api/cart/remove/:itemId', (req, res) => {
    try {
        const itemId = parseInt(req.params.itemId);
        
        const itemIndex = cartData.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, error: 'Item not found in cart' });
        }
        
        cartData.splice(itemIndex, 1);
        res.json({ success: true, cart: cartData });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, error: 'Failed to remove from cart' });
    }
});

// Checkout API
app.post('/api/checkout', (req, res) => {
    try {
        const orderData = req.body;
        
        // Generate order ID
        const orderId = 'ORD-' + Date.now().toString().slice(-6);
        
        // Calculate total
        const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = orderData.deliveryOption === 'delivery' ? 5.00 : 0;
        const total = subtotal + deliveryFee;
        
        // Create order
        const order = {
            id: orderId,
            ...orderData,
            items: [...cartData],
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            total: total,
            status: 'pending',
            order_date: new Date().toISOString(),
            payment_status: 'pending'
        };
        
        // Add to database orders
        if (!db.orders) db.orders = [];
        db.orders.push(order);
        
        // Clear cart
        cartData = [];
        
        res.json({ 
            success: true, 
            order: {
                id: orderId,
                total: total
            }
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ success: false, error: 'Failed to process checkout' });
    }
});

// Frontend Routes
app.get('/', (req, res) => {
    res.render('home'); // Changed from 'index' to 'home'
});

app.get('/pharmacy', (req, res) => {
    res.render('pharmacy');
});

app.get('/consultation', (req, res) => {
    res.render('consultation');
});

app.get('/clinic', (req, res) => {
    res.render('clinic');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('home', { 
        error: 'Page not found',
        showError: true 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).render('home', { 
        error: 'Something went wrong. Please try again later.',
        showError: true 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`AmaniCare Center server running`);
    console.log(`Port: ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
    console.log(`=================================`);
    console.log(`API Endpoints:`);
    console.log(`  GET  /api/drugs - Get all drugs`);
    console.log(`  GET  /api/drugs/:id - Get drug by ID`);
    console.log(`  GET  /api/categories/1 - Get pharmacy categories`);
    console.log(`  GET  /api/test - Test API connection`);
    console.log(`=================================`);
});