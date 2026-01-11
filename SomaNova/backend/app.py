"""
Flask application for SomaNova API
"""
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from models import db, Book, FeaturedBook, Contact, BookTransaction, User, CartItem, WishlistItem, BookCollection
import os
import uuid
import re  
from datetime import datetime, timedelta
from sqlalchemy import func

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for frontend
CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://localhost:3000'])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///somanova.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database with app
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()


# Utility functions
def create_response(data=None, message="", status=200, error=False):
    """Standard API response format"""
    response = {
        "success": not error,
        "message": message,
        "data": data
    }
    return jsonify(response), status


def get_or_create_user(session_id):
    """Get existing user or create new one based on session_id"""
    user = User.query.filter_by(session_id=session_id).first()
    if not user:
        user = User(session_id=session_id)
        db.session.add(user)
        db.session.commit()
    return user


# ============ MIDDLEWARE FOR SESSION MANAGEMENT ============
@app.before_request
def before_request():
    """Handle session management for cart/wishlist"""
    if request.endpoint and request.endpoint in ['add_to_cart', 'remove_from_cart', 'get_cart', 
                           'add_to_wishlist', 'remove_from_wishlist', 'get_wishlist',
                           'get_user_info', 'create_checkout', 'get_user_transactions']:
        session_id = request.cookies.get('session_id')
        if not session_id:
            # Create new session ID
            session_id = str(uuid.uuid4())
            request.session_id = session_id
        else:
            request.session_id = session_id


@app.after_request
def after_request(response):
    """Set session cookie if needed"""
    if hasattr(request, 'session_id') and not request.cookies.get('session_id'):
        response.set_cookie('session_id', request.session_id, max_age=30*24*60*60)  # 30 days
    return response


# ============ HOME & INFO ROUTES ============
@app.route('/')
def home():
    """API home endpoint"""
    return create_response(
        data={
            "app": "SomaNova API",
            "version": "1.1.0",
            "description": "Second-hand Book Marketplace API",
            "endpoints": {
                "books": "/api/books",
                "featured": "/api/featured",
                "categories": "/api/categories",
                "contact": "/api/contact",
                "cart": "/api/cart",
                "wishlist": "/api/wishlist"
            }
        },
        message="Welcome to SomaNova API"
    )


@app.route('/api/info', methods=['GET'])
def api_info():
    """Get API information"""
    try:
        return create_response(
            data={
                "total_books": Book.query.count(),
                "total_categories": db.session.query(Book.category).distinct().count(),
                "featured_books": FeaturedBook.query.count(),
                "total_users": User.query.count()
            },
            message="API Information"
        )
    except Exception as e:
        print(f"Error in api_info: {str(e)}")
        return create_response(
            data={},
            message="Error fetching API info",
            status=500,
            error=True
        )


# ============ USER ROUTES ============
@app.route('/api/user/info', methods=['GET'])
def get_user_info():
    """Get user information including cart/wishlist counts"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(
                data={"session_id": None, "cart_count": 0, "wishlist_count": 0},
                message="No active session"
            )
        
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            return create_response(
                data={"session_id": session_id, "cart_count": 0, "wishlist_count": 0},
                message="New session created"
            )
        
        return create_response(
            data=user.to_dict(),
            message="User information retrieved"
        )
    except Exception as e:
        print(f"Error in get_user_info: {str(e)}")
        return create_response(
            data={"session_id": None, "cart_count": 0, "wishlist_count": 0},
            message="Error fetching user info",
            status=500,
            error=True
        )


# ============ CART ROUTES ============
@app.route('/api/cart', methods=['GET'])
def get_cart():
    """Get user's cart items"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(data=[], message="No cart items")
        
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            return create_response(data=[], message="No cart items")
        
        cart_items = CartItem.query.filter_by(user_id=user.id).all()
        return create_response(
            data=[item.to_dict() for item in cart_items],
            message=f"Found {len(cart_items)} items in cart"
        )
    except Exception as e:
        print(f"Error in get_cart: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching cart items",
            status=500,
            error=True
        )


