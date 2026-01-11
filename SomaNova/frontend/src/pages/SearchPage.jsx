import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookAPI, collectionAPI, searchAPI } from '../services/api';
import { getBookImage, handleImageError } from '../utils/imageUtils';
import '../styles/theme.css';

/**
 * Search Page - Advanced search and filter books with professional interface
 */
const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    
    // Search parameters from URL
    const initialSearchTerm = queryParams.get('q') || queryParams.get('query') || '';
    const initialCategory = queryParams.get('category') || '';
    
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [books, setBooks] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalResults: 0,
        priceRange: { min: 0, max: 0 },
        averagePrice: 0
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        category: initialCategory,
        minPrice: '',
        maxPrice: '',
        condition: '',
        sortBy: 'newest',
        collection_id: '',
        title: '',
        author: ''
    });

    // Load collections for category dropdown
    useEffect(() => {
        const loadCollections = async () => {
            try {
                const response = await collectionAPI.getAll();
                if (response.success) {
                    setCollections(response.data || []);
                }
            } catch (err) {
                console.error('Error loading collections:', err);
            }
        };
        loadCollections();
    }, []);

    // Perform search when component mounts or query changes
    useEffect(() => {
        if (initialSearchTerm || initialCategory) {
            performSearch();
        }
    }, [location.search]);

    // Calculate stats when books change
    useEffect(() => {
        calculateStats();
    }, [books]);

    const calculateStats = () => {
        if (books.length === 0) {
            setStats({
                totalResults: 0,
                priceRange: { min: 0, max: 0 },
                averagePrice: 0
            });
            return;
        }

        const prices = books.map(book => book.price || 0).filter(price => price > 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

        setStats({
            totalResults: books.length,
            priceRange: { min: minPrice, max: maxPrice },
            averagePrice
        });
    };

    const performSearch = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            const searchParams = {
                title: searchTerm.includes(' ') ? '' : searchTerm, // Use specific fields for better results
                author: searchTerm.includes(' ') ? searchTerm : ''
            };

            // Add filters if they exist
            if (filters.category) searchParams.category = filters.category;
            if (filters.minPrice) searchParams.min_price = filters.minPrice;
            if (filters.maxPrice) searchParams.max_price = filters.maxPrice;
            if (filters.condition) searchParams.condition = filters.condition;
            if (filters.collection_id) searchParams.collection_id = filters.collection_id;

            const response = await searchAPI.search(searchParams);
            
            if (response.success) {
                let filteredBooks = response.data || [];
                
                // Apply sorting
                filteredBooks = sortBooks(filteredBooks, filters.sortBy);
                
                setBooks(filteredBooks);
            } else {
                setError('Failed to search books');
                setBooks([]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Error searching books. Please try again.');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filters]);

    const sortBooks = (booksList, sortBy) => {
        const sorted = [...booksList];
        switch (sortBy) {
            case 'price_low':
                return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price_high':
                return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'title_asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'title_desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'newest':
            default:
                return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (filters.category) params.set('category', filters.category);
        navigate(`/search?${params.toString()}`);
        performSearch();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        performSearch();
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            condition: '',
            sortBy: 'newest',
            collection_id: '',
            title: '',
            author: ''
        });
        setSearchTerm('');
        navigate('/search');
        setBooks([]);
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

    const conditions = [
        { value: 'New', label: 'New - Perfect condition', color: '#10b981' },
        { value: 'Like New', label: 'Like New - Minor wear', color: '#84cc16' },
        { value: 'Very Good', label: 'Very Good - Light wear', color: '#f59e0b' },
        { value: 'Good', label: 'Good - Moderate wear', color: '#fbbf24' },
        { value: 'Fair', label: 'Fair - Significant wear', color: '#f97316' },
        { value: 'Poor', label: 'Poor - Heavy wear', color: '#ef4444' }
    ];

    const popularSearches = [
        'Harry Potter', 'Stephen King', 'Science Fiction', 
        'Biography', 'Self-Help', 'Romance', 'Mystery', 'Classics'
    ];

    if (loading) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Searching Books...</p>
                    <p style={styles.loadingSubtext}>Finding the best matches for your search</p>
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
                            <span style={styles.badgeText}>🔍 Advanced Search</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Find Your Perfect
                            <span style={styles.highlight}> Book Match</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Search through thousands of books with our advanced filters.
                            Find exactly what you're looking for with precision.
                        </p>
                        
                        {/* Main Search Bar */}
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <div style={styles.searchContainer}>
                                <div style={styles.searchIcon}>
                                    🔍
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search books by title, author, genre, or keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInput}
                                />
                                <button type="submit" className="btn btn-gold" style={styles.searchButton}>
                                    Search Books
                                </button>
                            </div>
                            
                            {/* Quick Search Tags */}
                            <div style={styles.searchTags}>
                                <span style={styles.tagLabel}>Popular searches:</span>
                                {popularSearches.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm(tag);
                                            setTimeout(() => handleSearch({ preventDefault: () => {} }), 100);
                                        }}
                                        style={styles.tag}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Advanced Filters Toggle */}
                            <div style={styles.advancedToggle}>
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    style={styles.advancedButton}
                                >
                                    {showAdvancedFilters ? '▲ Hide Advanced Filters' : '▼ Show Advanced Filters'}
                                </button>
                            </div>
                            
                            {/* Advanced Filters (Collapsible) */}
                            {showAdvancedFilters && (
                                <div style={styles.advancedFilters}>
                                    <div style={styles.advancedGrid}>
                                        <div style={styles.filterGroup}>
                                            <label style={styles.filterLabel}>Category</label>
                                            <select
                                                name="category"
                                                value={filters.category}
                                                onChange={handleFilterChange}
                                                style={styles.filterSelect}
                                            >
                                                <option value="">All Categories</option>
                                                {collections.map(collection => (
                                                    <option key={collection.id} value={collection.name}>
                                                        {collection.name} ({collection.book_count || 0})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div style={styles.filterGroup}>
                                            <label style={styles.filterLabel}>Price Range</label>
                                            <div style={styles.priceInputs}>
                                                <input
                                                    type="number"
                                                    name="minPrice"
                                                    value={filters.minPrice}
                                                    onChange={handleFilterChange}
                                                    placeholder="Min $"
                                                    style={styles.priceInput}
                                                    min="0"
                                                    step="0.01"
                                                />
                                                <span style={styles.priceSeparator}>to</span>
                                                <input
                                                    type="number"
                                                    name="maxPrice"
                                                    value={filters.maxPrice}
                                                    onChange={handleFilterChange}
                                                    placeholder="Max $"
                                                    style={styles.priceInput}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={styles.filterGroup}>
                                            <label style={styles.filterLabel}>Condition</label>
                                            <select
                                                name="condition"
                                                value={filters.condition}
                                                onChange={handleFilterChange}
                                                style={styles.filterSelect}
                                            >
                                                <option value="">All Conditions</option>
                                                {conditions.map(cond => (
                                                    <option key={cond.value} value={cond.value}>
                                                        {cond.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div style={styles.filterActions}>
                                            <button 
                                                type="button"
                                                onClick={applyFilters}
                                                className="btn"
                                                style={styles.applyButton}
                                            >
                                                Apply Filters
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={clearFilters}
                                                className="btn btn-outline"
                                                style={styles.clearButton}
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mt-5">
                <div style={styles.content}>
                    {/* Results Header */}
                    <div style={styles.resultsHeader}>
                        <div>
                            <h2 style={styles.resultsTitle}>
                                {searchTerm || filters.category ? 'Search Results' : 'All Books'}
                                {books.length > 0 && (
                                    <span style={styles.resultCount}> ({formatNumber(books.length)} found)</span>
                                )}
                            </h2>
                            {searchTerm && (
                                <p style={styles.searchQuery}>
                                    Searching for: <strong>"{searchTerm}"</strong>
                                    {filters.category && ` in category "${filters.category}"`}
                                </p>
                            )}
                        </div>
                        
                        {/* Sort Options */}
                        <div style={styles.sortControls}>
                            <label style={styles.sortLabel}>Sort by:</label>
                            <select
                                name="sortBy"
                                value={filters.sortBy}
                                onChange={(e) => {
                                    handleFilterChange(e);
                                    applyFilters();
                                }}
                                style={styles.sortSelect}
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="title_asc">Title: A to Z</option>
                                <option value="title_desc">Title: Z to A</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    {books.length > 0 && (
                        <div style={styles.statsBar}>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Price Range:</span>
                                <span style={styles.statValue}>
                                    {formatPrice(stats.priceRange.min)} - {formatPrice(stats.priceRange.max)}
                                </span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Average Price:</span>
                                <span style={styles.statValue}>{formatPrice(stats.averagePrice)}</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Books Found:</span>
                                <span style={styles.statValue}>{formatNumber(stats.totalResults)}</span>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div style={styles.errorContainer}>
                            <div style={styles.errorIcon}>⚠️</div>
                            <h3 style={styles.errorTitle}>Search Error</h3>
                            <p style={styles.errorMessage}>{error}</p>
                            <button 
                                onClick={performSearch} 
                                className="btn btn-gold"
                                style={styles.retryButton}
                            >
                                🔄 Retry Search
                            </button>
                        </div>
                    )}

                    {/* Results Grid */}
                    {!error && books.length > 0 ? (
                        <div style={styles.booksGrid}>
                            {books.map(book => {
                                const bookData = book.book || book;
                                const bookId = bookData.id || book.id;
                                
                                return (
                                    <div key={bookId} className="search-book-card" style={styles.bookCard}>
                                        <Link to={`/book/${bookId}`} style={styles.cardLink}>
                                            <div style={styles.imageContainer}>
                                                <img
                                                    src={getBookImage(bookData.image_url, bookData.title)}
                                                    alt={bookData.title}
                                                    style={styles.image}
                                                    onError={(e) => handleImageError(e, bookData.title)}
                                                />
                                                <div style={styles.imageOverlay}></div>
                                                <div style={styles.cardBadge}>
                                                    <span style={{
                                                        ...styles.conditionBadge,
                                                        backgroundColor: conditions.find(c => c.value === bookData.condition)?.color || '#6b7280'
                                                    }}>
                                                        {bookData.condition || 'Good'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div style={styles.bookInfo}>
                                                <h3 style={styles.title}>{bookData.title}</h3>
                                                <p style={styles.author}>by {bookData.author}</p>
                                                
                                                <div style={styles.details}>
                                                    <span style={styles.category}>{bookData.category}</span>
                                                    <span style={styles.price}>{formatPrice(bookData.price)}</span>
                                                </div>
                                                
                                                {bookData.description && (
                                                    <p style={styles.description}>
                                                        {bookData.description.length > 80 
                                                            ? `${bookData.description.substring(0, 80)}...` 
                                                            : bookData.description}
                                                    </p>
                                                )}
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
                                                style={styles.wishlistButton}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    // Add to wishlist functionality
                                                }}
                                            >
                                                ❤️ Wishlist
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : !error && searchTerm ? (
                        <div style={styles.noResults}>
                            <div style={styles.noResultsIcon}>📚</div>
                            <h3 style={styles.noResultsTitle}>No Books Found</h3>
                            <p style={styles.noResultsText}>
                                We couldn't find any books matching "<strong>{searchTerm}</strong>"
                                {filters.category && ` in category "${filters.category}"`}.
                            </p>
                            <div style={styles.noResultsSuggestions}>
                                <p style={styles.suggestionsTitle}>Suggestions:</p>
                                <ul style={styles.suggestionsList}>
                                    <li>Check your spelling or try different keywords</li>
                                    <li>Try a more general search term</li>
                                    <li>Browse by category instead</li>
                                    <li>Clear your filters to see all books</li>
                                </ul>
                            </div>
                            <div style={styles.noResultsActions}>
                                <button 
                                    onClick={clearFilters}
                                    className="btn btn-gold"
                                    style={styles.clearSearchButton}
                                >
                                    Clear Search
                                </button>
                                <Link to="/books" className="btn" style={styles.browseButton}>
                                    Browse All Books
                                </Link>
                            </div>
                        </div>
                    ) : !error && (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🔍</div>
                            <h3 style={styles.emptyTitle}>Start Your Search</h3>
                            <p style={styles.emptyText}>
                                Enter a search term above to find books in our collection.
                                Use the advanced filters for more precise results.
                            </p>
                            <div style={styles.emptyPopular}>
                                <p style={styles.popularTitle}>Popular Categories:</p>
                                <div style={styles.popularTags}>
                                    {collections.slice(0, 8).map(collection => (
                                        <button
                                            key={collection.id}
                                            onClick={() => {
                                                setSearchTerm(collection.name);
                                                setTimeout(() => handleSearch({ preventDefault: () => {} }), 100);
                                            }}
                                            style={styles.popularTag}
                                        >
                                            {collection.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Tips */}
                    <div style={styles.searchTips}>
                        <h3 style={styles.tipsTitle}>💡 Search Tips</h3>
                        <div style={styles.tipsGrid}>
                            <div style={styles.tip}>
                                <div style={styles.tipIcon}>🎯</div>
                                <h4 style={styles.tipTitle}>Be Specific</h4>
                                <p style={styles.tipText}>
                                    Use exact titles or author names for better results.
                                </p>
                            </div>
                            <div style={styles.tip}>
                                <div style={styles.tipIcon}>💰</div>
                                <h4 style={styles.tipTitle}>Use Price Filters</h4>
                                <p style={styles.tipText}>
                                    Set a price range to find books within your budget.
                                </p>
                            </div>
                            <div style={styles.tip}>
                                <div style={styles.tipIcon}>📖</div>
                                <h4 style={styles.tipTitle}>Browse Categories</h4>
                                <p style={styles.tipText}>
                                    Explore books by genre or topic for curated selections.
                                </p>
                            </div>
                            <div style={styles.tip}>
                                <div style={styles.tipIcon}>⭐</div>
                                <h4 style={styles.tipTitle}>Check Condition</h4>
                                <p style={styles.tipText}>
                                    Filter by book condition to match your quality preferences.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
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
    
    // Search Form
    searchForm: {
        marginBottom: '1rem',
    },
    searchContainer: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: '1.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '1.2rem',
        color: '#6b7280',
        zIndex: 2,
    },
    searchInput: {
        flex: 1,
        padding: '1rem 1.5rem 1rem 4rem',
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
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    
    // Search Tags
    searchTags: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '1rem',
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
    
    // Advanced Filters
    advancedToggle: {
        marginBottom: '1rem',
    },
    advancedButton: {
        background: 'none',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.9rem',
        cursor: 'pointer',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        margin: '0 auto',
    },
    advancedFilters: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '1rem',
    },
    advancedGrid: {
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
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    filterSelect: {
        padding: '0.75rem 1rem',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    priceInputs: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    priceInput: {
        flex: 1,
        padding: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    priceSeparator: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.9rem',
        padding: '0 0.25rem',
    },
    filterActions: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
    },
    applyButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },
    clearButton: {
        padding: '0.75rem 1.5rem',
    },
    
    // Results Header
    resultsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    resultsTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    resultCount: {
        color: '#6b7280',
        fontSize: '1rem',
        fontWeight: 'normal',
        marginLeft: '0.5rem',
    },
    searchQuery: {
        color: '#6b7280',
        fontSize: '1rem',
        margin: 0,
    },
    sortControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    sortLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
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
    },
    
    // Stats Bar
    statsBar: {
        display: 'flex',
        gap: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '12px',
        border: '1px solid #bae6fd',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    statLabel: {
        color: '#1e3a8a',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    statValue: {
        color: '#1e3a8a',
        fontSize: '1.1rem',
        fontWeight: '600',
    },
    
    // Error State
    errorContainer: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#fee2e2',
        borderRadius: '12px',
        color: '#991b1b',
        marginBottom: '2rem',
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
    
    // No Results State
    noResults: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '3rem',
    },
    noResultsIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
        color: '#1e3a8a',
    },
    noResultsTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    noResultsText: {
        color: '#6b7280',
        fontSize: '1rem',
        marginBottom: '2rem',
        lineHeight: '1.6',
        maxWidth: '500px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    noResultsSuggestions: {
        textAlign: 'left',
        maxWidth: '500px',
        margin: '2rem auto',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    suggestionsTitle: {
        color: '#1e3a8a',
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '0.75rem',
    },
    suggestionsList: {
        margin: 0,
        paddingLeft: '1.5rem',
        color: '#6b7280',
        fontSize: '0.95rem',
        lineHeight: '1.6',
    },
    noResultsActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '2rem',
    },
    clearSearchButton: {
        padding: '0.75rem 1.5rem',
    },
    browseButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textDecoration: 'none',
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
    emptyText: {
        color: '#6b7280',
        fontSize: '1rem',
        marginBottom: '2rem',
        lineHeight: '1.6',
        maxWidth: '500px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    emptyPopular: {
        marginTop: '2rem',
    },
    popularTitle: {
        color: '#1e3a8a',
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem',
    },
    popularTags: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    popularTag: {
        backgroundColor: '#f0f9ff',
        color: '#1e3a8a',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
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
    
    // Search Tips
    searchTips: {
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
    },
    tipsTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    tipsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    tip: {
        textAlign: 'center',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s ease',
    },
    tipIcon: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },
    tipTitle: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        fontWeight: '600',
    },
    tipText: {
        color: '#6b7280',
        fontSize: '0.9rem',
        lineHeight: '1.5',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .search-book-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border-color: #1e3a8a;
    }
    
    .search-book-card:hover .image {
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
    
    .advanced-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .filter-select:focus, .price-input:focus, .sort-select:focus {
        border-color: #fbbf24 !important;
        box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2) !important;
        outline: none;
    }
    
    .apply-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .clear-button:hover {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
    }
    
    .retry-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .clear-search-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .browse-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .popular-tag:hover {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
        transform: translateY(-2px);
    }
    
    .tip:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #fbbf24;
    }
`;
document.head.appendChild(styleSheet);

export default SearchPage;