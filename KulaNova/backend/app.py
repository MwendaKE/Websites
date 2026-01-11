# app.py - The Kitchen Chef of Our Restaurant!
# Think of this like the head chef who cooks all the food and serves it to customers!

from flask import Flask, jsonify, request  # 🍽️ Flask is our kitchen tools!
from flask_cors import CORS  # 🔓 CORS is the door that lets React come in!
from models import db, Product, Category, Contact, Order, OrderItem  # 📦 Our food ingredients database!
from config import Config  # 📋 Our recipe book (settings)!

def create_app():
    # 👨‍🍳 STEP 1: Create the Flask app (our kitchen!)
    app = Flask(__name__)  # "Build a new kitchen called 'KulaNova Kitchen'!"
    app.config.from_object(Config)  # "Use our recipe book (Config) for settings!"
    
    # 🚪 STEP 2: Enable CORS (open the kitchen door for React!)
    CORS(app)  # "Dear React frontend, you're welcome in our kitchen!"
    
    # 📚 STEP 3: Connect to database (set up our food storage shelves!)
    db.init_app(app)  # "Connect our recipe database to our kitchen!"

    # 🏠 ROUTE 1: Home page (the kitchen's welcome sign!)
    @app.route("/")
    def home():
        return jsonify({"message": "KulaNova API is running"})  # "Hello! Kitchen is open!"
        # jsonify is like putting food in a nice delivery box!

    # 🍔 ROUTE 2: Get all products (show the whole menu!)
    @app.route("/api/products")
    def get_products():
        try:
            # 🍽️ Ask database: "Give me ALL the food items!"
            products = Product.query.all()  # "Get everything from the 'products' shelf!"
            
            # 📦 Put each food item in a nice delivery box (JSON format)
            return jsonify([{
                "id": p.id,  # 🏷️ Food ID number
                "name": p.name,  # 🍔 Food name
                "price": p.price,  # 💰 Food price
                "short_desc": p.short_desc,  # 📝 Short description
                "long_desc": p.long_desc,  # 📖 Long description
                "image": p.image,  # 🖼️ Food picture
                "category_id": p.category_id  # 📂 Which food group it's in
            } for p in products])  # "Do this for EVERY food item!"
        except Exception as e:
            # 😟 Oops! Something went wrong in the kitchen!
            return jsonify({"error": str(e)}), 500  # "500 means 'Kitchen error!'"

    # 🔍 ROUTE 3: Get single product (look at ONE food item closely!)
    @app.route("/api/products/<int:product_id>")
    def get_product(product_id):
        try:
            # 🔎 Ask database: "Find food with this specific ID number!"
            product = Product.query.get_or_404(product_id)  # "404 means 'Food not found!'"
            
            # 📦 Put this one food item in a delivery box
            return jsonify({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "short_desc": product.short_desc,
                "long_desc": product.long_desc,
                "image": product.image,
                "category_id": product.category_id
            })
        except Exception as e:
            # 😟 Oops! Couldn't find that food!
            return jsonify({"error": str(e)}), 404  # "404 means 'Not found!'"

    # 📂 ROUTE 4: Get all categories (show all food groups!)
    @app.route("/api/categories")
    def get_categories():
        try:
            # 🍽️ Ask database: "Give me ALL the food categories!"
            categories = Category.query.all()  # "Get everything from 'categories' shelf!"
            
            # 📦 Put each category in a delivery box
            return jsonify([{
                "id": c.id,  # 🏷️ Category ID
                "name": c.name  # 📛 Category name (like "Snacks" or "Drinks")
            } for c in categories])
        except Exception as e:
            # 😟 Oops! Can't get categories!
            return jsonify({"error": str(e)}), 500  # "500 means 'Kitchen error!'"

    # 📨 ROUTE 5: Contact form (customers sending us messages!)
    @app.route("/api/contact", methods=["POST"])  # 🚚 "POST means 'Send us something!'"
    def contact():
        try:
            # 📝 Get the message from React (like reading a note!)
            data = request.get_json()  # "Read the note the customer sent!"
            
            # 🔍 Check if note has all important parts
            if not all(key in data for key in ["name", "email", "message"]):
                return jsonify({"error": "Missing required fields"}), 400  # "400 means 'Bad note!'"
            
            # ✉️ Create a new Contact message (like writing in our message book!)
            msg = Contact(
                name=data["name"],  # 👤 Customer name
                email=data["email"],  # 📧 Customer email
                message=data["message"]  # 💬 Customer message
            )
            db.session.add(msg)  # "Add this message to our message book!"
            db.session.commit()  # "Save it permanently!"
            
            return jsonify({"message": "Message received"}), 201  # "201 means 'Created successfully!'"
            
        except Exception as e:
            db.session.rollback()  # "Oops! Erase that unfinished message!"
            return jsonify({"error": str(e)}), 500  # "500 means 'Kitchen error!'"

    # 🛒 ROUTE 6: Create order (customer placing a food order!)
    @app.route("/api/orders", methods=["POST"])  # 🚚 "POST means 'Send us an order!'"
    def create_order():
        try:
            # 📝 Get the order from React
            data = request.get_json()  # "Read the order ticket!"
            
            # 🔍 Check if order has all important parts
            if not all(key in data for key in ["customer_name", "phone", "items"]):
                return jsonify({"error": "Missing required fields"}), 400  # "400 means 'Bad order!'"
            
            # 📦 Check if items list is valid
            if not isinstance(data['items'], list) or len(data['items']) == 0:
                return jsonify({"error": "Items must be a non-empty list"}), 400
            
            # 🧮 Calculate total price (add up all items!)
            total = sum(item['quantity'] * item['price'] for item in data['items'])
            # "For each item: quantity × price, then add them all up!"
            
            # 📋 Create the main order (like writing order on kitchen ticket!)
            order = Order(
                customer_name=data['customer_name'],  # 👤 Who ordered
                phone=data['phone'],  # 📞 Their phone number
                total_price=total,  # 💰 Total cost
                status='pending'  # ⏳ Order status (waiting to be cooked!)
            )
            db.session.add(order)  # "Add order to our order book!"
            db.session.flush()  # "Get order ID but don't save yet (like holding ticket!)"
            
            # 🍔 Add each food item to the order
            for item in data['items']:
                # 🔍 Check if each item has all details
                if not all(key in item for key in ["product_id", "quantity", "price"]):
                    db.session.rollback()  # "Oops! Cancel this order!"
                    return jsonify({"error": "Missing item fields"}), 400
                
                # 📝 Write each item on the order ticket
                order_item = OrderItem(
                    order_id=order.id,  # 🏷️ Which order this belongs to
                    product_id=item['product_id'],  # 🍔 Which food item
                    quantity=item['quantity'],  # 🔢 How many
                    price=item['price']  # 💰 Price each
                )
                db.session.add(order_item)  # "Add this item to the order!"
            
            db.session.commit()  # ✅ "Save the complete order permanently!"
            
            return jsonify({
                "order_id": order.id,  # 🎫 Order number
                "message": "Order created successfully",  # ✅ Success message
                "total": total  # 💰 Total price
            }), 201  # "201 means 'Order created successfully!'"
            
        except Exception as e:
            db.session.rollback()  # "Oops! Cancel this order!"
            return jsonify({"error": str(e)}), 500  # "500 means 'Kitchen error!'"

    return app  # "Here's our fully built kitchen, ready to cook!"