@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    """Add book to cart"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(
                message="Session required",
                status=400,
                error=True
            )
        
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        book_id = data.get('book_id')
        quantity = data.get('quantity', 1)
        
        if not book_id:
            return create_response(
                message="Book ID is required",
                status=400,
                error=True
            )
        
        # Get or create user
        user = get_or_create_user(session_id)
        
        # Check if book exists
        book = Book.query.get(book_id)
        if not book:
            return create_response(
                message="Book not found",
                status=404,
                error=True
            )
        
        # Check if already in cart
        existing_item = CartItem.query.filter_by(user_id=user.id, book_id=book_id).first()
        if existing_item:
            existing_item.quantity += quantity
            message = "Cart item quantity updated"
        else:
            cart_item = CartItem(user_id=user.id, book_id=book_id, quantity=quantity)
            db.session.add(cart_item)
            message = "Book added to cart"
        
        db.session.commit()
        
        return create_response(
            message=message,
            status=201
        )
    except Exception as e:
        print(f"Error in add_to_cart: {str(e)}")
        return create_response(
            message="Error adding to cart",
            status=500,
            error=True
        )


@app.route('/api/cart/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """Remove item from cart"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(
                message="Session required",
                status=400,
                error=True
            )
        
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            return create_response(
                message="User not found",
                status=404,
                error=True
            )
        
        cart_item = CartItem.query.filter_by(id=item_id, user_id=user.id).first()
        if not cart_item:
            return create_response(
                message="Cart item not found",
                status=404,
                error=True
            )
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return create_response(
            message="Item removed from cart"
        )
    except Exception as e:
        print(f"Error in remove_from_cart: {str(e)}")
        return create_response(
            message="Error removing from cart",
            status=500,
            error=True
        )


@app.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    """Clear all items from cart"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(
                message="Session required",
                status=400,
                error=True
            )
        
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            return create_response(
                message="User not found",
                status=404,
                error=True
            )
        
        CartItem.query.filter_by(user_id=user.id).delete()
        db.session.commit()
        
        return create_response(
            message="Cart cleared"
        )
    except Exception as e:
        print(f"Error in clear_cart: {str(e)}")
        return create_response(
            message="Error clearing cart",
            status=500,
            error=True
        )


# ============ WISHLIST ROUTES ============
@app.route('/api/wishlist', methods=['GET'])
def get_wishlist():
    """Get user's wishlist items"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(data=[], message="No wishlist items")
        
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            return create_response(data=[], message="No wishlist items")
        
        wishlist_items = WishlistItem.query.filter_by(user_id=user.id).all()
        return create_response(
            data=[item.to_dict() for item in wishlist_items],
            message=f"Found {len(wishlist_items)} items in wishlist"
        )
    except Exception as e:
        print(f"Error in get_wishlist: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching wishlist",
            status=500,
            error=True
        )


@app.route('/api/wishlist', methods=['POST'])
def add_to_wishlist():
    """Add book to wishlist"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(
                message="Session required",
                status=400,
                error=True
            )
        
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        book_id = data.get('book_id')
        
        if not book_id:
            return create_response(
                message="Book ID is required",
                status=400,
                error=True
            )
        
        # Get or create user
        user = get_or_create_user(session_id)
        
        # Check if book exists
        book = Book.query.get(book_id)
        if not book:
            return create_response(
                message="Book not found",
                status=404,
                error=True
            )
        
        # Check if already in wishlist
        existing_item = WishlistItem.query.filter_by(user_id=user.id, book_id=book_id).first()
        if existing_item:
            return create_response(
                message="Book already in wishlist",
                status=400,
                error=True
            )
        
        wishlist_item = WishlistItem(user_id=user.id, book_id=book_id)
        db.session.add(wishlist_item)
        db.session.commit()
        
        return create_response(
            message="Book added to wishlist",
            status=201
        )
    except Exception as e:
        print(f"Error in add_to_wishlist: {str(e)}")
        return create_response(
            message="Error adding to wishlist",
            status=500,
            error=True
        )


@app.route('/api/wishlist/<int:item_id>', methods=['DELETE'])
def remove_from_wishlist(item_id):
    """Remove item from wishlist"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(
                message="Session required",
                status=400,
                error=True
            )
        
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            return create_response(
                message="User not found",
                status=404,
                error=True
            )
        
        wishlist_item = WishlistItem.query.filter_by(id=item_id, user_id=user.id).first()
        if not wishlist_item:
            return create_response(
                message="Wishlist item not found",
                status=404,
                error=True
            )
        
        db.session.delete(wishlist_item)
        db.session.commit()
        
        return create_response(
            message="Item removed from wishlist"
        )
    except Exception as e:
        print(f"Error in remove_from_wishlist: {str(e)}")
        return create_response(
            message="Error removing from wishlist",
            status=500,
            error=True
        )


