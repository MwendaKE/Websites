"""
Seed database with sample data including collections
"""
from app import app
from models import db, BookCollection, Book, FeaturedBook, User
from datetime import datetime
import random

def create_collections():
    """Create book collections"""
    collections = [
        {
            'name': 'Fiction',
            'slug': 'fiction',
            'description': 'Explore imaginary worlds, characters, and stories in our fiction collection.',
            'display_order': 1
        },
        {
            'name': 'Science Fiction & Fantasy',
            'slug': 'science-fiction-fantasy',
            'description': 'Journey to other worlds, galaxies, and magical realms.',
            'display_order': 2
        },
        {
            'name': 'Mystery & Thriller',
            'slug': 'mystery-thriller',
            'description': 'Suspenseful stories that will keep you on the edge of your seat.',
            'display_order': 3
        },
        {
            'name': 'Romance',
            'slug': 'romance',
            'description': 'Heartwarming stories of love, relationships, and emotional connections.',
            'display_order': 4
        },
        {
            'name': 'Biography & Memoir',
            'slug': 'biography-memoir',
            'description': 'Real stories of remarkable lives and personal journeys.',
            'display_order': 5
        },
        {
            'name': 'Self-Help & Personal Development',
            'slug': 'self-help',
            'description': 'Books to help you grow, learn, and improve your life.',
            'display_order': 6
        }
    ]
    
    created_collections = []
    for coll_data in collections:
        collection = BookCollection(
            name=coll_data['name'],
            slug=coll_data['slug'],
            description=coll_data['description'],
            display_order=coll_data['display_order']
        )
        db.session.add(collection)
        created_collections.append(collection)
    
    db.session.commit()
    print(f"✅ Created {len(created_collections)} collections")
    return created_collections


