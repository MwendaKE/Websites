"""
Database models for SomaNova
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy
db = SQLAlchemy()


# ============ COLLECTION MODEL ============
class BookCollection(db.Model):
    """Book collection/category model"""
    __tablename__ = 'collections'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    books = db.relationship('Book', backref='collection', lazy=True)
    
    def to_dict(self):
        """Convert collection to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description or '',
            'display_order': self.display_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'book_count': len(self.books)
        }


# ============ BOOK MODEL ============
class Book(db.Model):
    """Book model representing a second-hand book for sale"""
    __tablename__ = 'books'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    collection_id = db.Column(db.Integer, db.ForeignKey('collections.id'))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    condition = db.Column(db.String(50), default='Good')
    isbn = db.Column(db.String(20))
    seller_name = db.Column(db.String(150))
    seller_email = db.Column(db.String(150))
    seller_phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='book', lazy=True, cascade='all, delete-orphan')
    wishlist_items = db.relationship('WishlistItem', backref='book', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert book object to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'price': self.price,
            'category': self.category,
            'collection_id': self.collection_id,
            'collection_name': self.collection.name if self.collection else '',
            'description': self.description or '',
            'image_url': self.image_url or '',
            'condition': self.condition,
            'isbn': self.isbn or '',
            'seller_name': self.seller_name or '',
            'seller_email': self.seller_email or '',
            'seller_phone': self.seller_phone or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


# ============ FEATURED BOOK MODEL ============
class FeaturedBook(db.Model):
    """Featured books to display on homepage"""
    __tablename__ = 'featured_books'
    
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    display_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    book = db.relationship('Book', backref=db.backref('featured', lazy=True))
    
    def to_dict(self):
        """Convert featured book to dictionary"""
        return {
            'id': self.id,
            'book_id': self.book_id,
            'display_order': self.display_order,
            'book': self.book.to_dict() if self.book else None
        }


# ============ CONTACT MODEL ============
class Contact(db.Model):
    """Contact form submissions"""
    __tablename__ = 'contacts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        """Convert contact to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_read': self.is_read
        }


# ============ TRANSACTION MODEL ============
# In the BookTransaction model, add these fields:
class BookTransaction(db.Model):
    """Track book transactions/purchases"""
    __tablename__ = 'book_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=True)  # Changed to nullable
    buyer_name = db.Column(db.String(150), nullable=False)
    buyer_email = db.Column(db.String(150), nullable=False)
    buyer_phone = db.Column(db.String(20))
    transaction_amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), default='cash')
    pickup_location = db.Column(db.String(500))
    pickup_instructions = db.Column(db.Text)
    status = db.Column(db.String(50), default='pending')  # pending, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    book = db.relationship('Book', backref=db.backref('transactions', lazy=True))
    
    def to_dict(self):
        """Convert transaction to dictionary"""
        return {
            'id': self.id,
            'book_id': self.book_id,
            'book_title': self.book.title if self.book else 'Multiple Books',
            'buyer_name': self.buyer_name,
            'buyer_email': self.buyer_email,
            'buyer_phone': self.buyer_phone or '',
            'transaction_amount': self.transaction_amount,
            'payment_method': self.payment_method,
            'pickup_location': self.pickup_location or '',
            'pickup_instructions': self.pickup_instructions or '',
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
# ============ USER MODEL ============
class User(db.Model):
    """User model for cart and wishlist functionality"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False)  # For guest users
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')
    wishlist_items = db.relationship('WishlistItem', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'cart_count': len(self.cart_items),
            'wishlist_count': len(self.wishlist_items)
        }


# ============ CART ITEM MODEL ============
class CartItem(db.Model):
    """Cart items for users"""
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Ensure unique book per user in cart
    __table_args__ = (db.UniqueConstraint('user_id', 'book_id', name='unique_cart_item'),)
    
    def to_dict(self):
        """Convert cart item to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'quantity': self.quantity,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'book': self.book.to_dict() if self.book else None
        }


# ============ WISHLIST ITEM MODEL ============
class WishlistItem(db.Model):
    """Wishlist items for users"""
    __tablename__ = 'wishlist_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Ensure unique book per user in wishlist
    __table_args__ = (db.UniqueConstraint('user_id', 'book_id', name='unique_wishlist_item'),)
    
    def to_dict(self):
        """Convert wishlist item to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_id': self.book_id,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'book': self.book.to_dict() if self.book else None
        }