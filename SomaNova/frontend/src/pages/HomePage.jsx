import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { featuredAPI, collectionAPI, bookAPI, wishlistAPI, userAPI } from '../services/api';
import { getBookImage, handleImageError } from '../utils/imageUtils';
import '../styles/theme.css';

/**
 * Home Page component
 */
const HomePage = () => {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [recentBooks, setRecentBooks] = useState([]);
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalCategories: 0,
        featuredCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [backendStatus, setBackendStatus] = useState('unknown');
    const [searchQuery, setSearchQuery] = useState('');
    const [wishlistStatus, setWishlistStatus] = useState({}); // Track wishlist status for each book
    const [isProcessing, setIsProcessing] = useState(null); // Track which book is being processed

    // Test backend connection first
    useEffect(() => {
        const testBackend = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/test', {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                });
                
                if (response.ok) {
                    setBackendStatus('connected');
                    return true;
                } else {
                    setBackendStatus('failed');
                    return false;
                }
            } catch (err) {
                setBackendStatus('failed');
                return false;
            }
        };

        testBackend();
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch featured books
                const featuredResponse = await featuredAPI.getAll();
                
                if (featuredResponse && featuredResponse.success) {
                    const featuredData = featuredResponse.data || [];
                    
                    const books = featuredData
                        .map(item => item?.book || item)
                        .filter(book => book && book.id)
                        .slice(0, 6); // Limit to 6 featured books
                    
                    setFeaturedBooks(books);
                    setStats(prev => ({ ...prev, featuredCount: books.length }));
                    
                    // Check wishlist status for featured books
                    await checkWishlistStatus(books);
                }

                // Fetch collections
                try {
                    const collectionsResponse = await collectionAPI.getAll();
                    
                    if (collectionsResponse && collectionsResponse.success) {
                        const collections = collectionsResponse.data || [];
                        setCategories(collections.slice(0, 8)); // Limit to 8 categories
                        setStats(prev => ({ ...prev, totalCategories: collections.length }));
                    }
                } catch (collectionsError) {
                    // Use popular categories as fallback
                    const popularCategories = [
                        'Fiction', 'Science Fiction', 'Mystery', 'Romance', 
                        'Biography', 'Self-Help', 'Business', 'Technology'
                    ];
                    setCategories(popularCategories);
                }

                // Fetch recent books
                try {
                    const booksResponse = await bookAPI.getAll();
                    
                    if (booksResponse && booksResponse.success) {
                        const allBooks = booksResponse.data || [];
                        setRecentBooks(allBooks.slice(0, 4)); // Show 4 most recent
                        setStats(prev => ({ ...prev, totalBooks: allBooks.length }));
                    }
                } catch (booksError) {
                    console.log('Could not fetch recent books:', booksError.message);
                }
                
            } catch (err) {
                console.error('Homepage data fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch data if backend is connected
        if (backendStatus === 'connected') {
            fetchData();
        } else if (backendStatus === 'failed') {
            setLoading(false);
        }
    }, [backendStatus]);

    // Check wishlist status for books
    const checkWishlistStatus = async (books) => {
        try {
            const response = await wishlistAPI.getAll();
            if (response.success) {
                const wishlistItems = response.data || [];
                const wishlistStatusMap = {};
                
                books.forEach(book => {
                    const bookId = book.id || book.book?.id;
                    const isInWishlist = wishlistItems.some(item => item.book_id === bookId);
                    wishlistStatusMap[bookId] = isInWishlist;
                });
                
                setWishlistStatus(wishlistStatusMap);
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    };

    // Handle wishlist action
    const handleWishlistClick = async (e, book) => {
        e.preventDefault();
        e.stopPropagation();
        
        const bookId = book.id || book.book?.id;
        if (!bookId || isProcessing === bookId) return;
        
        setIsProcessing(bookId);
        
        try {
            const isInWishlist = wishlistStatus[bookId];
            
            if (isInWishlist) {
                // Find the wishlist item ID to remove
                const wishlistResponse = await wishlistAPI.getAll();
                if (wishlistResponse.success) {
                    const wishlistItem = wishlistResponse.data.find(item => item.book_id === bookId);
                    if (wishlistItem) {
                        await wishlistAPI.remove(wishlistItem.id);
                        setWishlistStatus(prev => ({ ...prev, [bookId]: false }));
                    }
                }
            } else {
                await wishlistAPI.add(bookId);
                setWishlistStatus(prev => ({ ...prev, [bookId]: true }));
            }
            
            // Refresh user info (if wishlist count is tracked)
            await userAPI.getInfo();
        } catch (error) {
            console.error('Wishlist action error:', error);
            alert(`Failed to ${wishlistStatus[bookId] ? 'remove from' : 'add to'} wishlist. Please try again.`);
        } finally {
            setIsProcessing(null);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
        }
    };

    // Format price
    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Format large numbers
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    // Show backend connection error
    if (backendStatus === 'failed') {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h2 style={styles.errorTitle}>Backend Server Not Connected</h2>
                    <p style={styles.errorMessage}>
                        The SomaNova backend server is not reachable. This is required to load books and categories.
                    </p>
                    
                    <div style={styles.troubleshooting}>
                        <h4 style={styles.troubleshootingTitle}>Quick Fix:</h4>
                        <div style={styles.troubleshootingSteps}>
                            <div style={styles.step}>
                                <div style={styles.stepNumber}>1</div>
                                <div>
                                    <strong>Open Terminal</strong>
                                    <p>Navigate to your backend folder</p>
                                </div>
                            </div>
                            <div style={styles.step}>
                                <div style={styles.stepNumber}>2</div>
                                <div>
                                    <strong>Run Flask Server</strong>
                                    <p>Execute: <code>python app.py</code></p>
                                </div>
                            </div>
                            <div style={styles.step}>
                                <div style={styles.stepNumber}>3</div>
                                <div>
                                    <strong>Wait for Server</strong>
                                    <p>Look for: <code>Running on http://0.0.0.0:5000</code></p>
                                </div>
                            </div>
                            <div style={styles.step}>
                                <div style={styles.stepNumber}>4</div>
                                <div>
                                    <strong>Refresh Page</strong>
                                    <p>Come back here and refresh</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={styles.errorActions}>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="btn btn-gold"
                            style={styles.retryButton}
                        >
                            🔄 Retry Connection
                        </button>
                        <a 
                            href="http://localhost:5000" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn"
                            style={styles.checkButton}
                        >
                            Check Backend
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Hero Section */}
            <section className="blue-bg" style={styles.hero}>
                <div className="container" style={styles.heroContainer}>
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={styles.badgeText}>📚 Second-Hand Book Marketplace</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Discover Affordable
                            <span style={styles.highlight}> Pre-Owned Books</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Explore thousands of quality used books at unbeatable prices. 
                            From classic literature to modern bestsellers, find your next great read.
                        </p>
                        
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <div style={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Search for books by title, author, or genre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={styles.searchInput}
                                />
                                <button type="submit" className="btn btn-gold" style={styles.searchButton}>
                                    🔍 Search
                                </button>
                            </div>
                            <div style={styles.searchTags}>
                                <span style={styles.tagLabel}>Popular:</span>
                                {['Harry Potter', 'Stephen King', 'Science Fiction', 'Biography', 'Romance'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setSearchQuery(tag)}
                                        style={styles.tag}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </form>
                        
                        {/* Stats */}
                        {!loading && (
                            <div style={styles.heroStats}>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>{formatNumber(stats.totalBooks)}</span>
                                    <span style={styles.statLabel}>Books Available</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>{stats.featuredCount}</span>
                                    <span style={styles.statLabel}>Featured Today</span>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statNumber}>{stats.totalCategories}+</span>
                                    <span style={styles.statLabel}>Categories</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Books Section */}
            <section className="container mt-5">
                <div style={styles.sectionHeader}>
                    <div>
                        <h2 style={styles.sectionTitle}>Featured Books</h2>
                        <p style={styles.sectionSubtitle}>Handpicked selections from our collection</p>
                    </div>
                    <Link to="/books" style={styles.viewAllLink}>
                        View All Books →
                    </Link>
                </div>

                {loading ? (
                    <div style={styles.loading}>
                        <div className="spinner" style={styles.spinner}></div>
                        <p style={styles.loadingText}>Loading featured books...</p>
                    </div>
                ) : featuredBooks.length > 0 ? (
                    <div style={styles.booksGrid}>
                        {featuredBooks.map(book => {
                            const bookData = book.book || book;
                            const bookId = bookData.id || book.id;
                            const isInWishlist = wishlistStatus[bookId];
                            const isProcessingBook = isProcessing === bookId;
                            
                            return (
                                <div key={bookId} className="home-book-card" style={styles.bookCard}>
                                    <div style={styles.cardBadge}>
                                        <span style={styles.featuredBadge}>⭐ Featured</span>
                                    </div>
                                    
                                    <Link to={`/book/${bookId}`} style={styles.cardLink}>
                                        <div style={styles.imageContainer}>
                                            <img
                                                src={getBookImage(bookData.image_url, bookData.title)}
                                                alt={bookData.title}
                                                style={styles.image}
                                                onError={(e) => handleImageError(e, bookData.title)}
                                            />
                                            <div style={styles.imageOverlay}></div>
                                        </div>
                                        
                                        <div style={styles.bookInfo}>
                                            <h3 style={styles.title}>{bookData.title}</h3>
                                            <p style={styles.author}>by {bookData.author}</p>
                                            
                                            <div style={styles.details}>
                                                <span style={styles.category}>{bookData.category}</span>
                                                <span style={styles.condition}>{bookData.condition || 'Good'}</span>
                                            </div>
                                            
                                            <div style={styles.priceSection}>
                                                <span style={styles.price}>{formatPrice(bookData.price)}</span>
                                                {bookData.isbn && (
                                                    <small style={styles.isbn}>ISBN: {bookData.isbn}</small>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <div style={styles.cardActions}>
                                        <Link 
                                            to={`/book/${bookId}`} 
                                            className="btn"
                                            style={styles.viewButton}
                                        >
                                            View Details
                                        </Link>
                                        <button 
                                            className="btn btn-outline"
                                            style={{
                                                ...styles.wishlistButton,
                                                ...(isInWishlist && styles.wishlistActive)
                                            }}
                                            onClick={(e) => handleWishlistClick(e, bookData)}
                                            disabled={isProcessingBook}
                                        >
                                            {isProcessingBook ? '...' : (isInWishlist ? '❤️ In Wishlist' : '❤️ Wishlist')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📚</div>
                        <h3 style={styles.emptyTitle}>No Featured Books Available</h3>
                        <p style={styles.emptyMessage}>
                            Check back soon for featured book selections, or browse our full collection.
                        </p>
                        <Link to="/books" className="btn btn-gold" style={styles.emptyButton}>
                            Browse All Books
                        </Link>
                    </div>
                )}
            </section>

            {/* Browse Categories */}
            {categories.length > 0 && (
                <section style={styles.categoriesSection}>
                    <div className="container">
                        <div style={styles.sectionHeader}>
                            <div>
                                <h2 style={styles.sectionTitle}>Browse by Category</h2>
                                <p style={styles.sectionSubtitle}>Explore books by genre and interest</p>
                            </div>
                            <Link to="/categories" style={styles.viewAllLink}>
                                All Categories →
                            </Link>
                        </div>

                        <div style={styles.categoriesGrid}>
                            {categories.map((category, index) => {
                                const categoryName = typeof category === 'object' ? category.name : category;
                                const categorySlug = typeof category === 'object' ? category.slug : category.toLowerCase().replace(/\s+/g, '-');
                                const colors = [
                                    '#1e3a8a', // Navy
                                    '#fbbf24', // Gold
                                    '#10b981', // Emerald
                                    '#8b5cf6', // Violet
                                    '#ef4444', // Red
                                    '#0ea5e9', // Sky
                                    '#ec4899', // Pink
                                    '#f59e0b'  // Amber
                                ];
                                
                                return (
                                    <Link 
                                        key={categorySlug} 
                                        to={`/collection/${categorySlug}`}
                                        className="category-card"
                                        style={{
                                            ...styles.categoryCard,
                                            backgroundColor: colors[index % colors.length]
                                        }}
                                    >
                                        <div style={styles.categoryContent}>
                                            <h3 style={styles.categoryTitle}>{categoryName}</h3>
                                            <p style={styles.categoryDescription}>
                                                Explore {categoryName.toLowerCase()} books
                                            </p>
                                            <div style={styles.categoryArrow}>→</div>
                                        </div>
                                        <div style={styles.categoryIcon}>
                                            {['📖', '🔬', '🕵️', '💕', '👤', '🧠', '💼', '💻'][index % 8]}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Recent Arrivals */}
            {recentBooks.length > 0 && (
                <section className="container mt-5">
                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={styles.sectionTitle}>Recent Arrivals</h2>
                            <p style={styles.sectionSubtitle}>Newly added books to our collection</p>
                        </div>
                        <Link to="/books?sort=newest" style={styles.viewAllLink}>
                            View New Arrivals →
                        </Link>
                    </div>

                    <div style={styles.recentBooksGrid}>
                        {recentBooks.map(book => (
                            <div key={book.id} style={styles.recentBookCard}>
                                <Link to={`/book/${book.id}`} style={styles.recentCardLink}>
                                    <img
                                        src={getBookImage(book.image_url, book.title)}
                                        alt={book.title}
                                        style={styles.recentBookImage}
                                        onError={(e) => handleImageError(e, book.title)}
                                    />
                                    <div style={styles.recentBookInfo}>
                                        <h4 style={styles.recentBookTitle}>{book.title}</h4>
                                        <p style={styles.recentBookAuthor}>{book.author}</p>
                                        <span style={styles.recentBookPrice}>{formatPrice(book.price)}</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* How It Works */}
            <section className="blue-bg" style={styles.howItWorks}>
                <div className="container">
                    <div style={styles.sectionHeaderCenter}>
                        <h2 style={styles.whiteTitle}>How SomaNova Works</h2>
                        <p style={styles.whiteSubtitle}>
                            Simple, secure, and sustainable way to buy and sell books
                        </p>
                    </div>
                    
                    <div style={styles.stepsContainer}>
                        <div style={styles.steps}>
                            <div style={styles.howItStep}>
                                <div style={styles.stepIcon}>🔍</div>
                                <h3 style={styles.stepTitle}>Browse & Discover</h3>
                                <p style={styles.stepDescription}>
                                    Explore our vast collection of pre-owned books across all genres and price ranges.
                                </p>
                            </div>
                            <div style={styles.howItStep}>
                                <div style={styles.stepIcon}>💬</div>
                                <h3 style={styles.stepTitle}>Connect with Sellers</h3>
                                <p style={styles.stepDescription}>
                                    Contact sellers directly through our secure messaging system to ask questions.
                                </p>
                            </div>
                            <div style={styles.howItStep}>
                                <div style={styles.stepIcon}>🛒</div>
                                <h3 style={styles.stepTitle}>Secure Purchase</h3>
                                <p style={styles.stepDescription}>
                                    Make safe purchases with our protected transaction system and buyer guarantees.
                                </p>
                            </div>
                            <div style={styles.howItStep}>
                                <div style={styles.stepIcon}>📦</div>
                                <h3 style={styles.stepTitle}>Sell Your Books</h3>
                                <p style={styles.stepDescription}>
                                    List your pre-owned books easily and reach thousands of potential buyers.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={styles.ctaSection}>
                        <h3 style={styles.ctaTitle}>Ready to Find Your Next Read?</h3>
                        <p style={styles.ctaDescription}>
                            Join thousands of readers who've found their favorite books on SomaNova.
                        </p>
                        <div style={styles.ctaButtons}>
                            <Link to="/books" className="btn btn-gold" style={styles.ctaButton}>
                                Start Browsing
                            </Link>
                            <Link to="/sell" className="btn" style={styles.ctaSecondaryButton}>
                                Sell Your Books
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to top */}
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={styles.backToTop}
                className="btn"
            >
                ↑ Back to Top
            </button>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
    },
    
    // Hero Section
    hero: {
        padding: '4rem 0',
        marginBottom: '3rem',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        position: 'relative',
        overflow: 'hidden',
    },
    heroContainer: {
        position: 'relative',
        zIndex: 2,
    },
    heroContent: {
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
    },
    heroBadge: {
        display: 'inline-block',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '0.75rem 1.5rem',
        borderRadius: '50px',
        marginBottom: '1.5rem',
        border: '1px solid rgba(251, 191, 36, 0.3)',
    },
    badgeText: {
        color: '#fbbf24',
        fontWeight: '500',
        fontSize: '0.9rem',
        letterSpacing: '0.5px',
    },
    heroTitle: {
        fontSize: '3.5rem',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '1rem',
        lineHeight: '1.2',
    },
    highlight: {
        color: '#fbbf24',
        display: 'block',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '2.5rem',
        lineHeight: '1.6',
    },
    searchForm: {
        marginBottom: '2.5rem',
    },
    searchContainer: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    searchInput: {
        flex: 1,
        padding: '1rem 1.5rem',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
    },
    searchButton: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    searchTags: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    tagLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.9rem',
    },
    tag: {
        background: 'none',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'rgba(255, 255, 255, 0.9)',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    heroStats: {
        display: 'flex',
        justifyContent: 'center',
        gap: '3rem',
        flexWrap: 'wrap',
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    statItem: {
        textAlign: 'center',
    },
    statNumber: {
        display: 'block',
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#fbbf24',
        marginBottom: '0.25rem',
    },
    statLabel: {
        display: 'block',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    
    // Section Headers
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    sectionHeaderCenter: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    sectionTitle: {
        fontSize: '2.2rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    whiteTitle: {
        fontSize: '2.2rem',
        color: '#ffffff',
        marginBottom: '0.5rem',
    },
    sectionSubtitle: {
        color: '#6b7280',
        fontSize: '1rem',
    },
    whiteSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1rem',
    },
    viewAllLink: {
        color: '#1e3a8a',
        fontWeight: '600',
        fontSize: '1rem',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
    },
    
    // Loading State
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        gap: '1rem',
    },
    spinner: {
        width: '50px',
        height: '50px',
        borderWidth: '4px',
        borderTopColor: '#1e3a8a',
    },
    loadingText: {
        color: '#6b7280',
        fontSize: '1rem',
    },
    
    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
        color: '#1e3a8a',
    },
    emptyTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    emptyMessage: {
        color: '#6b7280',
        fontSize: '1rem',
        marginBottom: '2rem',
        maxWidth: '500px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.6',
    },
    emptyButton: {
        padding: '0.75rem 1.5rem',
    },
    
    // Error State
    errorContainer: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '2rem auto',
    },
    errorIcon: {
        fontSize: '3rem',
        marginBottom: '1.5rem',
        color: '#ef4444',
    },
    errorTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    errorMessage: {
        color: '#6b7280',
        fontSize: '1rem',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    troubleshooting: {
        textAlign: 'left',
        backgroundColor: '#f3f4f6',
        padding: '1.5rem',
        borderRadius: '8px',
        margin: '2rem 0',
    },
    troubleshootingTitle: {
        color: '#1e3a8a',
        fontSize: '1.1rem',
        marginBottom: '1rem',
    },
    troubleshootingSteps: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    step: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    stepNumber: {
        width: '30px',
        height: '30px',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: '600',
        flexShrink: 0,
    },
    errorActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    retryButton: {
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    checkButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    
    // Books Grid
    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
    },
    bookCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
        position: 'relative',
    },
    cardBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 2,
    },
    featuredBadge: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
    },
    imageContainer: {
        height: '250px',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s ease',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.1))',
    },
    bookInfo: {
        padding: '1.5rem',
    },
    title: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '0.5rem',
        lineHeight: '1.3',
        minHeight: '3.2rem',
    },
    author: {
        color: '#6b7280',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        fontStyle: 'italic',
    },
    details: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e5e7eb',
    },
    category: {
        backgroundColor: '#f0f9ff',
        color: '#1e3a8a',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    condition: {
        color: '#6b7280',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    priceSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#1e3a8a',
    },
    isbn: {
        color: '#9ca3af',
        fontSize: '0.8rem',
    },
    cardActions: {
        padding: '0 1.5rem 1.5rem',
        display: 'flex',
        gap: '0.75rem',
    },
    viewButton: {
        flex: 1,
        padding: '0.75rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textAlign: 'center',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },
    wishlistButton: {
        flex: 1,
        padding: '0.75rem',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    wishlistActive: {
        borderColor: '#ef4444',
        color: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    
    // Categories Section
    categoriesSection: {
        padding: '4rem 0',
        backgroundColor: '#f9fafb',
        margin: '3rem 0',
    },
    categoriesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    categoryCard: {
        borderRadius: '12px',
        padding: '1.5rem',
        textDecoration: 'none',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '140px',
        display: 'flex',
        alignItems: 'center',
    },
    categoryContent: {
        flex: 1,
        zIndex: 2,
        position: 'relative',
    },
    categoryTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#ffffff',
    },
    categoryDescription: {
        fontSize: '0.9rem',
        opacity: 0.9,
        marginBottom: '1rem',
    },
    categoryArrow: {
        fontSize: '1.2rem',
        opacity: 0.8,
    },
    categoryIcon: {
        fontSize: '3rem',
        opacity: 0.2,
        position: 'absolute',
        right: '1rem',
        bottom: '1rem',
    },
    
    // Recent Books
    recentBooksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1.5rem',
    },
    recentBookCard: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s ease',
    },
    recentCardLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    recentBookImage: {
        width: '100%',
        height: '220px',
        objectFit: 'cover',
        borderRadius: '6px',
    },
    recentBookInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    recentBookTitle: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: '1.3',
        height: '2.6rem',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    recentBookAuthor: {
        color: '#6b7280',
        fontSize: '0.85rem',
    },
    recentBookPrice: {
        color: '#1e3a8a',
        fontWeight: '600',
        fontSize: '1rem',
    },
    
    // How It Works
    howItWorks: {
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        marginTop: '3rem',
    },
    stepsContainer: {
        marginBottom: '3rem',
    },
    steps: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
    },
    howItStep: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    stepIcon: {
        fontSize: '2.5rem',
        marginBottom: '1.5rem',
    },
    stepTitle: {
        fontSize: '1.2rem',
        color: '#ffffff',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    stepDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.95rem',
        lineHeight: '1.5',
    },
    ctaSection: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    ctaTitle: {
        fontSize: '1.8rem',
        color: '#ffffff',
        marginBottom: '1rem',
    },
    ctaDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1rem',
        marginBottom: '2rem',
    },
    ctaButtons: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    ctaButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
    },
    ctaSecondaryButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: 'transparent',
        border: '2px solid #ffffff',
        color: '#ffffff',
    },
    
    // Back to Top
    backToTop: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .home-book-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border-color: #1e3a8a;
    }
    
    .home-book-card:hover .image {
        transform: scale(1.1);
    }
    
    .view-button:hover {
        background-color: #1d4ed8 !important;
    }
    
    .wishlist-button:hover {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        background-color: #fef2f2 !important;
    }
    
    .category-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    
    .recent-book-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        border-color: #1e3a8a;
    }
    
    .search-input:focus {
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3) !important;
        outline: none;
    }
    
    .tag:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.5);
    }
    
    .view-all-link:hover {
        color: #fbbf24 !important;
    }
    
    .search-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .retry-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .check-button:hover {
        background-color: #1d4ed8 !important;
    }
    
    .cta-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .cta-secondary-button:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-2px);
    }
    
    .back-to-top:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4);
    }
    
    .step:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
    }
    
    .how-it-step:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
    }
`;
document.head.appendChild(styleSheet);

export default HomePage;