# 🪵 CedarHaus

### Your Modern Furniture Destination

**CedarHaus** is a professional, minimalist, and modern furniture e-commerce platform built with **Flask (Python)** and **JavaScript**.  
It offers a clean, simple, and elegant experience for customers looking to explore and purchase high-quality furniture — from **sofa sets, chairs, kitchen tables, and office tables** to **beds, kennels, and more**.

---

## 🌿 Brand Concept

**CedarHaus** blends **urban sophistication** with the **warmth of natural wood**.  
The brand name comes from **"Cedar"**, symbolizing strength and beauty, and **"Haus"**, the German word for home — representing comfort, craftsmanship, and quality living.

---

## 🎨 Design & Theme

- **Theme:** Urban Contemporary — sleek, modern, and professional  
- **Design Style:** Modern Minimalist — clean layouts with focus on products  
- **Primary Colors:**
  - Background: `#F9F9F9` (Soft White)
  - Accent: `#556B2F` (Deep Olive Green)
  - Secondary: `#8B5E3C` (Warm Wood Brown)
  - Text: `#222222` (Charcoal Black)
  - Highlight: `#C0A060` (Muted Gold)

The overall design brings together a sense of **comfort, nature, and modern elegance**.

---

## 🏗️ Tech Stack

- **Backend:** Flask (Python)
- **Frontend:** HTML5, CSS3, JavaScript
- **Database:** SQLite with SQLAlchemy ORM
- **Template Engine:** Jinja2 (Flask)
- **Styling:** Custom CSS with CSS Variables
- **Responsive Design:** Mobile-first approach
- **Payments:** MPESA integration simulation

---

## 🛋️ Website Features

### Customer-Facing Features
- **Home Page:** Hero banner, featured products, about section, and call-to-action
- **Shop/Collections:** Browse furniture collections with category filtering
- **Product Details:** Individual product pages with pricing, descriptions, and purchase options
- **About Us:** Company story, mission, values, and team information
- **Contact:** Customer inquiry form with message storage
- **WhatsApp Integration:** Direct product inquiries via WhatsApp
- **MPESA Payment Simulation:** Simulated payment processing

### Admin Panel Features
- **Admin Dashboard:** Overview with key metrics and recent activity
- **Product Management:** Add, edit, delete products with character limits (20 chars for name, 40 for description)
- **Customer Analytics:** View customer spending patterns and frequent customers
- **Transaction History:** Complete purchase history and revenue tracking
- **Contact Management:** Handle customer inquiries and messages
- **Sales Analytics:** Revenue charts, product performance, and business insights
- **Secure Authentication:** Protected admin access with session management

---

## 📊 Database Models

- **Category:** Product categories with emoji mapping
- **Product:** Furniture items with name (20 char max), description (40 char max), pricing, and availability
- **Contact:** Customer inquiry messages
- **Customer:** Customer information with phone-based identification
- **Transaction:** Purchase records with timestamps and amounts

---

## 🔐 Admin Features

### Access Control
- Secure admin authentication system
- Session-based login management
- Protected admin routes

### Management Capabilities
- **Products:** Full CRUD operations with validation
- **Customers:** View purchase history and spending patterns
- **Transactions:** Complete sales tracking
- **Analytics:** Revenue charts and business insights
- **Messages:** Customer inquiry management

---

## 🛒 E-commerce Features

- **Product Catalog:** Organized by categories with emoji icons
- **Shopping Experience:** Clean, intuitive product browsing
- **Purchase Flow:** Simulated MPESA payment integration
- **Customer Communication:** WhatsApp integration for inquiries
- **Responsive Design:** Optimized for all devices

---

## 🎯 Key Features

### Design Excellence
- Consistent color scheme and typography
- Smooth animations and transitions
- Professional spacing and layout
- Mobile-responsive design

### User Experience
- Intuitive navigation
- Fast loading times
- Clear call-to-actions
- Accessible design patterns

### Business Features
- Comprehensive admin dashboard
- Sales tracking and analytics
- Customer relationship management
- Inventory management

---

## 🔧 Customization

### Adding New Categories
Update the `get_category_emoji` function in `app.py` to add new furniture categories with appropriate emojis.

### Styling Changes
Modify CSS variables in individual style files to maintain brand consistency while customizing appearance.

### Product Limits
Adjust character limits in `models.py` for product names and descriptions as needed.

---

## 📈 Future Enhancements

- Real MPESA API integration
- User registration and accounts
- Shopping cart functionality
- Order tracking system
- Email notifications
- Inventory management
- Advanced analytics dashboard
- Multi-language support
- Product reviews and ratings

---

## 🐛 Troubleshooting

### Common Issues

1. **Database not created**
   - Run: `python -c "from app import db; db.create_all()"`

2. **Admin login not working**
   - Verify credentials: username `admin`, password `cedarhaus123`
   - Check session configuration

3. **Static files not loading**
   - Ensure proper file paths in templates
   - Check Flask static folder configuration

---

## 📄 License

This project is developed for educational and demonstration purposes.

---

## 💡 Vision

To make **CedarHaus** the go-to online furniture destination for anyone seeking **quality craftsmanship**, **modern design**, and **a touch of natural elegance** — all in one place.

---

## 🛠️ Author

**Mwenda E. Njagi**  
Software Engineer | Python & Java Developer  
Creator of CedarHaus 🪵

---

*Built with passion for beautiful spaces and quality craftsmanship.*