@app.route('/api/wishlist/clear', methods=['DELETE'])
def clear_wishlist():
    """Clear all items from wishlist"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(
                message="Session required",
                status=400,
                error=True
            )
        
        user = User.query.filter_by(session_id=session_id).first()
        if not user:
            return create_response(
                message="User not found",
                status=404,
                error=True
            )
        
        WishlistItem.query.filter_by(user_id=user.id).delete()
        db.session.commit()
        
        return create_response(
            message="Wishlist cleared"
        )
    except Exception as e:
        print(f"Error in clear_wishlist: {str(e)}")
        return create_response(
            message="Error clearing wishlist",
            status=500,
            error=True
        )


# ============ BOOK ROUTES ============

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return create_response(
        data={"message": "API is working"},
        message="Test successful"
    )

# Update the books endpoint to handle empty data
@app.route('/api/books', methods=['GET'])
def get_books():
    """Get all books or filter by category"""
    try:
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = Book.query
        
        if category:
            query = query.filter_by(category=category)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Book.title.ilike(search_term)) | 
                (Book.author.ilike(search_term)) |
                (Book.description.ilike(search_term))
            )
        
        books = query.order_by(Book.created_at.desc()).all()
        
        # Debug logging
        print(f"Found {len(books)} books")
        if books:
            print(f"First book: {books[0].title}")
        
        return create_response(
            data=[book.to_dict() for book in books],
            message=f"Found {len(books)} books"
        )
    except Exception as e:
        print(f"Error in get_books: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching books",
            status=500,
            error=True
        )

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get a single book by ID"""
    try:
        book = Book.query.get(book_id)
        
        if not book:
            return create_response(
                message="Book not found",
                status=404,
                error=True
            )
        
        return create_response(
            data=book.to_dict(),
            message="Book details retrieved"
        )
    except Exception as e:
        print(f"Error in get_book: {str(e)}")
        return create_response(
            message="Error fetching book",
            status=500,
            error=True
        )


@app.route('/api/books', methods=['POST'])
def create_book():
    """Create a new book listing"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        # Validate required fields
        required_fields = ['title', 'author', 'price', 'category']
        for field in required_fields:
            if not data.get(field):
                return create_response(
                    message=f"Missing required field: {field}",
                    status=400,
                    error=True
                )
        
        # Create new book
        new_book = Book(
            title=data['title'],
            author=data['author'],
            price=float(data['price']),
            category=data['category'],
            description=data.get('description', ''),
            image_url=data.get('image_url', ''),
            condition=data.get('condition', 'Good'),
            isbn=data.get('isbn', ''),
            seller_name=data.get('seller_name', ''),
            seller_email=data.get('seller_email', ''),
            seller_phone=data.get('seller_phone', '')
        )
        
        db.session.add(new_book)
        db.session.commit()
        
        return create_response(
            data=new_book.to_dict(),
            message="Book created successfully",
            status=201
        )
    except Exception as e:
        print(f"Error in create_book: {str(e)}")
        return create_response(
            message="Error creating book",
            status=500,
            error=True
        )


# ============ FEATURED BOOKS ROUTES ============
@app.route('/api/featured', methods=['GET'])
def get_featured_books():
    """Get all featured books"""
    try:
        featured = FeaturedBook.query.order_by(FeaturedBook.display_order).all()
        
        return create_response(
            data=[item.to_dict() for item in featured],
            message="Featured books retrieved"
        )
    except Exception as e:
        print(f"Error in get_featured_books: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching featured books",
            status=500,
            error=True
        )


# ============ CATEGORIES ROUTES ============
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all book categories"""
    try:
        categories = db.session.query(Book.category).distinct().all()
        category_list = [category[0] for category in categories if category[0]]
        
        return create_response(
            data=category_list,
            message=f"Found {len(category_list)} categories"
        )
    except Exception as e:
        print(f"Error in get_categories: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching categories",
            status=500,
            error=True
        )


@app.route('/api/categories/<category_name>/books', methods=['GET'])
def get_books_by_category(category_name):
    """Get books by specific category"""
    try:
        books = Book.query.filter_by(category=category_name).order_by(Book.created_at.desc()).all()
        
        return create_response(
            data=[book.to_dict() for book in books],
            message=f"Found {len(books)} books in {category_name}"
        )
    except Exception as e:
        print(f"Error in get_books_by_category: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching category books",
            status=500,
            error=True
        )
    

