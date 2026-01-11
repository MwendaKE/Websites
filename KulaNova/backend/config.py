# config.py - The Kitchen's Recipe Book for KulaNova!
# Think of this like the secret recipe book that tells our kitchen how to work!

import os  # 🗺️ OS is like our kitchen's map - it helps us find things!

class Config:
    # 🗺️ STEP 1: Find where our kitchen is located
    # BASE_DIR = "Base Directory" = The kitchen's home address!
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    # Let's break this down:
    # __file__ = "This file right here (config.py)!"
    # os.path.dirname(__file__) = "Which folder contains this file?"
    # os.path.abspath() = "Give me the FULL address, not just relative!"
    # Result: "The exact location where our kitchen recipe book lives!"
    
    # 📦 STEP 2: Tell the kitchen where to store food (database location)
    # SQLALCHEMY_DATABASE_URI = "Where to put our food storage fridge?"
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'kulanova.db')}"
    # Let's understand this magic spell:
    # "sqlite:///" = "Use SQLite database (like a simple food storage box!)"
    # os.path.join(BASE_DIR, 'kulanova.db') = "Put kulanova.db file in kitchen folder"
    # f"..." = "Put these pieces together into one address!"
    # Final result: "Store our food data in a file called kulanova.db in our kitchen!"
    # Example: "sqlite:///C:/kitchen/kulanova.db"
    
    # 🚫 STEP 3: Tell the kitchen NOT to track every tiny change
    # SQLALCHEMY_TRACK_MODIFICATIONS = "Should we watch every ingredient move?"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # This is like saying: "Don't write down every time someone takes a spoon!"
    # False = "No, don't track modifications (saves memory and speed!)"
    # True would be: "Yes, track everything (but that's slow and heavy!)"
    
    # 🔐 STEP 4: Set up a secret key for security (like a kitchen lock!)
    # SECRET_KEY = "The secret password to protect our kitchen!"
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    # Let's understand this security system:
    # os.environ.get('SECRET_KEY') = "Check if there's a secret key in environment"
    # or 'dev-secret-key' = "If not found, use this default development key"
    # This is like having TWO keys:
    # 1. Real key for real restaurant (from environment)
    # 2. Practice key for kitchen practice (default 'dev-secret-key')
    
    
