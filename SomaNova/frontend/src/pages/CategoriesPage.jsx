import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collectionAPI, bookAPI } from '../services/api';
import '../styles/theme.css';

/**
 * Categories Page - Display all collections/categories
 */
const CategoriesPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        totalCategories: 0,
        totalBooks: 0,
        averageBooksPerCategory: 0,
        largestCategory: '',
        largestCategoryCount: 0
    });
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        fetchCollections();
        fetchStats();
    }, []);

    useEffect(() => {
        sortCollections();
    }, [sortBy, collections]);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await collectionAPI.getAll();
            if (response.success) {
                setCollections(response.data || []);
                setError('');
            } else {
                setError('Failed to load categories');
            }
        } catch (err) {
            setError('Error loading categories. Please try again.');
            console.error('Categories fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Get total books count
            const booksResponse = await bookAPI.getAll();
            const totalBooks = booksResponse.success ? (booksResponse.data || []).length : 0;
            
            // Calculate category stats after collections are loaded
            if (collections.length > 0) {
                const totalCategories = collections.length;
                const totalBooksInCollections = collections.reduce((sum, col) => sum + (col.book_count || 0), 0);
                const averageBooksPerCategory = Math.round(totalBooksInCollections / totalCategories);
                
                // Find largest category
                let largestCategory = '';
                let largestCategoryCount = 0;
                
                collections.forEach(collection => {
                    const bookCount = collection.book_count || 0;
                    if (bookCount > largestCategoryCount) {
                        largestCategoryCount = bookCount;
                        largestCategory = collection.name;
                    }
                });
                
                setStats({
                    totalCategories,
                    totalBooks,
                    averageBooksPerCategory,
                    largestCategory,
                    largestCategoryCount
                });
            }
        } catch (err) {
            console.error('Stats calculation error:', err);
        }
    };

    const sortCollections = () => {
        let sorted = [...collections];
        
        switch (sortBy) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'books_desc':
                sorted.sort((a, b) => (b.book_count || 0) - (a.book_count || 0));
                break;
            case 'books_asc':
                sorted.sort((a, b) => (a.book_count || 0) - (b.book_count || 0));
                break;
            case 'recent':
                sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                break;
        }
        
        return sorted;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?query=${encodeURIComponent(searchQuery)}&type=category`;
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getCategoryColor = (index) => {
        const colors = [
            '#1e3a8a', // Navy
            '#fbbf24', // Gold
            '#10b981', // Emerald
            '#8b5cf6', // Violet
            '#ef4444', // Red
            '#0ea5e9', // Sky
            '#ec4899', // Pink
            '#f59e0b', // Amber
            '#84cc16', // Lime
            '#14b8a6', // Teal
            '#f97316', // Orange
            '#8b5cf6'  // Violet
        ];
        return colors[index % colors.length];
    };

    const getCategoryIcon = (categoryName) => {
        const iconMap = {
            'Fiction': '📖',
            'Science Fiction': '🚀',
            'Fantasy': '🧙',
            'Mystery': '🕵️',
            'Romance': '💕',
            'Biography': '👤',
            'Self-Help': '🧠',
            'Business': '💼',
            'Technology': '💻',
            'Science': '🔬',
            'History': '🏛️',
            'Art': '🎨',
            'Children': '🧒',
            'Young Adult': '🌟',
            'Poetry': '📜',
            'Drama': '🎭',
            'Cookbooks': '🍳',
            'Travel': '🧳',
            'Health & Fitness': '💪',
            'Education': '🎓'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (categoryName.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        
        return '📚'; // Default icon
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading categories...</p>
                    <p style={styles.loadingSubtext}>Organizing our book collection for you</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h3 style={styles.errorTitle}>Error Loading Categories</h3>
                    <p style={styles.errorMessage}>{error}</p>
                    <div style={styles.errorActions}>
                        <button 
                            onClick={fetchCollections} 
                            className="btn btn-gold"
                            style={styles.retryButton}
                        >
                            🔄 Retry
                        </button>
                        <Link to="/books" className="btn" style={styles.secondaryButton}>
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
                        <h1 style={styles.heroTitle}>Book Categories</h1>
                        <p style={styles.heroSubtitle}>
                            Explore our extensive collection organized by genre, theme, and interest. 
                            Find your next great read in the perfect category for you.
                        </p>
                        
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <div style={styles.searchContainer}>
                                <input
                                    type="text"
                                    placeholder="Search for categories or specific books..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={styles.searchInput}
                                />
                                <button type="submit" className="btn btn-gold" style={styles.searchButton}>
                                    🔍 Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container mt-5">
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📚</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats.totalCategories)}</h3>
                            <p style={styles.statLabel}>Total Categories</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📖</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats.totalBooks)}</h3>
                            <p style={styles.statLabel}>Books Available</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>📊</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats.averageBooksPerCategory)}</h3>
                            <p style={styles.statLabel}>Avg per Category</p>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⭐</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{stats.largestCategory}</h3>
                            <p style={styles.statLabel}>Most Books ({stats.largestCategoryCount})</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Controls Section */}
            <section className="container mt-5">
                <div style={styles.controls}>
                    <div style={styles.sortControls}>
                        <label style={styles.sortLabel}>Sort by:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.sortSelect}
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="books_desc">Most Books</option>
                            <option value="books_asc">Fewest Books</option>
                            <option value="recent">Recently Added</option>
                        </select>
                    </div>
                    
                    <div style={styles.viewInfo}>
                        <span style={styles.viewCount}>
                            {collections.length} categories
                        </span>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container mt-4">
                {collections.length > 0 ? (
                    <div style={styles.collectionsGrid}>
                        {sortCollections().map((collection, index) => (
                            <Link 
                                key={collection.id} 
                                to={`/collection/${collection.slug}`}
                                className="category-card"
                                style={{
                                    ...styles.collectionCard,
                                    backgroundColor: getCategoryColor(index),
                                    background: `linear-gradient(135deg, ${getCategoryColor(index)} 0%, ${getCategoryColor(index)}99 100%)`
                                }}
                            >
                                <div style={styles.cardContent}>
                                    <div style={styles.cardHeader}>
                                        <div style={styles.categoryIcon}>
                                            {getCategoryIcon(collection.name)}
                                        </div>
                                        <div style={styles.categoryBadge}>
                                            <span style={styles.badgeText}>
                                                {formatNumber(collection.book_count || 0)} books
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.cardBody}>
                                        <h3 style={styles.collectionTitle}>{collection.name}</h3>
                                        <p style={styles.collectionDescription}>
                                            {collection.description || `Explore our collection of ${collection.name.toLowerCase()} books.`}
                                        </p>
                                    </div>
                                    
                                    <div style={styles.cardFooter}>
                                        <span style={styles.viewText}>Browse Collection</span>
                                        <div style={styles.arrowIcon}>→</div>
                                    </div>
                                </div>
                                
                                <div style={styles.hoverOverlay}></div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📚</div>
                        <h3 style={styles.emptyTitle}>No Categories Available</h3>
                        <p style={styles.emptyMessage}>
                            Our book categories are being organized. Check back soon or browse all books directly.
                        </p>
                        <div style={styles.emptyActions}>
                            <Link to="/books" className="btn btn-gold" style={styles.emptyButton}>
                                Browse All Books
                            </Link>
                            <button 
                                onClick={fetchCollections}
                                className="btn"
                                style={styles.emptySecondaryButton}
                            >
                                Refresh Categories
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Browse All Section */}
            <section className="blue-bg" style={styles.browseAllSection}>
                <div className="container">
                    <div style={styles.browseAllContent}>
                        <h2 style={styles.browseAllTitle}>Browse All Books</h2>
                        <p style={styles.browseAllText}>
                            Can't decide on a category? Explore our complete collection of books 
                            across all genres and categories.
                        </p>
                        <div style={styles.browseAllActions}>
                            <Link to="/books" className="btn btn-gold" style={styles.browseAllButton}>
                                View All Books
                            </Link>
                            <Link to="/search" className="btn" style={styles.secondaryBrowseButton}>
                                🔍 Advanced Search
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Choose */}
            <section className="container mt-5">
                <div style={styles.guideSection}>
                    <h2 style={styles.guideTitle}>How to Choose Your Next Read</h2>
                    <p style={styles.guideSubtitle}>Tips for finding the perfect book in our categories</p>
                    
                    <div style={styles.tipsGrid}>
                        <div style={styles.tipCard}>
                            <div style={styles.tipIcon}>🔍</div>
                            <h4 style={styles.tipTitle}>Browse by Mood</h4>
                            <p style={styles.tipDescription}>
                                Feeling adventurous? Try Fantasy or Science Fiction. 
                                Want something relaxing? Explore Romance or Literary Fiction.
                            </p>
                        </div>
                        <div style={styles.tipCard}>
                            <div style={styles.tipIcon}>🎯</div>
                            <h4 style={styles.tipTitle}>Check Bestsellers</h4>
                            <p style={styles.tipDescription}>
                                Look for categories with many books - they're popular for a reason!
                                More books means more variety to choose from.
                            </p>
                        </div>
                        <div style={styles.tipCard}>
                            <div style={styles.tipIcon}>🆕</div>
                            <h4 style={styles.tipTitle}>Explore New Categories</h4>
                            <p style={styles.tipDescription}>
                                Step out of your comfort zone! Try a category you've never explored before.
                                You might discover a new favorite genre.
                            </p>
                        </div>
                        <div style={styles.tipCard}>
                            <div style={styles.tipIcon}>📚</div>
                            <h4 style={styles.tipTitle}>Read Descriptions</h4>
                            <p style={styles.tipDescription}>
                                Each category has a description. Read them to understand what 
                                types of books you'll find in each collection.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to Top */}
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
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
    },
    heroTitle: {
        fontSize: '3rem',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '1rem',
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '2.5rem',
        lineHeight: '1.6',
    },
    searchForm: {
        marginTop: '2rem',
    },
    searchContainer: {
        display: 'flex',
        gap: '0.5rem',
        maxWidth: '600px',
        margin: '0 auto',
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
    
    // Controls
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    sortControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    sortLabel: {
        color: '#6b7280',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    sortSelect: {
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        cursor: 'pointer',
        fontSize: '0.95rem',
        minWidth: '180px',
        transition: 'all 0.3s ease',
    },
    viewInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    viewCount: {
        color: '#6b7280',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    
    // Collections Grid
    collectionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
    },
    collectionCard: {
        borderRadius: '12px',
        textDecoration: 'none',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '280px',
        display: 'block',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    cardContent: {
        padding: '2rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 2,
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
    },
    categoryIcon: {
        fontSize: '2.5rem',
        opacity: 0.9,
    },
    categoryBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    badgeText: {
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    cardBody: {
        flex: 1,
        marginBottom: '1.5rem',
    },
    collectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '0.75rem',
        color: '#ffffff',
    },
    collectionDescription: {
        fontSize: '0.95rem',
        opacity: 0.9,
        lineHeight: '1.5',
        height: '4.5rem',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    },
    viewText: {
        fontSize: '0.95rem',
        fontWeight: '500',
        opacity: 0.9,
    },
    arrowIcon: {
        fontSize: '1.2rem',
        opacity: 0.8,
        transition: 'all 0.3s ease',
    },
    hoverOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        opacity: 0,
        transition: 'all 0.3s ease',
    },
    
    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
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
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        margin: '2rem 0',
    },
    errorIcon: {
        fontSize: '3rem',
        marginBottom: '1.5rem',
        color: '#ef4444',
    },
    errorTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    errorMessage: {
        color: '#6b7280',
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
    
    // Browse All Section
    browseAllSection: {
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        marginTop: '2rem',
    },
    browseAllContent: {
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
    },
    browseAllTitle: {
        fontSize: '2.5rem',
        color: '#ffffff',
        marginBottom: '1rem',
    },
    browseAllText: {
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    browseAllActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    browseAllButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
    },
    secondaryBrowseButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: 'transparent',
        border: '2px solid #ffffff',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    
    // Guide Section
    guideSection: {
        padding: '3rem 0',
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
    tipsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    tipCard: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s ease',
    },
    tipIcon: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },
    tipTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '0.75rem',
    },
    tipDescription: {
        color: '#6b7280',
        fontSize: '0.95rem',
        lineHeight: '1.5',
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
    .category-card:hover {
        transform: translateY(-8px) !important;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2) !important;
    }
    
    .category-card:hover .arrow-icon {
        transform: translateX(6px);
        opacity: 1 !important;
    }
    
    .category-card:hover .hover-overlay {
        opacity: 1;
    }
    
    .search-input:focus {
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3) !important;
        outline: none;
    }
    
    .search-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .sort-select:focus {
        border-color: #1e3a8a !important;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1) !important;
        outline: none;
    }
    
    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .tip-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .browse-all-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .secondary-browse-button:hover {
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
    
    .back-to-top:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4);
    }
`;
document.head.appendChild(styleSheet);

export default CategoriesPage;