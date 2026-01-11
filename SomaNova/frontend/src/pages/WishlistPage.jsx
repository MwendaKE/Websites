import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI, cartAPI } from '../services/api';
import { getBookImage, handleImageError } from '../utils/imageUtils';
import '../styles/theme.css';

/**
 * Wishlist Page - Professional wishlist management for SomaNova
 */
const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalValue: 0,
        categories: {},
        mostExpensive: null,
        recentlyAdded: null
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [sortBy, setSortBy] = useState('recent');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchWishlistItems();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [wishlistItems]);

    const fetchWishlistItems = async () => {
        try {
            setLoading(true);
            const response = await wishlistAPI.getAll();
            
            if (response.success) {
                const items = response.data || [];
                const sortedItems = sortItems(items, sortBy);
                setWishlistItems(sortedItems);
                setError('');
            } else {
                setError('Unable to load wishlist items. Please try again.');
            }
        } catch (err) {
            console.error('Wishlist fetch error:', err);
            setError('Error loading wishlist. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const sortItems = (items, sortType) => {
        const sorted = [...items];
        
        switch (sortType) {
            case 'recent':
                sorted.sort((a, b) => new Date(b.added_at || b.created_at) - new Date(a.added_at || a.created_at));
                break;
            case 'price_low':
                sorted.sort((a, b) => getBookPrice(a) - getBookPrice(b));
                break;
            case 'price_high':
                sorted.sort((a, b) => getBookPrice(b) - getBookPrice(a));
                break;
            case 'title':
                sorted.sort((a, b) => getBookTitle(a).localeCompare(getBookTitle(b)));
                break;
            default:
                break;
        }
        
        return sorted;
    };

    const calculateStats = () => {
        if (wishlistItems.length === 0) {
            setStats({
                totalValue: 0,
                categories: {},
                mostExpensive: null,
                recentlyAdded: null
            });
            return;
        }

        let totalValue = 0;
        const categories = {};
        let mostExpensive = null;
        let recentlyAdded = null;

        wishlistItems.forEach(item => {
            const price = getBookPrice(item);
            totalValue += price;
            
            const category = getBookCategory(item);
            categories[category] = (categories[category] || 0) + 1;
            
            // Find most expensive
            if (!mostExpensive || price > getBookPrice(mostExpensive)) {
                mostExpensive = item;
            }
            
            // Find most recently added
            if (!recentlyAdded || new Date(item.added_at) > new Date(recentlyAdded.added_at)) {
                recentlyAdded = item;
            }
        });

        setStats({
            totalValue,
            categories,
            mostExpensive,
            recentlyAdded
        });
    };

    const getBookData = (item) => {
        return item.book || item;
    };

    const getBookTitle = (item) => {
        const book = getBookData(item);
        return book.title || 'Unknown Book';
    };

    const getBookAuthor = (item) => {
        const book = getBookData(item);
        return book.author || 'Unknown Author';
    };

    const getBookPrice = (item) => {
        const book = getBookData(item);
        return parseFloat(book.price) || 0;
    };

    const getBookCategory = (item) => {
        const book = getBookData(item);
        return book.category || 'Uncategorized';
    };

    const getBookCondition = (item) => {
        const book = getBookData(item);
        return book.condition || 'Not specified';
    };

    const getBookId = (item) => {
        const book = getBookData(item);
        return book.id || item.book_id;
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

    const handleRemoveItem = async (itemId) => {
        try {
            await wishlistAPI.remove(itemId);
            const updatedItems = wishlistItems.filter(item => item.id !== itemId);
            setWishlistItems(updatedItems);
            setSelectedItems(selectedItems.filter(id => id !== itemId));
            setSuccessMessage('Book removed from wishlist');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error removing item:', error);
            setError('Failed to remove item. Please try again.');
        }
    };

    const handleAddToCart = async (bookId) => {
        try {
            await cartAPI.add(bookId, 1);
            setSuccessMessage('Book added to cart successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setError('Failed to add book to cart. Please try again.');
        }
    };

    const handleAddAllToCart = async () => {
        try {
            for (const item of wishlistItems) {
                await cartAPI.add(getBookId(item), 1);
            }
            setSuccessMessage(`${wishlistItems.length} books added to cart!`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error adding all to cart:', error);
            setError('Failed to add some books to cart. Please try again.');
        }
    };

    const handleClearWishlist = async () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist? This action cannot be undone.')) {
            try {
                await wishlistAPI.clear();
                setWishlistItems([]);
                setSelectedItems([]);
                setSuccessMessage('Wishlist cleared successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Error clearing wishlist:', error);
                setError('Failed to clear wishlist. Please try again.');
            }
        }
    };

    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === wishlistItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(wishlistItems.map(item => item.id));
        }
    };

    const handleRemoveSelected = async () => {
        if (selectedItems.length === 0) return;
        
        if (window.confirm(`Remove ${selectedItems.length} selected item${selectedItems.length > 1 ? 's' : ''} from wishlist?`)) {
            try {
                for (const itemId of selectedItems) {
                    await wishlistAPI.remove(itemId);
                }
                const updatedItems = wishlistItems.filter(item => !selectedItems.includes(item.id));
                setWishlistItems(updatedItems);
                setSelectedItems([]);
                setSuccessMessage(`${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} removed`);
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Error removing selected items:', error);
                setError('Failed to remove selected items. Please try again.');
            }
        }
    };

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        const sorted = sortItems(wishlistItems, newSort);
        setWishlistItems(sorted);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Fiction': '#1e3a8a',
            'Science Fiction': '#0ea5e9',
            'Fantasy': '#8b5cf6',
            'Mystery': '#ef4444',
            'Romance': '#ec4899',
            'Biography': '#10b981',
            'Self-Help': '#f59e0b',
            'Business': '#6366f1',
            'Technology': '#06b6d4'
        };
        return colors[category] || '#6b7280';
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading your wishlist...</p>
                    <p style={styles.loadingSubtext}>Gathering your favorite books</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h3 style={styles.errorTitle}>Error Loading Wishlist</h3>
                    <p style={styles.errorMessage}>{error}</p>
                    <div style={styles.errorActions}>
                        <button 
                            onClick={fetchWishlistItems} 
                            className="btn btn-gold"
                            style={styles.retryButton}
                        >
                            🔄 Retry
                        </button>
                        <Link to="/books" className="btn" style={styles.browseButton}>
                            Browse Books
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Hero Section */}
            <section className="blue-bg" style={styles.hero}>
                <div className="container">
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={styles.badgeText}>❤️ Your Reading Journey</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            My Wishlist
                            <span style={styles.highlight}> Save & Discover</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Keep track of books you love and want to read. Your personal reading list, 
                            always ready for when you're ready to buy.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            {wishlistItems.length > 0 && (
                <section className="container mt-5">
                    <div style={styles.statsGrid}>
                        <div className="stat-card" style={styles.statCard}>
                            <div style={styles.statIcon}>📚</div>
                            <div style={styles.statContent}>
                                <h3 style={styles.statNumber}>{formatNumber(wishlistItems.length)}</h3>
                                <p style={styles.statLabel}>Books Saved</p>
                            </div>
                        </div>
                        <div className="stat-card" style={styles.statCard}>
                            <div style={styles.statIcon}>💰</div>
                            <div style={styles.statContent}>
                                <h3 style={styles.statNumber}>{formatPrice(stats.totalValue)}</h3>
                                <p style={styles.statLabel}>Total Value</p>
                            </div>
                        </div>
                        <div className="stat-card" style={styles.statCard}>
                            <div style={styles.statIcon}>📊</div>
                            <div style={styles.statContent}>
                                <h3 style={styles.statNumber}>{Object.keys(stats.categories).length}</h3>
                                <p style={styles.statLabel}>Categories</p>
                            </div>
                        </div>
                        <div className="stat-card" style={styles.statCard}>
                            <div style={styles.statIcon}>⭐</div>
                            <div style={styles.statContent}>
                                <h3 style={styles.statNumber}>
                                    {stats.mostExpensive ? formatPrice(getBookPrice(stats.mostExpensive)) : '$0.00'}
                                </h3>
                                <p style={styles.statLabel}>Most Expensive</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="container mt-4">
                    <div className="alert alert-success" style={styles.successAlert}>
                        <div style={styles.successIcon}>✓</div>
                        <div>
                            <strong>Success!</strong> {successMessage}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mt-5">
                {wishlistItems.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>❤️</div>
                        <h2 style={styles.emptyTitle}>Your Wishlist is Empty</h2>
                        <p style={styles.emptyMessage}>
                            Books you save will appear here. Start building your reading list!
                        </p>
                        <div style={styles.emptyActions}>
                            <Link to="/books" className="btn btn-gold" style={styles.emptyBrowseButton}>
                                Browse Books
                            </Link>
                            <Link to="/featured" className="btn" style={styles.featuredButton}>
                                View Featured Books
                            </Link>
                        </div>
                        
                        <div style={styles.suggestions}>
                            <h4 style={styles.suggestionsTitle}>Popular Categories:</h4>
                            <div style={styles.suggestionTags}>
                                {['Fiction', 'Science Fiction', 'Mystery', 'Biography', 'Self-Help'].map(category => (
                                    <Link 
                                        key={category}
                                        to={`/categories/${category.toLowerCase()}`}
                                        style={styles.suggestionTag}
                                    >
                                        {category}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Actions Bar */}
                        <div style={styles.actionsBar}>
                            <div style={styles.leftActions}>
                                <div style={styles.selectAllContainer}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === wishlistItems.length}
                                        onChange={toggleSelectAll}
                                        style={styles.selectCheckbox}
                                    />
                                    <span style={styles.selectLabel}>
                                        {selectedItems.length > 0 
                                            ? `${selectedItems.length} selected` 
                                            : 'Select all'}
                                    </span>
                                </div>
                                
                                {selectedItems.length > 0 && (
                                    <button 
                                        onClick={handleRemoveSelected}
                                        className="btn btn-outline"
                                        style={styles.removeSelectedButton}
                                    >
                                        🗑️ Remove Selected
                                    </button>
                                )}
                            </div>
                            
                            <div style={styles.rightActions}>
                                <div style={styles.sortContainer}>
                                    <span style={styles.sortLabel}>Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={handleSortChange}
                                        style={styles.sortSelect}
                                    >
                                        <option value="recent">Recently Added</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="title">Title (A-Z)</option>
                                    </select>
                                </div>
                                
                                <button 
                                    onClick={handleAddAllToCart}
                                    className="btn btn-gold"
                                    style={styles.addAllButton}
                                >
                                    🛒 Add All to Cart
                                </button>
                                
                                <button 
                                    onClick={handleClearWishlist}
                                    className="btn btn-outline"
                                    style={styles.clearButton}
                                >
                                    Clear Wishlist
                                </button>
                            </div>
                        </div>

                        {/* Wishlist Grid */}
                        <div style={styles.wishlistGrid}>
                            {wishlistItems.map((item) => {
                                const bookId = getBookId(item);
                                const title = getBookTitle(item);
                                const author = getBookAuthor(item);
                                const price = getBookPrice(item);
                                const category = getBookCategory(item);
                                const condition = getBookCondition(item);
                                
                                return (
                                    <div key={item.id} className="wishlist-card" style={styles.wishlistCard}>
                                        <div style={styles.cardHeader}>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => toggleItemSelection(item.id)}
                                                style={styles.itemCheckbox}
                                            />
                                            <span style={styles.itemDate}>
                                                Added: {new Date(item.added_at || item.created_at).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        
                                        <div style={styles.cardContent}>
                                            <div style={styles.imageContainer}>
                                                <Link to={`/book/${bookId}`}>
                                                    <img
                                                        src={getBookImage(item.image_url, title)}
                                                        alt={title}
                                                        style={styles.bookImage}
                                                        onError={(e) => handleImageError(e, title)}
                                                    />
                                                </Link>
                                            </div>
                                            
                                            <div style={styles.bookInfo}>
                                                <Link to={`/book/${bookId}`} style={styles.bookLink}>
                                                    <h3 style={styles.bookTitle}>{title}</h3>
                                                    <p style={styles.bookAuthor}>by {author}</p>
                                                </Link>
                                                
                                                <div style={styles.bookDetails}>
                                                    <span style={{
                                                        ...styles.categoryBadge,
                                                        backgroundColor: getCategoryColor(category)
                                                    }}>
                                                        {category}
                                                    </span>
                                                    <span style={styles.conditionBadge}>{condition}</span>
                                                </div>
                                                
                                                <div style={styles.priceSection}>
                                                    <span style={styles.price}>{formatPrice(price)}</span>
                                                    {price > 50 && (
                                                        <span style={styles.priceNote}>💎 Premium Book</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.cardActions}>
                                            <button 
                                                onClick={() => handleAddToCart(bookId)}
                                                className="btn btn-gold"
                                                style={styles.cartButton}
                                            >
                                                🛒 Add to Cart
                                            </button>
                                            
                                            <div style={styles.secondaryActions}>
                                                <Link 
                                                    to={`/book/${bookId}`}
                                                    className="btn"
                                                    style={styles.viewButton}
                                                >
                                                    👁️ View Details
                                                </Link>
                                                <button 
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="btn btn-outline"
                                                    style={styles.removeButton}
                                                >
                                                    ❤️ Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Category Breakdown */}
                        <section style={styles.categoriesSection}>
                            <h3 style={styles.categoriesTitle}>Your Wishlist by Category</h3>
                            <div style={styles.categoriesGrid}>
                                {Object.entries(stats.categories).map(([category, count]) => (
                                    <div key={category} style={styles.categoryItem}>
                                        <div style={styles.categoryHeader}>
                                            <span style={styles.categoryName}>{category}</span>
                                            <span style={styles.categoryCount}>{count} book{count > 1 ? 's' : ''}</span>
                                        </div>
                                        <div style={styles.categoryBar}>
                                            <div 
                                                style={{
                                                    ...styles.categoryFill,
                                                    width: `${(count / wishlistItems.length) * 100}%`,
                                                    backgroundColor: getCategoryColor(category)
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="blue-bg" style={styles.ctaSection}>
                            <div style={styles.ctaContent}>
                                <h2 style={styles.ctaTitle}>Ready to Read?</h2>
                                <p style={styles.ctaText}>
                                    Turn your wishlist into reality. Add these books to your cart 
                                    and start your reading journey today.
                                </p>
                                <div style={styles.ctaActions}>
                                    <button 
                                        onClick={handleAddAllToCart}
                                        className="btn btn-gold"
                                        style={styles.ctaButton}
                                    >
                                        🛒 Add All to Cart ({wishlistItems.length})
                                    </button>
                                    <Link to="/books" className="btn" style={styles.ctaBrowseButton}>
                                        Continue Browsing
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
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
    
    // Stats Grid
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
        backgroundColor: '#fef3c7',
        color: '#92400e',
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
    
    // Success Alert
    successAlert: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem',
        marginBottom: '1.5rem',
    },
    successIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    
    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
        color: '#ef4444',
    },
    emptyTitle: {
        fontSize: '2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    emptyMessage: {
        color: '#6b7280',
        fontSize: '1.1rem',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    emptyActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '3rem',
        flexWrap: 'wrap',
    },
    emptyBrowseButton: {
        padding: '0.75rem 1.5rem',
    },
    featuredButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    suggestions: {
        marginTop: '3rem',
        paddingTop: '3rem',
        borderTop: '1px solid #e5e7eb',
    },
    suggestionsTitle: {
        color: '#1e3a8a',
        fontSize: '1.2rem',
        marginBottom: '1rem',
    },
    suggestionTags: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    suggestionTag: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f0f9ff',
        color: '#1e3a8a',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
    },
    
    // Actions Bar
    actionsBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    leftActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    rightActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    selectAllContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    selectCheckbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    selectLabel: {
        color: '#1f2937',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    removeSelectedButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    sortContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    sortLabel: {
        color: '#6b7280',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    sortSelect: {
        padding: '0.5rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        cursor: 'pointer',
        fontSize: '0.9rem',
        minWidth: '150px',
    },
    addAllButton: {
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem',
    },
    clearButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '0.95rem',
    },
    
    // Wishlist Grid
    wishlistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    wishlistCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
    },
    cardHeader: {
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemCheckbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    itemDate: {
        color: '#9ca3af',
        fontSize: '0.85rem',
    },
    cardContent: {
        padding: '1.5rem',
        display: 'flex',
        gap: '1.5rem',
    },
    imageContainer: {
        flexShrink: 0,
    },
    bookImage: {
        width: '120px',
        height: '180px',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    bookInfo: {
        flex: 1,
    },
    bookLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        marginBottom: '1rem',
    },
    bookTitle: {
        fontSize: '1.2rem',
        color: '#1f2937',
        marginBottom: '0.5rem',
        fontWeight: '600',
        lineHeight: '1.3',
    },
    bookAuthor: {
        color: '#6b7280',
        fontSize: '0.95rem',
    },
    bookDetails: {
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
    },
    categoryBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
        color: '#ffffff',
    },
    conditionBadge: {
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    priceSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    price: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#1e3a8a',
    },
    priceNote: {
        color: '#8b5cf6',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    cardActions: {
        padding: '1rem 1.5rem',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    cartButton: {
        padding: '0.75rem',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem',
    },
    secondaryActions: {
        display: 'flex',
        gap: '0.75rem',
    },
    viewButton: {
        flex: 1,
        padding: '0.75rem',
        fontSize: '0.9rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textAlign: 'center',
        textDecoration: 'none',
    },
    removeButton: {
        flex: 1,
        padding: '0.75rem',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    
    // Categories Section
    categoriesSection: {
        marginBottom: '3rem',
    },
    categoriesTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '1.5rem',
    },
    categoriesGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    categoryItem: {
        backgroundColor: '#ffffff',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    categoryHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    categoryName: {
        color: '#1f2937',
        fontSize: '1rem',
        fontWeight: '500',
    },
    categoryCount: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    categoryBar: {
        height: '6px',
        backgroundColor: '#f3f4f6',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    categoryFill: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.5s ease',
    },
    
    // CTA Section
    ctaSection: {
        padding: '3rem',
        backgroundColor: '#1e3a8a',
        borderRadius: '12px',
        marginBottom: '3rem',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    ctaContent: {
        textAlign: 'center',
    },
    ctaTitle: {
        fontSize: '2rem',
        color: '#ffffff',
        marginBottom: '1rem',
    },
    ctaText: {
        fontSize: '1.1rem',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    ctaActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    ctaButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    ctaBrowseButton: {
        padding: '0.75rem 2rem',
        backgroundColor: 'transparent',
        border: '2px solid #ffffff',
        color: '#ffffff',
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
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    browseButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textDecoration: 'none',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .wishlist-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border-color: #1e3a8a;
    }
    
    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .suggestion-tag:hover {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
        transform: translateY(-2px);
    }
    
    .add-all-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .clear-button:hover {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        background-color: #fef2f2 !important;
        transform: translateY(-2px);
    }
    
    .remove-selected-button:hover {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        background-color: #fef2f2 !important;
        transform: translateY(-2px);
    }
    
    .cart-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .view-button:hover {
        background-color: #1d4ed8 !important;
    }
    
    .remove-button:hover {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        background-color: #fef2f2 !important;
    }
    
    .cta-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .cta-browse-button:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-2px);
    }
    
    .sort-select:focus {
        border-color: #1e3a8a !important;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1) !important;
        outline: none;
    }
`;
document.head.appendChild(styleSheet);

export default WishlistPage;