"""
🎪 What Kids Will Understand:

Think of a Restaurant's Control Panel:

🗺️ BASE_DIR = Kitchen's GPS Location

```
Question: "Where is our kitchen located?"
Answer: "Right here where this recipe book is!"
Like: "Our restaurant is at 123 Food Street!"
```

📦 SQLALCHEMY_DATABASE_URI = Food Storage Address

```
Question: "Where do we keep all our recipes and orders?"
Answer: "In a special file called kulanova.db in our kitchen!"
Like: "All recipes are in the blue recipe box on shelf #3!"
```

🚫 SQLALCHEMY_TRACK_MODIFICATIONS = Kitchen Monitor

```
Question: "Should we watch every single spoon move?"
Answer: "No! That would be too much work! Just cook the food!"
Like: "Don't count every grain of salt - just make tasty food!"
```

🔐 SECRET_KEY = Kitchen Lock Password

```
Question: "How do we keep our kitchen safe?"
Answer: "With a secret password! Real one for customers, practice one for us!"
Like: "Real restaurant: Secret code #ABC123. Practice kitchen: 'open-sesame'"
```

File Paths Explained Simply:

What is __file__?

```python
__file__ = "config.py"  # This file's name!
```

"Point to yourself! Like saying 'I am here!'"

What is os.path.dirname()?

```python
os.path.dirname("kitchen/recipes/config.py") = "kitchen/recipes"
```

"Tell me which folder contains this file!"

What is os.path.abspath()?

```python
os.path.abspath("kitchen/recipes") = "C:/myrestaurant/kitchen/recipes"
```

"Give me the FULL address, from the very beginning!"

What is os.path.join()?

```python
os.path.join("kitchen", "kulanova.db") = "kitchen/kulanova.db"
```

"Connect these two path pieces together with a slash!"

Database Types Explained:

SQLite (What we use):

```
Type: File-based database (like a notebook!)
Good for: Practice, small projects, learning
Like: Writing recipes in a notebook
File: kulanova.db (one file stores everything!)
```

Other Databases (Not used here):

```
PostgreSQL: Like a big recipe library
MySQL: Like a organized recipe cabinet
MongoDB: Like a flexible recipe binder
```

Why We Use SQLite:

👍 Advantages:

· Simple: One file = easy to manage!
· Portable: Move it anywhere!
· No setup: Works immediately!
· Great for learning: Perfect for kids!

👎 Disadvantages:

· Not for huge restaurants: Limited for big traffic
· Single user: Like one chef at a time
· Practice only: Real restaurants use bigger databases

The Secret Key System:

Two Scenarios:

Scenario 1: Real Restaurant (Production)

```python
# Computer has environment variable: SECRET_KEY="real-secret-123"
os.environ.get('SECRET_KEY') = "real-secret-123"  # Gets real key!
SECRET_KEY = "real-secret-123"  # Uses real key!
```

"Real restaurant uses the REAL secret password!"

Scenario 2: Practice Kitchen (Development)

```python
# Computer has NO environment variable
os.environ.get('SECRET_KEY') = None  # No key found!
SECRET_KEY = 'dev-secret-key'  # Uses practice key!
```

"Practice kitchen uses the PRACTICE password 'dev-secret-key'!"

Why Track Modifications is False:

If True:

```
Every time: Chef adds salt → Write it down!
Every time: Chef stirs pot → Write it down!
Every time: Chef tastes food → Write it down!
Result: Kitchen notebook fills up FAST! 📓📓📓
Performance: Kitchen gets slow! 🐌
```

If False:

```
Chef adds salt → Just add it!
Chef stirs pot → Just stir it!
Chef tastes food → Just taste it!
Result: Kitchen works FAST! 🚀
Performance: Kitchen is efficient! ⚡
```

Real-World Kitchen Analogy:

The Complete Kitchen Setup:

```
1. Find kitchen location: "We're at 123 Food Street!"
2. Set up storage: "Put fridge in corner, label it kulanova.db!"
3. Decide monitoring: "Don't count every spoon movement!"
4. Set security: "Real key for customers, practice key for chefs!"
```

File Structure Visualization:

```
kitchen/                    (BASE_DIR)
├── recipes/               (Folder)
│   ├── config.py          (This file!)
│   ├── app.py             (Main chef)
│   └── models.py          (Food types)
└── kulanova.db           (Database file - created automatically!)
```

Why This File is Important:

Without Config:

```
Kitchen: "Where should I store food?"
Program: 🤷 "I don't know!"
Kitchen: "What's the secret password?"
Program: 🤷 "I don't know!"
Result: Kitchen doesn't work! ❌
```

With Config:

```
Kitchen: "Where should I store food?"
Program: 📦 "In kulanova.db file right here!"
Kitchen: "What's the secret password?"
Program: 🔐 "Use 'dev-secret-key' for practice!"
Result: Kitchen works perfectly! ✅
```

Environment Variables Explained:

What are they?

· Like: Secret notes taped to computer
· Stored: Outside the program (in computer settings)
· Used for: Secrets like passwords, API keys

How to set one (for advanced users):

```bash
# Windows:
set SECRET_KEY=my-real-secret

# Mac/Linux:
export SECRET_KEY=my-real-secret
```

The Magic of "or":

```python
SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
```

This means:

1. Try to get secret key from environment
2. If found: Use it! ✅
3. If not found: Use 'dev-secret-key' instead! 🔑

Like saying: "Look for real key. If not there, use practice key!"

Now kids understand that config.py is the kitchen's control panel that tells our restaurant where everything is, how to store food, and what security to use, making sure our kitchen runs smoothly and safely! 🎛️🍳🔧
"""
