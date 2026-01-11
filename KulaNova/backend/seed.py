from models import db, Category, Product

def seed_data():
    """Seed the database with initial data"""
    
    # Check if data already exists
    if Category.query.first():
        print("Database already has data. Skipping seeding.")
        return
    
    print("Seeding database...")
    
    # Create categories
    categories_data = [
        {"name": "Nova Meals"},
        {"name": "Nova Snacks"},
        {"name": "Nova Drinks"},
        {"name": "Nova Desserts"},
    ]
    
    categories = {}
    for cat_data in categories_data:
        category = Category(name=cat_data["name"])
        db.session.add(category)
        db.session.flush()  # Get ID without committing
        categories[cat_data["name"]] = category
    
    # Create products
    products_data = [
        {
            "name": "CrispyNova Chicken",
            "short_desc": "Golden crispy fried chicken with secret spices",
            "long_desc": "High in protein and rich in B vitamins. Supports muscle growth, energy production, and immunity. Made with fresh, never-frozen chicken.",
            "price": 5.99,
            "image": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
            "category": "Nova Meals"
        },
        {
            "name": "StoneNova Pizza",
            "short_desc": "Stone-baked cheesy pizza with fresh toppings",
            "long_desc": "Provides energy through carbohydrates and calcium for strong bones. Supports brain function and satiety. Made with 100% mozzarella.",
            "price": 7.99,
            "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h-300&fit=crop",
            "category": "Nova Meals"
        },
        {
            "name": "GoldenNova Fish",
            "short_desc": "Crispy fried fish with lemon herb sauce",
            "long_desc": "Rich in omega-3 fatty acids and vitamin D. Supports heart health and reduces inflammation. Wild-caught and sustainably sourced.",
            "price": 6.49,
            "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
            "category": "Nova Meals"
        },
        {
            "name": "EggNova Omelette",
            "short_desc": "Soft omelette with fresh herbs and cheese",
            "long_desc": "Packed with essential amino acids and vitamins A, D, E, and B12. Supports eye health, muscle repair, and weight management.",
            "price": 3.99,
            "image": "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop",
            "category": "Nova Meals"
        },
        {
            "name": "BurgerNova Deluxe",
            "short_desc": "Juicy beef burger with special sauce",
            "long_desc": "Complete meal with proteins, carbs, and healthy fats. Perfect for post-workout recovery or a satisfying meal.",
            "price": 8.49,
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
            "category": "Nova Meals"
        },
        {
            "name": "PastaNova Alfredo",
            "short_desc": "Creamy pasta with mushrooms and herbs",
            "long_desc": "Rich in carbohydrates for energy and calcium for bone health. Comfort food at its best with a creamy sauce.",
            "price": 6.99,
            "image": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop",
            "category": "Nova Meals"
        },
        {
            "name": "FriesNova Supreme",
            "short_desc": "Crispy fries with special seasoning",
            "long_desc": "Golden crispy fries seasoned with our special blend of herbs and spices. Perfect side dish.",
            "price": 2.99,
            "image": "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&h=300&fit=crop",
            "category": "Nova Snacks"
        },
        {
            "name": "OnionNova Rings",
            "short_desc": "Crispy onion rings with dipping sauce",
            "long_desc": "Sweet onion rings coated in our special crispy batter. Served with a tangy dipping sauce.",
            "price": 3.49,
            "image": "https://images.unsplash.com/photo-1639024471284-801f05ca84c5?w=400&h=300&fit=crop",
            "category": "Nova Snacks"
        },
        {
            "name": "Nova Cola",
            "short_desc": "Refreshing cola drink",
            "long_desc": "Classic cola flavor, perfectly carbonated and served ice cold.",
            "price": 1.99,
            "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=300&fit=crop",
            "category": "Nova Drinks"
        },
        {
            "name": "Nova Lemonade",
            "short_desc": "Fresh squeezed lemonade",
            "long_desc": "Made with fresh lemons and a hint of mint. Refreshing and not too sweet.",
            "price": 2.49,
            "image": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop",
            "category": "Nova Drinks"
        },
        {
            "name": "ChocoNova Cake",
            "short_desc": "Rich chocolate cake slice",
            "long_desc": "Decadent chocolate cake with layers of rich chocolate ganache. Perfect dessert.",
            "price": 4.99,
            "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
            "category": "Nova Desserts"
        },
        {
            "name": "BerryNova Cheesecake",
            "short_desc": "Creamy cheesecake with berry topping",
            "long_desc": "Smooth and creamy cheesecake with a mixed berry compote on top.",
            "price": 5.49,
            "image": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop",
            "category": "Nova Desserts"
        },
    ]
    
    for prod_data in products_data:
        product = Product(
            name=prod_data["name"],
            short_desc=prod_data["short_desc"],
            long_desc=prod_data["long_desc"],
            price=prod_data["price"],
            image=prod_data["image"],
            category_id=categories[prod_data["category"]].id
        )
        db.session.add(product)
    
    # Commit everything
    db.session.commit()
    
    print(f"Seeded {len(categories_data)} categories and {len(products_data)} products successfully!")
    print("Sample data ready!")

if __name__ == "__main__":
    # For testing the seed file directly
    from app import create_app
    app = create_app()
    with app.app_context():
        seed_data()