# ============ COLLECTIONS ROUTES ============
@app.route('/api/collections', methods=['GET'])
def get_collections():
    """Get all book collections"""
    try:
        collections = BookCollection.query.order_by(BookCollection.display_order).all()
        
        return create_response(
            data=[collection.to_dict() for collection in collections],
            message="Collections retrieved"
        )
    except Exception as e:
        print(f"Error in get_collections: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching collections",
            status=500,
            error=True
        )


@app.route('/api/collections/<collection_slug>', methods=['GET'])
def get_collection(collection_slug):
    """Get a specific collection with its books"""
    try:
        collection = BookCollection.query.filter_by(slug=collection_slug).first()
        
        if not collection:
            return create_response(
                message="Collection not found",
                status=404,
                error=True
            )
        
        books = Book.query.filter_by(collection_id=collection.id).order_by(Book.created_at.desc()).all()
        
        collection_data = collection.to_dict()
        collection_data['books'] = [book.to_dict() for book in books]
        
        return create_response(
            data=collection_data,
            message=f"Collection '{collection.name}' with {len(books)} books"
        )
    except Exception as e:
        print(f"Error in get_collection: {str(e)}")
        return create_response(
            message="Error fetching collection",
            status=500,
            error=True
        )


@app.route('/api/collections/<int:collection_id>/books', methods=['GET'])
def get_collection_books(collection_id):
    """Get books by collection ID"""
    try:
        books = Book.query.filter_by(collection_id=collection_id).order_by(Book.created_at.desc()).all()
        
        return create_response(
            data=[book.to_dict() for book in books],
            message=f"Found {len(books)} books in collection"
        )
    except Exception as e:
        print(f"Error in get_collection_books: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching collection books",
            status=500,
            error=True
        )


# ============ TRANSACTION ROUTES ============
@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """Create a new book transaction"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        # Validate required fields
        required_fields = ['book_id', 'buyer_name', 'buyer_email', 'transaction_amount']
        for field in required_fields:
            if not data.get(field):
                return create_response(
                    message=f"Missing required field: {field}",
                    status=400,
                    error=True
                )
        
        # Check if book exists
        book = Book.query.get(data['book_id'])
        if not book:
            return create_response(
                message="Book not found",
                status=404,
                error=True
            )
        
        # Create transaction
        transaction = BookTransaction(
            book_id=data['book_id'],
            buyer_name=data['buyer_name'],
            buyer_email=data['buyer_email'],
            buyer_phone=data.get('buyer_phone', ''),
            transaction_amount=float(data['transaction_amount']),
            status=data.get('status', 'pending')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return create_response(
            data=transaction.to_dict(),
            message="Transaction created successfully",
            status=201
        )
    except Exception as e:
        print(f"Error in create_transaction: {str(e)}")
        return create_response(
            message="Error creating transaction",
            status=500,
            error=True
        )

# ============ CHECKOUT ROUTES ============
@app.route('/api/checkout', methods=['POST'])
def create_checkout():
    """Create a checkout transaction"""
    try:
        data = request.get_json()
        
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        # Validate required fields
        required_fields = ['buyer_name', 'buyer_email', 'transaction_amount']
        for field in required_fields:
            if not data.get(field):
                return create_response(
                    message=f"Missing required field: {field}",
                    status=400,
                    error=True
                )
        
        # Check if book exists (optional - for direct book purchases)
        book_id = data.get('book_id')
        if book_id:
            book = Book.query.get(book_id)
            if not book:
                return create_response(
                    message="Book not found",
                    status=404,
                    error=True
                )
        
        # Create transaction
        transaction = BookTransaction(
            book_id=book_id,
            buyer_name=data['buyer_name'],
            buyer_email=data['buyer_email'],
            buyer_phone=data.get('buyer_phone', ''),
            transaction_amount=float(data['transaction_amount']),
            status='pending',
            payment_method=data.get('payment_method', 'cash'),
            pickup_location=data.get('pickup_location', ''),
            pickup_instructions=data.get('pickup_instructions', '')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return create_response(
            data=transaction.to_dict(),
            message="Checkout created successfully",
            status=201
        )
        
    except Exception as e:
        print(f"Checkout error: {str(e)}")
        return create_response(
            message="Error creating checkout",
            status=500,
            error=True
        )


@app.route('/api/checkout/<int:transaction_id>/complete', methods=['POST'])
def complete_checkout(transaction_id):
    """Mark a transaction as completed (payment successful)"""
    try:
        transaction = BookTransaction.query.get(transaction_id)
        if not transaction:
            return create_response(
                message="Transaction not found",
                status=404,
                error=True
            )
        
        # Update transaction status
        transaction.status = 'completed'
        transaction.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return create_response(
            data=transaction.to_dict(),
            message="Payment completed successfully"
        )
        
    except Exception as e:
        print(f"Complete checkout error: {str(e)}")
        return create_response(
            message="Error completing checkout",
            status=500,
            error=True
        )


@app.route('/api/checkout/<int:transaction_id>', methods=['GET'])
def get_checkout_transaction(transaction_id):
    """Get transaction details"""
    try:
        transaction = BookTransaction.query.get(transaction_id)
        if not transaction:
            return create_response(
                message="Transaction not found",
                status=404,
                error=True
            )
        
        return create_response(
            data=transaction.to_dict(),
            message="Transaction details retrieved"
        )
    except Exception as e:
        print(f"Error in get_transaction: {str(e)}")
        return create_response(
            message="Error fetching transaction",
            status=500,
            error=True
        )

@app.route('/api/checkout/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Get transaction details"""
    try:
        transaction = BookTransaction.query.get(transaction_id)
        if not transaction:
            return create_response(
                message="Transaction not found",
                status=404,
                error=True
            )
        
        return create_response(
            data=transaction.to_dict(),
            message="Transaction details retrieved"
        )
    except Exception as e:
        print(f"Error in get_transaction: {str(e)}")
        return create_response(
            message="Error fetching transaction",
            status=500,
            error=True
        )