def create_books_for_collection(collection, count=8):
    """Create sample books for a collection"""
    books_data = {
        'Fiction': [
            {'title': 'The Great Gatsby', 'author': 'F. Scott Fitzgerald', 'price': 8.99, 'condition': 'Good'},
            {'title': 'To Kill a Mockingbird', 'author': 'Harper Lee', 'price': 7.50, 'condition': 'Excellent'},
            {'title': 'Pride and Prejudice', 'author': 'Jane Austen', 'price': 6.99, 'condition': 'Good'},
            {'title': 'The Catcher in the Rye', 'author': 'J.D. Salinger', 'price': 9.25, 'condition': 'Fair'},
            {'title': 'The Alchemist', 'author': 'Paulo Coelho', 'price': 10.50, 'condition': 'Like New'},
            {'title': 'Little Women', 'author': 'Louisa May Alcott', 'price': 7.99, 'condition': 'Good'},
            {'title': 'The Kite Runner', 'author': 'Khaled Hosseini', 'price': 11.25, 'condition': 'Excellent'},
            {'title': 'The Book Thief', 'author': 'Markus Zusak', 'price': 9.75, 'condition': 'Good'},
        ],
        'Science Fiction & Fantasy': [
            {'title': 'Dune', 'author': 'Frank Herbert', 'price': 11.99, 'condition': 'Good'},
            {'title': '1984', 'author': 'George Orwell', 'price': 9.25, 'condition': 'Good'},
            {'title': 'The Hobbit', 'author': 'J.R.R. Tolkien', 'price': 10.75, 'condition': 'Fair'},
            {'title': 'Foundation', 'author': 'Isaac Asimov', 'price': 8.50, 'condition': 'Good'},
            {'title': 'Ender\'s Game', 'author': 'Orson Scott Card', 'price': 9.99, 'condition': 'Excellent'},
            {'title': 'The Martian', 'author': 'Andy Weir', 'price': 12.50, 'condition': 'Like New'},
            {'title': 'Neuromancer', 'author': 'William Gibson', 'price': 10.25, 'condition': 'Good'},
            {'title': 'Snow Crash', 'author': 'Neal Stephenson', 'price': 11.75, 'condition': 'Good'},
        ],
        'Mystery & Thriller': [
            {'title': 'The Girl with the Dragon Tattoo', 'author': 'Stieg Larsson', 'price': 10.99, 'condition': 'Good'},
            {'title': 'Gone Girl', 'author': 'Gillian Flynn', 'price': 9.75, 'condition': 'Excellent'},
            {'title': 'The Da Vinci Code', 'author': 'Dan Brown', 'price': 8.50, 'condition': 'Good'},
            {'title': 'The Silent Patient', 'author': 'Alex Michaelides', 'price': 11.25, 'condition': 'Like New'},
            {'title': 'Big Little Lies', 'author': 'Liane Moriarty', 'price': 9.99, 'condition': 'Good'},
            {'title': 'The Woman in the Window', 'author': 'A.J. Finn', 'price': 10.50, 'condition': 'Good'},
            {'title': 'Sharp Objects', 'author': 'Gillian Flynn', 'price': 8.75, 'condition': 'Fair'},
            {'title': 'The Couple Next Door', 'author': 'Shari Lapena', 'price': 9.25, 'condition': 'Good'},
        ],
        'Romance': [
            {'title': 'The Notebook', 'author': 'Nicholas Sparks', 'price': 7.99, 'condition': 'Good'},
            {'title': 'Pride and Prejudice', 'author': 'Jane Austen', 'price': 6.99, 'condition': 'Good'},
            {'title': 'Outlander', 'author': 'Diana Gabaldon', 'price': 12.50, 'condition': 'Excellent'},
            {'title': 'Me Before You', 'author': 'Jojo Moyes', 'price': 9.75, 'condition': 'Good'},
            {'title': 'The Hating Game', 'author': 'Sally Thorne', 'price': 10.25, 'condition': 'Like New'},
            {'title': 'Red, White & Royal Blue', 'author': 'Casey McQuiston', 'price': 11.99, 'condition': 'Excellent'},
            {'title': 'Bridgerton: The Duke and I', 'author': 'Julia Quinn', 'price': 9.50, 'condition': 'Good'},
            {'title': 'The Love Hypothesis', 'author': 'Ali Hazelwood', 'price': 10.75, 'condition': 'Like New'},
        ],
        'Biography & Memoir': [
            {'title': 'The Diary of a Young Girl', 'author': 'Anne Frank', 'price': 8.25, 'condition': 'Good'},
            {'title': 'Becoming', 'author': 'Michelle Obama', 'price': 14.99, 'condition': 'Excellent'},
            {'title': 'Educated', 'author': 'Tara Westover', 'price': 12.75, 'condition': 'Good'},
            {'title': 'Born a Crime', 'author': 'Trevor Noah', 'price': 11.50, 'condition': 'Like New'},
            {'title': 'I Know Why the Caged Bird Sings', 'author': 'Maya Angelou', 'price': 9.25, 'condition': 'Good'},
            {'title': 'The Glass Castle', 'author': 'Jeannette Walls', 'price': 10.99, 'condition': 'Excellent'},
            {'title': 'Steve Jobs', 'author': 'Walter Isaacson', 'price': 13.50, 'condition': 'Good'},
            {'title': 'Into the Wild', 'author': 'Jon Krakauer', 'price': 9.75, 'condition': 'Good'},
        ],
        'Self-Help & Personal Development': [
            {'title': 'Atomic Habits', 'author': 'James Clear', 'price': 12.99, 'condition': 'Like New'},
            {'title': 'The 7 Habits of Highly Effective People', 'author': 'Stephen R. Covey', 'price': 11.50, 'condition': 'Good'},
            {'title': 'How to Win Friends and Influence People', 'author': 'Dale Carnegie', 'price': 8.99, 'condition': 'Good'},
            {'title': 'The Power of Now', 'author': 'Eckhart Tolle', 'price': 10.75, 'condition': 'Excellent'},
            {'title': 'Mindset: The New Psychology of Success', 'author': 'Carol S. Dweck', 'price': 11.25, 'condition': 'Good'},
            {'title': 'The Subtle Art of Not Giving a F*ck', 'author': 'Mark Manson', 'price': 13.50, 'condition': 'Like New'},
            {'title': 'Thinking, Fast and Slow', 'author': 'Daniel Kahneman', 'price': 14.25, 'condition': 'Good'},
            {'title': 'Deep Work', 'author': 'Cal Newport', 'price': 12.75, 'condition': 'Excellent'},
        ]
    }
    
    books_list = books_data.get(collection.name, [])
    if not books_list:
        books_list = books_data['Fiction']
    
    books = []
    seller_names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Sarah Williams', 'Mike Brown', 'Lisa Taylor', 'David Wilson', 'Emily Clark']
    seller_emails = ['john@example.com', 'jane@example.com', 'robert@example.com', 'sarah@example.com', 'mike@example.com', 'lisa@example.com', 'david@example.com', 'emily@example.com']
    
    for i, book_data in enumerate(books_list[:count]):
        seller_idx = i % len(seller_names)
        
        book = Book(
            title=book_data['title'],
            author=book_data['author'],
            price=book_data['price'],
            category=collection.name,
            collection_id=collection.id,
            description=f"A {book_data['condition'].lower()} condition copy of {book_data['title']} by {book_data['author']}. Perfect for readers looking for affordable pre-owned books.",
            condition=book_data['condition'],
            seller_name=seller_names[seller_idx],
            seller_email=seller_emails[seller_idx],
            seller_phone=f"555-010{seller_idx + 1}"
        )
        
        db.session.add(book)
        books.append(book)
    
    return books


def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("✅ Database tables created")
        
        # Create collections
        collections = create_collections()
        
        # Create books for each collection
        all_books = []
        for collection in collections:
            books = create_books_for_collection(collection, count=8)
            all_books.extend(books)
            print(f"✅ Added {len(books)} books to {collection.name} collection")
        
        db.session.commit()
        print(f"✅ Added total of {len(all_books)} books")
        
        # Mark some books as featured (2 from each collection)
        featured_books = []
        display_order = 1
        for collection in collections:
            collection_books = [b for b in all_books if b.collection_id == collection.id]
            if len(collection_books) >= 2:
                for book in collection_books[:2]:
                    featured = FeaturedBook(book_id=book.id, display_order=display_order)
                    db.session.add(featured)
                    featured_books.append(featured)
                    display_order += 1
        
        db.session.commit()
        print(f"✅ Added {len(featured_books)} featured books")
        
        # Create a test user for cart/wishlist
        test_user = User(session_id="test-session-123")
        db.session.add(test_user)
        db.session.commit()
        print("✅ Created test user")
        
        print("🎉 Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()