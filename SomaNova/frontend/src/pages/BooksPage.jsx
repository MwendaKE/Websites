import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI, wishlistAPI, userAPI } from '../services/api';
import { getBookImage, handleImageError } from '../utils/imageUtils';
import '../styles/theme.css';

/**
 * Books Page - Display all books with professional styling
 */
const BooksPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        totalBooks: 0,
        averagePrice: 0,
        lowestPrice: 0,
        highestPrice: 0,
        conditionStats: {}
    });
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [isProcessing, setIsProcessing] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [books]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await bookAPI.getAll();
            
            if (response.success) {
                const booksData = response.data || [];
                setBooks(booksData);
                setError('');
                calculateStats(booksData);
                await checkWishlistStatus(booksData);
            } else {
                setError('Failed to load books');
            }
        } catch (err) {
            setError('Error loading books. Please try again.');
            console.error('Books fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = () => {
        const uniqueCategories = [...new Set(books.map(book => book.category))];
        setCategories(uniqueCategories.sort());
    };

    // Check wishlist status for books
    const checkWishlistStatus = async (booksList) => {
        try {
            const response = await wishlistAPI.getAll();
            if (response.success) {
                const wishlistItems = response.data || [];
                const wishlistStatusMap = {};
                
                booksList.forEach(book => {
                    const bookId = book.id;
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
        
        const bookId = book.id;
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

    const calculateStats = (booksList = books) => {
        if (booksList.length === 0) {
            setStats({
                totalBooks: 0,
                averagePrice: 0,
                lowestPrice: 0,
                highestPrice: 0,
                conditionStats: {}
            });
            return;
        }

        const prices = booksList.map(book => book.price || 0).filter(price => price > 0);
        const averagePrice = prices.length > 0 
            ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
            : 0;
        
        const lowestPrice = Math.min(...prices);
        const highestPrice = Math.max(...prices);

        const conditionStats = {};
        booksList.forEach(book => {
            const condition = book.condition || 'Unknown';
            conditionStats[condition] = (conditionStats[condition] || 0) + 1;
        });

        setStats({
            totalBooks: booksList.length,
            averagePrice,
            lowestPrice,
            highestPrice,
            conditionStats
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('');
        setSortBy('newest');
        fetchBooks();
    };

    const getFilteredBooks = () => {
        let filtered = [...books];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query) ||
                (book.description && book.description.toLowerCase().includes(query)) ||
                (book.isbn && book.isbn.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter(book => book.category === categoryFilter);
        }

        // Apply sorting
        switch (sortBy) {
            case 'price_low':
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price_high':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'title_asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title_desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                break;
        }

        return filtered;
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getConditionColor = (condition) => {
        const colors = {
            'New': '#10b981',
            'Like New': '#84cc16',
            'Very Good': '#f59e0b',
            'Good': '#fbbf24',
            'Fair': '#f97316',
            'Poor': '#ef4444',
            'Unknown': '#6b7280'
        };
        return colors[condition] || colors['Unknown'];
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading Books Collection</p>
                    <p style={styles.loadingSubtext}>Fetching books from our library...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h3 style={styles.errorTitle}>Error Loading Books</h3>
                    <p style={styles.errorMessage}>{error}</p>
                    <div style={styles.errorActions}>
                        <button 
                            onClick={fetchBooks} 
                            className="btn btn-gold"
                            style={styles.retryButton}
                        >
                            🔄 Retry
                        </button>
                        <Link to="/" className="btn" style={styles.secondaryButton}>
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const filteredBooks = getFilteredBooks();

    return (
        <div style={styles.page}>
            {/* Hero Section */}
            <section className="blue-bg" style={styles.hero}>
                <div className="container">
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={styles.badgeText}>📚 Complete Collection</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Browse Our
                            <span style={styles.highlight}> Book Collection</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Discover thousands of pre-owned books across all genres. 
                            From timeless classics to modern bestsellers, find your next great read.
                        </p>
                        
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <div style={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Search books by title, author, ISBN, or description..."
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
                                {['Harry Potter', 'Stephen King', 'The Great Gatsby', '1984', 'Self-Help'].map(tag => (
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
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container mt-5">
                <div style={styles.statsGrid}>
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>📚</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats.totalBooks)}</h3>
                            <p style={styles.statLabel}>Total Books</p>
                        </div>
                    </div>
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>💰</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatPrice(stats.averagePrice)}</h3>
                            <p style={styles.statLabel}>Average Price</p>
                        </div>
                    </div>
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>⬇️</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatPrice(stats.lowestPrice)}</h3>
                            <p style={styles.statLabel}>Lowest Price</p>
                        </div>
                    </div>
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>⬆️</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatPrice(stats.highestPrice)}</h3>
                            <p style={styles.statLabel}>Highest Price</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="container mt-5">
                <div style={styles.filtersCard}>
                    <div style={styles.filtersHeader}>
                        <h3 style={styles.filtersTitle}>Filter & Sort</h3>
                        <div style={styles.resultsCount}>
                            Showing {filteredBooks.length} of {formatNumber(books.length)} books
                        </div>
                    </div>
                    
                    <div style={styles.filtersGrid}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Search</label>
                            <input
                                type="text"
                                placeholder="Type to search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.filterInput}
                            />
                        </div>
                        
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="title_asc">Title: A to Z</option>
                                <option value="title_desc">Title: Z to A</option>
                            </select>
                        </div>
                        
                        <div style={styles.filterActions}>
                            <button 
                                type="button" 
                                onClick={handleSearch}
                                className="btn btn-gold"
                                style={styles.applyButton}
                            >
                                Apply Filters
                            </button>
                            <button 
                                type="button" 
                                onClick={handleResetFilters}
                                className="btn btn-outline"
                                style={styles.resetButton}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Books Grid */}
            <section className="container mt-5">
                {filteredBooks.length > 0 ? (
                    <div style={styles.booksGrid}>
                        {filteredBooks.map(book => {
                            const bookId = book.id;
                            const isInWishlist = wishlistStatus[bookId];
                            const isProcessingBook = isProcessing === bookId;
                            
                            return (
                                <div key={bookId} className="book-card" style={styles.bookCard}>
                                    <Link to={`/book/${bookId}`} style={styles.cardLink}>
                                        <div style={styles.imageContainer}>
                                            <img
                                                src={getBookImage(book.image_url, book.title)}
                                                alt={book.title}
                                                style={styles.image}
                                                onError={(e) => handleImageError(e, book.title)}
                                            />
                                            <div style={styles.imageOverlay}></div>
                                            <div style={styles.cardBadge}>
                                                <span style={{
                                                    ...styles.conditionBadge,
                                                    backgroundColor: getConditionColor(book.condition)
                                                }}>
                                                    {book.condition || 'Good'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.bookInfo}>
                                            <h3 style={styles.title}>{book.title}</h3>
                                            <p style={styles.author}>by {book.author}</p>
                                            
                                            <div style={styles.details}>
                                                <span style={styles.category}>{book.category}</span>
                                                <span style={styles.price}>{formatPrice(book.price)}</span>
                                            </div>
                                            
                                            {book.description && (
                                                <p style={styles.description}>
                                                    {book.description.length > 100 
                                                        ? `${book.description.substring(0, 100)}...` 
                                                        : book.description}
                                                </p>
                                            )}
                                            
                                            <div style={styles.bookMeta}>
                                                {book.isbn && (
                                                    <small style={styles.isbn}>ISBN: {book.isbn}</small>
                                                )}
                                                <small style={styles.date}>
                                                    Added: {new Date(book.created_at).toLocaleDateString()}
                                                </small>
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
                                            onClick={(e) => handleWishlistClick(e, book)}
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
                        <h3 style={styles.emptyTitle}>No Books Found</h3>
                        <p style={styles.emptyMessage}>
                            {searchQuery || categoryFilter 
                                ? 'No books match your current filters. Try adjusting your search criteria.'
                                : 'No books available at the moment. Check back soon!'}
                        </p>
                        <div style={styles.emptyActions}>
                            <button 
                                onClick={handleResetFilters}
                                className="btn btn-gold"
                                style={styles.emptyButton}
                            >
                                Clear Filters
                            </button>
                            <Link to="/sell" className="btn" style={styles.emptySecondaryButton}>
                                Sell Your Books
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            {/* Condition Guide */}
            <section style={styles.guideSection}>
                <div className="container">
                    <h2 style={styles.guideTitle}>Book Condition Guide</h2>
                    <p style={styles.guideSubtitle}>Understanding our book quality ratings</p>
                    
                    <div style={styles.conditionsGrid}>
                        <div style={styles.conditionItem}>
                            <div style={{...styles.conditionDot, backgroundColor: getConditionColor('New')}}></div>
                            <div>
                                <h4 style={styles.conditionName}>New</h4>
                                <p style={styles.conditionDescription}>Brand new, never read, perfect condition</p>
                            </div>
                        </div>
                        <div style={styles.conditionItem}>
                            <div style={{...styles.conditionDot, backgroundColor: getConditionColor('Like New')}}></div>
                            <div>
                                <h4 style={styles.conditionName}>Like New</h4>
                                <p style={styles.conditionDescription}>Almost new, minor wear possible</p>
                            </div>
                        </div>
                        <div style={styles.conditionItem}>
                            <div style={{...styles.conditionDot, backgroundColor: getConditionColor('Very Good')}}></div>
                            <div>
                                <h4 style={styles.conditionName}>Very Good</h4>
                                <p style={styles.conditionDescription}>Light wear, no major damage</p>
                            </div>
                        </div>
                        <div style={styles.conditionItem}>
                            <div style={{...styles.conditionDot, backgroundColor: getConditionColor('Good')}}></div>
                            <div>
                                <h4 style={styles.conditionName}>Good</h4>
                                <p style={styles.conditionDescription}>Moderate wear, readable condition</p>
                            </div>
                        </div>
                        <div style={styles.conditionItem}>
                            <div style={{...styles.conditionDot, backgroundColor: getConditionColor('Fair')}}></div>
                            <div>
                                <h4 style={styles.conditionName}>Fair</h4>
                                <p style={styles.conditionDescription}>Significant wear, still readable</p>
                            </div>
                        </div>
                        <div style={styles.conditionItem}>
                            <div style={{...styles.conditionDot, backgroundColor: getConditionColor('Poor')}}></div>
                            <div>
                                <h4 style={styles.conditionName}>Poor</h4>
                                <p style={styles.conditionDescription}>Heavy wear, may have damage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="blue-bg" style={styles.ctaSection}>
                <div className="container">
                    <div style={styles.ctaContent}>
                        <h2 style={styles.ctaTitle}>Can't Find Your Book?</h2>
                        <p style={styles.ctaText}>
                            New books are added daily! Check back regularly or consider listing your own books.
                            Join our community of readers and sellers.
                        </p>
                        <div style={styles.ctaButtons}>
                            <Link to="/sell" className="btn btn-gold" style={styles.ctaButton}>
                                Sell Your Books
                            </Link>
                            <button 
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="btn"
                                style={styles.secondaryCtaButton}
                            >
                                Back to Top
                            </button>
                        </div>
                    </div>
                </div>
            </section>
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
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        position: 'relative',
        overflow: 'hidden',
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
        fontSize: '3rem',
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
        marginBottom: '1rem',
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
    
    // Stats Section
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
    },
    statIcon: {
        fontSize: '2.5rem',
        width: '70px',
        height: '70px',
        backgroundColor: '#f0f9ff',
        color: '#1e3a8a',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    statContent: {
        flex: 1,
    },
    statNumber: {
        fontSize: '2rem',
        color: '#1e3a8a',
        marginBottom: '0.25rem',
        fontWeight: '700',
    },
    statLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    
    // Filters Section
    filtersCard: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
    },
    filtersHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    filtersTitle: {
        fontSize: '1.3rem',
        color: '#1e3a8a',
        margin: 0,
    },
    resultsCount: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
        backgroundColor: '#f3f4f6',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
    },
    filtersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    filterLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    filterInput: {
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    filterSelect: {
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    filterActions: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1rem',
    },
    applyButton: {
        padding: '0.75rem 1.5rem',
        fontWeight: '500',
    },
    resetButton: {
        padding: '0.75rem 1.5rem',
    },
    
    // Books Grid
    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    bookCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
    },
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
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
    cardBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 2,
    },
    conditionBadge: {
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    bookInfo: {
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
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
    price: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#1e3a8a',
    },
    description: {
        color: '#6b7280',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        marginBottom: '1rem',
        flex: 1,
    },
    bookMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
    },
    isbn: {
        color: '#9ca3af',
        fontSize: '0.8rem',
    },
    date: {
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
    
    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '3rem',
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
    emptyActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    emptyButton: {
        padding: '0.75rem 1.5rem',
    },
    emptySecondaryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textDecoration: 'none',
    },
    
    // Loading State
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem',
        gap: '1.5rem',
        minHeight: '50vh',
    },
    spinner: {
        width: '60px',
        height: '60px',
        borderWidth: '5px',
        borderTopColor: '#1e3a8a',
    },
    loadingText: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        fontWeight: '500',
    },
    loadingSubtext: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    
    // Error State
    errorContainer: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#fee2e2',
        borderRadius: '12px',
        color: '#991b1b',
        margin: '2rem 0',
    },
    errorIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    errorTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#991b1b',
    },
    errorMessage: {
        fontSize: '1rem',
        marginBottom: '2rem',
        lineHeight: '1.5',
    },
    errorActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    retryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#fbbf24',
        color: '#000',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    secondaryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },
    
    // Guide Section
    guideSection: {
        padding: '4rem 0',
        backgroundColor: '#f9fafb',
        margin: '3rem 0',
    },
    guideTitle: {
        fontSize: '2rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        textAlign: 'center',
    },
    guideSubtitle: {
        color: '#6b7280',
        fontSize: '1rem',
        marginBottom: '3rem',
        textAlign: 'center',
    },
    conditionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        maxWidth: '800px',
        margin: '0 auto',
    },
    conditionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
    },
    conditionDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    conditionName: {
        fontSize: '1rem',
        color: '#1f2937',
        marginBottom: '0.25rem',
        fontWeight: '600',
    },
    conditionDescription: {
        color: '#6b7280',
        fontSize: '0.85rem',
        lineHeight: '1.4',
    },
    
    // CTA Section
    ctaSection: {
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        marginTop: '2rem',
    },
    ctaContent: {
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
    },
    ctaTitle: {
        fontSize: '2.5rem',
        color: '#ffffff',
        marginBottom: '1rem',
    },
    ctaText: {
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '2rem',
        lineHeight: '1.6',
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
    secondaryCtaButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: 'transparent',
        border: '2px solid #ffffff',
        color: '#ffffff',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .book-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border-color: #1e3a8a;
    }
    
    .book-card:hover .image {
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
    
    .search-input:focus {
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3) !important;
        outline: none;
    }
    
    .tag:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.5);
    }
    
    .search-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .apply-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .reset-button:hover {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
    }
    
    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .condition-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .cta-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .secondary-cta-button:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-2px);
    }
    
    .retry-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .secondary-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .empty-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .empty-secondary-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .filter-input:focus, .filter-select:focus {
        border-color: #1e3a8a !important;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1) !important;
        outline: none;
    }
`;
document.head.appendChild(styleSheet);

export default BooksPage;