@app.route('/api/user/transactions', methods=['GET'])
def get_user_transactions():
    """Get all transactions for current user"""
    try:
        session_id = request.cookies.get('session_id')
        if not session_id:
            return create_response(data=[], message="No transactions found")
        
        transactions = BookTransaction.query.filter_by(buyer_email=session_id)\
            .order_by(BookTransaction.created_at.desc())\
            .all()
        
        return create_response(
            data=[t.to_dict() for t in transactions],
            message=f"Found {len(transactions)} transactions"
        )
    except Exception as e:
        print(f"Error in get_user_transactions: {str(e)}")
        return create_response(
            data=[],
            message="Error fetching transactions",
            status=500,
            error=True
        )


# ============ CONTACT ROUTES ============
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Submit contact form"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return create_response(
                    message=f"Missing required field: {field}",
                    status=400,
                    error=True
                )
        
        # Validate email
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return create_response(
                message="Please enter a valid email address",
                status=400,
                error=True
            )
        
        # Create contact submission
        contact = Contact(
            name=data['name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message']
        )
        
        db.session.add(contact)
        db.session.commit()
        
        return create_response(
            data=contact.to_dict(),
            message="Thank you for your message! We'll get back to you within 24-48 hours.",
            status=201
        )
        
    except Exception as e:
        print(f"Contact submission error: {str(e)}")
        return create_response(
            message="Error submitting contact form",
            status=500,
            error=True
        )