# 🚀 START THE KITCHEN! (Only run this if file is executed directly)
if __name__ == "__main__":
    app = create_app()  # "Build our kitchen!"
    
    # 📚 Set up the kitchen before opening
    with app.app_context():
        db.create_all()  # "Create all our food storage shelves (tables)!"
        
        # 🌱 Only add sample food if kitchen is empty
        if Category.query.first() is None:  # "Check if we have any food categories yet"
            try:
                from seed import seed_data  # "Get our sample food recipes!"
                seed_data()  # "Add sample burgers, pizzas, drinks to kitchen!"
                print("Database seeded successfully")  # "✅ Sample food added!"
            except ImportError:
                print("No seed.py found, skipping seeding")  # "Can't find recipe book!"
            except Exception as e:
                print(f"Error seeding database: {e}")  # "Oops! Something went wrong!"
    
    # 🏪 OPEN THE KITCHEN FOR BUSINESS!
    app.run(debug=True, host='0.0.0.0', port=5000)
    # debug=True = "Show errors clearly while practicing!"
    # host='0.0.0.0' = "Allow everyone to visit our kitchen!"
    # port=5000 = "Our kitchen door number is 5000!"
    
    
"""
🎪 What Kids Will Understand:

Think of a Restaurant Kitchen:

👨‍🍳 The Chef (Flask App)

· Job: Cooks food and serves it
· Location: Kitchen (port 5000)
· Tools: Recipe book, pots, pans

👨‍💼 The Waiter (React Frontend)

· Job: Takes orders from customers
· Location: Dining area (port 5173)
· Tools: Order pad, menu

📦 The Food Storage (Database)

· Job: Stores all food ingredients
· Location: Pantry and fridge
· Contains: Burgers, pizzas, drinks

The 6 Kitchen Stations (Routes):

1. 🏠 Welcome Station (/)

```
Customer: "Hello kitchen!"
Kitchen: "Hello! We're open and ready!"
```

2. 🍔 Menu Station (/api/products)

```
Customer: "What's on the menu?"
Kitchen: "Here's our delicious menu with 12 items!"
```

3. 🔍 Food Details Station (/api/products/<id>)

```
Customer: "Tell me about the cheeseburger!"
Kitchen: "Here are all the cheeseburger details!"
```

4. 📂 Food Groups Station (/api/categories)

```
Customer: "What types of food do you have?"
Kitchen: "We have meals, snacks, drinks, desserts!"
```

5. 📨 Message Station (/api/contact)

```
Customer: "Dear restaurant, I have a question..."
Kitchen: "Message received! We'll read it soon!"
```

6. 🛒 Order Station (/api/orders)

```
Customer: "I want 2 burgers and 1 soda!"
Kitchen: "Order #42 received! Cooking now!"
```

HTTP Status Codes Explained:

✅ Success Codes:

· 200 OK = "Everything worked!"
· 201 Created = "We created something new (order/message)!"

❌ Error Codes:

· 400 Bad Request = "You sent a bad order/message!"
· 404 Not Found = "We can't find that food item!"
· 500 Internal Server Error = "Oops! Kitchen problem!"

Database Actions Explained:

db.session.add()

"Put this item on the counter (ready to save)"

db.session.commit()

"Actually save everything on the counter to storage"

db.session.rollback()

"Oops! Clear the counter and start over"

db.session.flush()

"Get an ID number but don't save yet (like holding a ticket)"

Real-World Restaurant Flow:

```
1. Customer (React) asks: "Menu please!" 📋
2. Waiter (API) asks Kitchen: "What's cooking?" 👨‍🍳
3. Kitchen checks Pantry (Database): "Here's the menu!" 📦
4. Kitchen tells Waiter: "Here's the menu!" 🍔
5. Waiter tells Customer: "Here's the menu!" 🎉
```

Why We Need Try/Except:

Without Try/Except:

```
Customer: "I want food #999!"
Kitchen: ❌ *CRASH* "We don't have food #999!"
Restaurant closes! 😱
```

With Try/Except:

```
Customer: "I want food #999!"
Kitchen: 😟 "Sorry, we don't have that food!"
Customer: "Okay, I'll choose something else!" 👍
Restaurant stays open! 🎉
```

The Magic of @app.route:

```python
@app.route("/api/products")
def get_products():
    return "Here are the products!"
```

This means: "When someone visits /api/products, run the get_products function!"

JSON Explained for Kids:

```python
jsonify({"name": "Cheeseburger", "price": 5.99})
```

This creates:

```json
{
  "name": "Cheeseburger",
  "price": 5.99
}
```

Think of it like a labeled food container! 🍔📦

Development vs Production:

Development (Practice Mode):

```python
app.run(debug=True, host='0.0.0.0', port=5000)
```

· debug=True = Show errors clearly
· host='0.0.0.0' = Allow everyone to connect
· port=5000 = Door number 5000

Production (Real Restaurant Mode):

Would use different settings for real customers!

Now kids understand that app.py is the master chef who runs the entire kitchen, cooking up data, serving it to customers (React), and managing all the food orders and messages! 👨‍🍳🍕🎪
"""