@app.route('/api/contact/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    """Get contact message details (admin use)"""
    try:
        contact = Contact.query.get(contact_id)
        if not contact:
            return create_response(
                message="Contact message not found",
                status=404,
                error=True
            )
        
        return create_response(
            data=contact.to_dict(),
            message="Contact message retrieved"
        )
    except Exception as e:
        print(f"Error in get_contact: {str(e)}")
        return create_response(
            message="Error fetching contact",
            status=500,
            error=True
        )


# ============ SEARCH ROUTE ============
@app.route('/api/search', methods=['GET'])
def search_books():
    """Search books with various filters"""
    try:
        title = request.args.get('title', '').strip()
        author = request.args.get('author', '').strip()
        category = request.args.get('category', '').strip()
        min_price = request.args.get('min_price')
        max_price = request.args.get('max_price')
        condition = request.args.get('condition', '').strip()
        collection_id = request.args.get('collection_id')
        
        query = Book.query
        
        if title:
            query = query.filter(Book.title.ilike(f'%{title}%'))
        
        if author:
            query = query.filter(Book.author.ilike(f'%{author}%'))
        
        if category:
            query = query.filter_by(category=category)
        
        if min_price:
            try:
                query = query.filter(Book.price >= float(min_price))
            except ValueError:
                pass
        
        if max_price:
            try:
                query = query.filter(Book.price <= float(max_price))
            except ValueError:
                pass
        
        if condition:
            query = query.filter_by(condition=condition)
        
        if collection_id:
            try:
                query = query.filter_by(collection_id=int(collection_id))
            except ValueError:
                pass
        
        books = query.order_by(Book.created_at.desc()).all()
        
        return create_response(
            data=[book.to_dict() for book in books],
            message=f"Found {len(books)} books matching search criteria"
        )
    except Exception as e:
        print(f"Error in search_books: {str(e)}")
        return create_response(
            data=[],
            message="Error searching books",
            status=500,
            error=True
        )

# ============ ADMIN ROUTES ============
# Note: In production, you should add proper authentication/authorization
@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    """Get admin dashboard statistics"""
    try:
        print("Admin dashboard called - fetching from database")
        
        # Initialize counts with 0
        total_books = 0
        total_users = 0
        total_transactions = 0
        total_contacts = 0
        recent_books = 0
        recent_transactions = 0
        total_revenue = 0.0
        
        try:
            # Basic counts - wrap each in try/except
            total_books = Book.query.count() or 0
            total_users = User.query.count() or 0
            total_transactions = BookTransaction.query.count() or 0
            total_contacts = Contact.query.count() or 0
            
            # Recent books (last 7 days)
            week_ago = datetime.utcnow() - timedelta(days=7)
            recent_books = Book.query.filter(Book.created_at >= week_ago).count() or 0
            
            # Recent transactions (last 7 days)
            recent_transactions = BookTransaction.query.filter(
                BookTransaction.created_at >= week_ago
            ).count() or 0
            
            # Revenue calculation - handle empty results
            completed_transactions = BookTransaction.query.filter_by(status='completed').all() or []
            if completed_transactions:
                total_revenue = sum(t.transaction_amount for t in completed_transactions if t.transaction_amount)
            else:
                total_revenue = 0.0
                
        except Exception as db_error:
            print(f"Database query error (non-critical): {str(db_error)}")
            # Continue with 0 values
        
        # Get recent activity - handle empty database
        recent_activity = {
            'books': [],
            'transactions': [],
            'contacts': []
        }
        
        try:
            # Get recent books
            books = Book.query.order_by(Book.created_at.desc()).limit(5).all()
            recent_activity['books'] = [book.to_dict() for book in books] if books else []
            
            # Get recent transactions  
            transactions = BookTransaction.query.order_by(BookTransaction.created_at.desc()).limit(5).all()
            recent_activity['transactions'] = [t.to_dict() for t in transactions] if transactions else []
            
            # Get recent contacts
            contacts = Contact.query.order_by(Contact.created_at.desc()).limit(5).all()
            recent_activity['contacts'] = [c.to_dict() for c in contacts] if contacts else []
            
        except Exception as activity_error:
            print(f"Recent activity error: {str(activity_error)}")
            # Keep empty arrays
        
        return create_response(
            data={
                'stats': {
                    'total_books': total_books,
                    'total_users': total_users,
                    'total_transactions': total_transactions,
                    'total_contacts': total_contacts,
                    'recent_books': recent_books,
                    'recent_transactions': recent_transactions,
                    'total_revenue': total_revenue
                },
                'recent_activity': recent_activity
            },
            message="Admin dashboard data retrieved"
        )
    except Exception as e:
        print(f"Critical error in admin_dashboard: {str(e)}")
        import traceback
        traceback.print_exc()
        # Fallback to test data if everything fails
        return create_response(
            data={
                'stats': {
                    'total_books': 0,
                    'total_users': 0,
                    'total_transactions': 0,
                    'total_contacts': 0,
                    'recent_books': 0,
                    'recent_transactions': 0,
                    'total_revenue': 0
                },
                'recent_activity': {
                    'books': [],
                    'transactions': [],
                    'contacts': []
                }
            },
            message="Using fallback data - database may need initialization"
        )
        
@app.route('/api/admin/books', methods=['GET'])
def admin_get_books():
    """Get all books for admin with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        
        query = Book.query
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Book.title.ilike(search_term)) | 
                (Book.author.ilike(search_term)) |
                (Book.isbn.ilike(search_term))
            )
        
        books = query.order_by(Book.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return create_response(
            data={
                'books': [book.to_dict() for book in books.items],
                'pagination': {
                    'page': books.page,
                    'per_page': books.per_page,
                    'total': books.total,
                    'pages': books.pages,
                    'has_next': books.has_next,
                    'has_prev': books.has_prev
                }
            },
            message=f"Found {books.total} books"
        )
    except Exception as e:
        print(f"Error in admin_get_books: {str(e)}")
        return create_response(
            data={'books': [], 'pagination': {}},
            message="Error fetching books",
            status=500,
            error=True
        )

# ============ ADMIN BOOK EDIT ROUTE ============
@app.route('/api/admin/books/<int:book_id>', methods=['PUT'])
def admin_update_book(book_id):
    """Update a book (admin only)"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        book = Book.query.get(book_id)
        if not book:
            return create_response(
                message="Book not found",
                status=404,
                error=True
            )
        
        # Update fields
        update_fields = ['title', 'author', 'price', 'category', 'description',
                        'image_url', 'condition', 'isbn', 'seller_name',
                        'seller_email', 'seller_phone', 'collection_id']
        
        for field in update_fields:
            if field in data:
                setattr(book, field, data[field])
        
        book.updated_at = datetime.utcnow()
        db.session.commit()
        
        return create_response(
            data=book.to_dict(),
            message="Book updated successfully"
        )
    except Exception as e:
        print(f"Error in admin_update_book: {str(e)}")
        return create_response(
            message="Error updating book",
            status=500,
            error=True
        )

@app.route('/api/admin/books/<int:book_id>', methods=['DELETE'])
def admin_delete_book(book_id):
    """Delete a book (admin only)"""
    try:
        book = Book.query.get(book_id)
        if not book:
            return create_response(
                message="Book not found",
                status=404,
                error=True
            )
        
        # Delete related records first
        CartItem.query.filter_by(book_id=book_id).delete()
        WishlistItem.query.filter_by(book_id=book_id).delete()
        FeaturedBook.query.filter_by(book_id=book_id).delete()
        
        db.session.delete(book)
        db.session.commit()
        
        return create_response(
            message="Book deleted successfully"
        )
    except Exception as e:
        print(f"Error in admin_delete_book: {str(e)}")
        return create_response(
            message="Error deleting book",
            status=500,
            error=True
        )


@app.route('/api/admin/transactions', methods=['GET'])
def admin_get_transactions():
    """Get all transactions for admin"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '')
        
        query = BookTransaction.query
        
        if status:
            query = query.filter_by(status=status)
        
        transactions = query.order_by(BookTransaction.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return create_response(
            data={
                'transactions': [t.to_dict() for t in transactions.items],
                'pagination': {
                    'page': transactions.page,
                    'per_page': transactions.per_page,
                    'total': transactions.total,
                    'pages': transactions.pages,
                    'has_next': transactions.has_next,
                    'has_prev': transactions.has_prev
                }
            },
            message=f"Found {transactions.total} transactions"
        )
    except Exception as e:
        print(f"Error in admin_get_transactions: {str(e)}")
        return create_response(
            data={'transactions': [], 'pagination': {}},
            message="Error fetching transactions",
            status=500,
            error=True
        )


@app.route('/api/admin/transactions/<int:transaction_id>', methods=['PUT'])
def admin_update_transaction(transaction_id):
    """Update transaction status (admin only)"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        transaction = BookTransaction.query.get(transaction_id)
        if not transaction:
            return create_response(
                message="Transaction not found",
                status=404,
                error=True
            )
        
        if 'status' in data:
            transaction.status = data['status']
            transaction.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return create_response(
            data=transaction.to_dict(),
            message="Transaction updated successfully"
        )
    except Exception as e:
        print(f"Error in admin_update_transaction: {str(e)}")
        return create_response(
            message="Error updating transaction",
            status=500,
            error=True
        )


@app.route('/api/admin/contacts', methods=['GET'])
def admin_get_contacts():
    """Get all contact submissions for admin"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        is_read = request.args.get('is_read', '')
        
        query = Contact.query
        
        if is_read.lower() == 'true':
            query = query.filter_by(is_read=True)
        elif is_read.lower() == 'false':
            query = query.filter_by(is_read=False)
        
        contacts = query.order_by(Contact.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return create_response(
            data={
                'contacts': [c.to_dict() for c in contacts.items],
                'pagination': {
                    'page': contacts.page,
                    'per_page': contacts.per_page,
                    'total': contacts.total,
                    'pages': contacts.pages,
                    'has_next': contacts.has_next,
                    'has_prev': contacts.has_prev
                }
            },
            message=f"Found {contacts.total} contacts"
        )
    except Exception as e:
        print(f"Error in admin_get_contacts: {str(e)}")
        return create_response(
            data={'contacts': [], 'pagination': {}},
            message="Error fetching contacts",
            status=500,
            error=True
        )


@app.route('/api/admin/contacts/<int:contact_id>', methods=['PUT'])
def admin_update_contact(contact_id):
    """Update contact status (admin only)"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        contact = Contact.query.get(contact_id)
        if not contact:
            return create_response(
                message="Contact not found",
                status=404,
                error=True
            )
        
        if 'is_read' in data:
            contact.is_read = bool(data['is_read'])
        
        db.session.commit()
        
        return create_response(
            data=contact.to_dict(),
            message="Contact updated successfully"
        )
    except Exception as e:
        print(f"Error in admin_update_contact: {str(e)}")
        return create_response(
            message="Error updating contact",
            status=500,
            error=True
        )


@app.route('/api/admin/contacts/<int:contact_id>', methods=['DELETE'])
def admin_delete_contact(contact_id):
    """Delete a contact submission (admin only)"""
    try:
        contact = Contact.query.get(contact_id)
        if not contact:
            return create_response(
                message="Contact not found",
                status=404,
                error=True
            )
        
        db.session.delete(contact)
        db.session.commit()
        
        return create_response(
            message="Contact deleted successfully"
        )
    except Exception as e:
        print(f"Error in admin_delete_contact: {str(e)}")
        return create_response(
            message="Error deleting contact",
            status=500,
            error=True
        )


@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """Get all users for admin"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        users = User.query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return create_response(
            data={
                'users': [u.to_dict() for u in users.items],
                'pagination': {
                    'page': users.page,
                    'per_page': users.per_page,
                    'total': users.total,
                    'pages': users.pages,
                    'has_next': users.has_next,
                    'has_prev': users.has_prev
                }
            },
            message=f"Found {users.total} users"
        )
    except Exception as e:
        print(f"Error in admin_get_users: {str(e)}")
        return create_response(
            data={'users': [], 'pagination': {}},
            message="Error fetching users",
            status=500,
            error=True
        )


@app.route('/api/admin/featured', methods=['POST'])
def admin_add_featured():
    """Add a book to featured (admin only)"""
    try:
        data = request.get_json()
        if not data:
            return create_response(
                message="No data provided",
                status=400,
                error=True
            )
        
        book_id = data.get('book_id')
        display_order = data.get('display_order', 0)
        
        if not book_id:
            return create_response(
                message="Book ID is required",
                status=400,
                error=True
            )
        
        # Check if book exists
        book = Book.query.get(book_id)
        if not book:
            return create_response(
                message="Book not found",
                status=404,
                error=True
            )
        
        # Check if already featured
        existing = FeaturedBook.query.filter_by(book_id=book_id).first()
        if existing:
            return create_response(
                message="Book is already featured",
                status=400,
                error=True
            )
        
        featured = FeaturedBook(book_id=book_id, display_order=display_order)
        db.session.add(featured)
        db.session.commit()
        
        return create_response(
            data=featured.to_dict(),
            message="Book added to featured",
            status=201
        )
    except Exception as e:
        print(f"Error in admin_add_featured: {str(e)}")
        return create_response(
            message="Error adding featured book",
            status=500,
            error=True
        )


@app.route('/api/admin/featured/<int:featured_id>', methods=['DELETE'])
def admin_remove_featured(featured_id):
    """Remove a book from featured (admin only)"""
    try:
        featured = FeaturedBook.query.get(featured_id)
        if not featured:
            return create_response(
                message="Featured book not found",
                status=404,
                error=True
            )
        
        db.session.delete(featured)
        db.session.commit()
        
        return create_response(
            message="Book removed from featured"
        )
    except Exception as e:
        print(f"Error in admin_remove_featured: {str(e)}")
        return create_response(
            message="Error removing featured book",
            status=500,
            error=True
        )
        
# ============ ERROR HANDLERS ============
@app.errorhandler(404)
def not_found(error):
    return create_response(
        message="Endpoint not found",
        status=404,
        error=True
    )


@app.errorhandler(500)
def server_error(error):
    return create_response(
        message="Internal server error",
        status=500,
        error=True
    )


# ============ APPLICATION START ============
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)