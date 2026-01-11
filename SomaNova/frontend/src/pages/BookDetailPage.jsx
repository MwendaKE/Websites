import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { bookAPI, cartAPI, wishlistAPI, userAPI } from '../services/api';
import { getBookImage, handleImageError } from '../utils/imageUtils';
import '../styles/theme.css';

/**
 * Book Detail Page - Professional book details page for SomaNova
 */
const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isInCart, setIsInCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [cartItemId, setCartItemId] = useState(null);
    const [wishlistItemId, setWishlistItemId] = useState(null);
    const [similarBooks, setSimilarBooks] = useState([]);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        if (id) {
            fetchBook();
        }
    }, [id]);

    const fetchBook = async () => {
        try {
            setLoading(true);
            const response = await bookAPI.getById(id);
            
            if (response.success && response.data) {
                const bookData = response.data;
                setBook(bookData);
                setError('');
                
                // Check if book is in cart/wishlist
                await checkBookStatus();
                
                // Fetch similar books
                await fetchSimilarBooks(bookData.category);
            } else {
                setError('Book not found');
            }
        } catch (err) {
            setError('Failed to load book details. Please try again.');
            console.error('Book fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSimilarBooks = async (category) => {
        try {
            const response = await bookAPI.getAll(category);
            if (response.success) {
                const allBooks = response.data || [];
                // Filter out current book and get up to 4 similar books
                const similar = allBooks
                    .filter(b => b.id !== parseInt(id) && b.category === category)
                    .slice(0, 4);
                setSimilarBooks(similar);
            }
        } catch (error) {
            console.error('Error fetching similar books:', error);
        }
    };

    const checkBookStatus = async () => {
        try {
            const [cartResponse, wishlistResponse] = await Promise.all([
                cartAPI.getAll(),
                wishlistAPI.getAll()
            ]);
            
            if (cartResponse.success) {
                const cartItem = cartResponse.data.find(item => item.book_id === parseInt(id));
                if (cartItem) {
                    setIsInCart(true);
                    setCartItemId(cartItem.id);
                }
            }
            
            if (wishlistResponse.success) {
                const wishlistItem = wishlistResponse.data.find(item => item.book_id === parseInt(id));
                if (wishlistItem) {
                    setIsInWishlist(true);
                    setWishlistItemId(wishlistItem.id);
                }
            }
        } catch (error) {
            console.error('Error checking book status:', error);
        }
    };

    const handleCartAction = async () => {
        if (isLoadingAction) return;
        
        setIsLoadingAction(true);
        try {
            if (isInCart) {
                await cartAPI.remove(cartItemId);
                setIsInCart(false);
                setCartItemId(null);
                await userAPI.getInfo();
            } else {
                const response = await cartAPI.add(parseInt(id), 1);
                if (response.success) {
                    setIsInCart(true);
                    await checkBookStatus();
                    await userAPI.getInfo();
                }
            }
        } catch (error) {
            console.error('Cart action error:', error);
            setError(`Failed to ${isInCart ? 'remove from' : 'add to'} cart. Please try again.`);
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleWishlistAction = async () => {
        if (isLoadingAction) return;
        
        setIsLoadingAction(true);
        try {
            if (isInWishlist) {
                await wishlistAPI.remove(wishlistItemId);
                setIsInWishlist(false);
                setWishlistItemId(null);
                await userAPI.getInfo();
            } else {
                const response = await wishlistAPI.add(parseInt(id));
                if (response.success) {
                    setIsInWishlist(true);
                    await checkBookStatus();
                    await userAPI.getInfo();
                }
            }
        } catch (error) {
            console.error('Wishlist action error:', error);
            setError(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist. Please try again.`);
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleContactSeller = () => {
        if (book?.seller_email) {
            window.location.href = `mailto:${book.seller_email}?subject=Regarding your book: ${encodeURIComponent(book.title)}&body=Hello, I'm interested in your book "${book.title}" listed on SomaNova.`;
        } else {
            setError('Seller contact information is not available.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleBuyNow = () => {
        if (!isInCart) {
            handleCartAction().then(() => {
                navigate('/cart');
            });
        } else {
            navigate('/cart');
        }
    };

    const getBookImageUrl = () => {
        return getBookImage(book?.image_url, book?.title);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
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
                    <p style={styles.loadingText}>Loading Book Details</p>
                    <p style={styles.loadingSubtext}>Fetching comprehensive book information</p>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>📚</div>
                    <h2 style={styles.errorTitle}>Book Not Found</h2>
                    <p style={styles.errorMessage}>
                        {error || 'The requested book could not be found. It may have been removed or the link might be incorrect.'}
                    </p>
                    <div style={styles.errorActions}>
                        <button onClick={() => navigate(-1)} className="btn btn-gold" style={styles.backButton}>
                            ← Go Back
                        </button>
                        <Link to="/books" className="btn" style={styles.browseButton}>
                            Browse All Books
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Error Message */}
            {error && (
                <div className="container mt-4">
                    <div className="alert alert-error" style={styles.alert}>
                        <div style={styles.alertIcon}>⚠️</div>
                        <div>{error}</div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="blue-bg" style={styles.hero}>
                <div className="container">
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={styles.badgeText}>📖 Book Details</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Book Details
                            <span style={styles.highlight}> & Seller Information</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Explore comprehensive details about this pre-owned book. Contact the seller directly for more information.
                        </p>
                    </div>
                </div>
            </section>

            {/* Breadcrumb Navigation */}
            <div className="container mt-4">
                <nav style={styles.breadcrumb}>
                    <Link to="/" style={styles.breadcrumbLink}>Home</Link>
                    <span style={styles.breadcrumbSeparator}>/</span>
                    <Link to="/books" style={styles.breadcrumbLink}>Books</Link>
                    <span style={styles.breadcrumbSeparator}>/</span>
                    <Link to={`/category/${book.category.toLowerCase().replace(/\s+/g, '-')}`} style={styles.breadcrumbLink}>
                        {book.category}
                    </Link>
                    <span style={styles.breadcrumbSeparator}>/</span>
                    <span style={styles.breadcrumbCurrent}>{book.title}</span>
                </nav>
            </div>

            {/* Main Book Details */}
            <div className="container mt-5">
                <div style={styles.bookDetailGrid}>
                    {/* Left Column - Book Image & Quick Actions */}
                    <div style={styles.leftColumn}>
                        <div style={styles.imageCard}>
                            <div style={styles.imageContainer}>
                                <img
                                    src={getBookImageUrl()}
                                    alt={book.title}
                                    style={styles.bookImage}
                                    onError={(e) => handleImageError(e, book.title)}
                                />
                            </div>
                            
                            {/* Book Status Badges */}
                            <div style={styles.bookBadges}>
                                <span style={{
                                    ...styles.conditionBadge,
                                    backgroundColor: getConditionColor(book.condition)
                                }}>
                                    {book.condition || 'Good'} Condition
                                </span>
                                {book.collection_name && (
                                    <span style={styles.collectionBadge}>
                                        📚 {book.collection_name}
                                    </span>
                                )}
                            </div>
                            
                            {/* Quick Stats */}
                            <div style={styles.quickStats}>
                                <div style={styles.statItem}>
                                    <span style={styles.statIcon}>📅</span>
                                    <div>
                                        <span style={styles.statLabel}>Listed</span>
                                        <span style={styles.statValue}>{formatDate(book.created_at)}</span>
                                    </div>
                                </div>
                                <div style={styles.statItem}>
                                    <span style={styles.statIcon}>🔖</span>
                                    <div>
                                        <span style={styles.statLabel}>ISBN</span>
                                        <span style={styles.statValue}>{book.isbn || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div style={styles.quickActionsCard}>
                            <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
                            <div style={styles.quickActionsGrid}>
                                <button 
                                    onClick={handleCartAction}
                                    className={isInCart ? 'btn btn-outline' : 'btn btn-gold'}
                                    style={styles.quickActionButton}
                                    disabled={isLoadingAction}
                                >
                                    {isLoadingAction ? (
                                        <div style={styles.buttonSpinner}></div>
                                    ) : (
                                        <>
                                            {isInCart ? '✓ In Cart' : '🛒 Add to Cart'}
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={handleWishlistAction}
                                    className={isInWishlist ? 'btn btn-outline' : 'btn'}
                                    style={{
                                        ...styles.quickActionButton,
                                        ...(isInWishlist && styles.wishlistActive)
                                    }}
                                    disabled={isLoadingAction}
                                >
                                    {isLoadingAction ? (
                                        <div style={styles.buttonSpinner}></div>
                                    ) : (
                                        <>
                                            {isInWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={handleBuyNow}
                                    className="btn"
                                    style={styles.buyNowButton}
                                    disabled={isLoadingAction}
                                >
                                    ⚡ Buy Now
                                </button>
                                
                                <button 
                                    onClick={handleContactSeller}
                                    className="btn"
                                    style={styles.contactButton}
                                >
                                    📧 Contact Seller
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Book Information */}
                    <div style={styles.rightColumn}>
                        {/* Book Header */}
                        <div style={styles.bookHeader}>
                            <h1 style={styles.bookTitle}>{book.title}</h1>
                            <p style={styles.bookAuthor}>by {book.author}</p>
                            
                            <div style={styles.priceSection}>
                                <h2 style={styles.price}>{formatPrice(book.price)}</h2>
                                <div style={styles.priceDetails}>
                                    <span style={styles.priceNote}>Pre-owned book • Free shipping over $50</span>
                                    <span style={styles.stockStatus}>✅ Available</span>
                                </div>
                            </div>
                        </div>

                        {/* Category Tags */}
                        <div style={styles.categoryTags}>
                            <Link 
                                to={`/category/${book.category.toLowerCase().replace(/\s+/g, '-')}`}
                                style={styles.categoryTag}
                            >
                                {book.category}
                            </Link>
                            <span style={styles.conditionTag}>
                                Condition: {book.condition || 'Good'}
                            </span>
                        </div>

                        {/* Tabs Navigation */}
                        <div style={styles.tabs}>
                            <button
                                onClick={() => setActiveTab('description')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'description' && styles.activeTab)
                                }}
                            >
                                📝 Description
                            </button>
                            <button
                                onClick={() => setActiveTab('seller')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'seller' && styles.activeTab)
                                }}
                            >
                                👤 Seller Info
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'details' && styles.activeTab)
                                }}
                            >
                                📋 Details
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div style={styles.tabContent}>
                            {activeTab === 'description' && (
                                <div style={styles.descriptionContent}>
                                    <h3>Book Description</h3>
                                    <p style={styles.descriptionText}>
                                        {book.description || 'No description available for this book.'}
                                    </p>
                                    
                                    {!book.description && (
                                        <div style={styles.noDescription}>
                                            <p style={styles.noDescriptionText}>
                                                <em>No description provided by the seller. Contact them for more details about this book.</em>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'seller' && (
                                <div style={styles.sellerContent}>
                                    <h3>Seller Information</h3>
                                    <div style={styles.sellerInfoGrid}>
                                        <div style={styles.sellerInfoCard}>
                                            <div style={styles.sellerInfoLabel}>Name</div>
                                            <div style={styles.sellerInfoValue}>
                                                {book.seller_name || 'Anonymous Seller'}
                                            </div>
                                        </div>
                                        <div style={styles.sellerInfoCard}>
                                            <div style={styles.sellerInfoLabel}>Email</div>
                                            <div style={styles.sellerInfoValue}>
                                                {book.seller_email ? (
                                                    <a 
                                                        href={`mailto:${book.seller_email}`}
                                                        style={styles.sellerEmail}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleContactSeller();
                                                        }}
                                                    >
                                                        {book.seller_email}
                                                    </a>
                                                ) : 'Not provided'}
                                            </div>
                                        </div>
                                        {book.seller_phone && (
                                            <div style={styles.sellerInfoCard}>
                                                <div style={styles.sellerInfoLabel}>Phone</div>
                                                <div style={styles.sellerInfoValue}>
                                                    {book.seller_phone}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={styles.sellerContactCard}>
                                        <h4>Contact the Seller</h4>
                                        <p style={styles.sellerContactText}>
                                            Interested in this book? Contact the seller directly to ask questions or arrange a purchase.
                                        </p>
                                        <button 
                                            onClick={handleContactSeller}
                                            className="btn btn-gold"
                                            style={styles.sellerContactButton}
                                            disabled={!book.seller_email}
                                        >
                                            {book.seller_email ? '📧 Message Seller' : 'Contact Unavailable'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div style={styles.detailsContent}>
                                    <h3>Book Details</h3>
                                    <div style={styles.detailsGrid}>
                                        <div style={styles.detailItem}>
                                            <span style={styles.detailLabel}>ISBN</span>
                                            <span style={styles.detailValue}>{book.isbn || 'Not available'}</span>
                                        </div>
                                        <div style={styles.detailItem}>
                                            <span style={styles.detailLabel}>Listed Date</span>
                                            <span style={styles.detailValue}>{formatDate(book.created_at)}</span>
                                        </div>
                                        <div style={styles.detailItem}>
                                            <span style={styles.detailLabel}>Last Updated</span>
                                            <span style={styles.detailValue}>{formatDate(book.updated_at)}</span>
                                        </div>
                                        <div style={styles.detailItem}>
                                            <span style={styles.detailLabel}>Condition</span>
                                            <span style={styles.detailValue}>{book.condition || 'Good'}</span>
                                        </div>
                                        <div style={styles.detailItem}>
                                            <span style={styles.detailLabel}>Category</span>
                                            <span style={styles.detailValue}>
                                                <Link 
                                                    to={`/category/${book.category.toLowerCase().replace(/\s+/g, '-')}`}
                                                    style={styles.detailLink}
                                                >
                                                    {book.category}
                                                </Link>
                                            </span>
                                        </div>
                                        {book.collection_name && (
                                            <div style={styles.detailItem}>
                                                <span style={styles.detailLabel}>Collection</span>
                                                <span style={styles.detailValue}>{book.collection_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={styles.actionButtons}>
                            <button 
                                onClick={handleCartAction}
                                className={isInCart ? 'btn btn-outline' : 'btn btn-gold'}
                                style={styles.mainActionButton}
                                disabled={isLoadingAction}
                            >
                                {isLoadingAction ? (
                                    <div style={styles.buttonSpinner}></div>
                                ) : (
                                    <>
                                        {isInCart ? '✓ Added to Cart' : '🛒 Add to Cart'} • {formatPrice(book.price)}
                                    </>
                                )}
                            </button>
                            
                            <button 
                                onClick={handleBuyNow}
                                className="btn"
                                style={styles.secondaryActionButton}
                                disabled={isLoadingAction}
                            >
                                ⚡ Buy Now
                            </button>
                            
                            <button 
                                onClick={handleWishlistAction}
                                className="btn"
                                style={{
                                    ...styles.tertiaryActionButton,
                                    ...(isInWishlist && styles.wishlistActive)
                                }}
                                disabled={isLoadingAction}
                            >
                                {isInWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                            </button>
                        </div>

                        {/* Guarantee Section */}
                        <div style={styles.guaranteeSection}>
                            <h4 style={styles.guaranteeTitle}>🛡️ Shopping with Confidence</h4>
                            <div style={styles.guaranteeGrid}>
                                <div style={styles.guaranteeItem}>
                                    <span style={styles.guaranteeIcon}>🔒</span>
                                    <span style={styles.guaranteeText}>Secure Payment</span>
                                </div>
                                <div style={styles.guaranteeItem}>
                                    <span style={styles.guaranteeIcon}>📦</span>
                                    <span style={styles.guaranteeText}>Quality Checked</span>
                                </div>
                                <div style={styles.guaranteeItem}>
                                    <span style={styles.guaranteeIcon}>↩️</span>
                                    <span style={styles.guaranteeText}>30-Day Returns</span>
                                </div>
                                <div style={styles.guaranteeItem}>
                                    <span style={styles.guaranteeIcon}>📞</span>
                                    <span style={styles.guaranteeText}>Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Books Section */}
                {similarBooks.length > 0 && (
                    <section style={styles.similarSection}>
                        <div style={styles.similarHeader}>
                            <h2 style={styles.similarTitle}>Similar Books in {book.category}</h2>
                            <Link 
                                to={`/category/${book.category.toLowerCase().replace(/\s+/g, '-')}`}
                                style={styles.viewAllLink}
                            >
                                View All →
                            </Link>
                        </div>
                        
                        <div style={styles.similarBooksGrid}>
                            {similarBooks.map(similarBook => (
                                <div key={similarBook.id} style={styles.similarBookCard}>
                                    <Link to={`/book/${similarBook.id}`} style={styles.similarBookLink}>
                                        <img
                                            src={getBookImage(similarBook.image_url, similarBook.title)}
                                            alt={similarBook.title}
                                            style={styles.similarBookImage}
                                            onError={(e) => handleImageError(e, similarBook.title)}
                                        />
                                        <div style={styles.similarBookInfo}>
                                            <h4 style={styles.similarBookTitle}>{similarBook.title}</h4>
                                            <p style={styles.similarBookAuthor}>{similarBook.author}</p>
                                            <div style={styles.similarBookMeta}>
                                                <span style={styles.similarBookPrice}>
                                                    {formatPrice(similarBook.price)}
                                                </span>
                                                <span style={styles.similarBookCondition}>
                                                    {similarBook.condition || 'Good'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* CTA Section */}
            <section className="blue-bg" style={styles.ctaSection}>
                <div className="container">
                    <div style={styles.ctaContent}>
                        <h2 style={styles.ctaTitle}>Ready to Get This Book?</h2>
                        <p style={styles.ctaText}>
                            Add to cart or contact the seller directly. Your next great read is waiting!
                        </p>
                        <div style={styles.ctaButtons}>
                            <button 
                                onClick={handleCartAction}
                                className="btn btn-gold"
                                style={styles.ctaButton}
                                disabled={isLoadingAction}
                            >
                                {isLoadingAction ? 'Processing...' : (isInCart ? '✓ In Cart' : '🛒 Add to Cart')}
                            </button>
                            <button 
                                onClick={handleContactSeller}
                                className="btn"
                                style={styles.ctaSecondaryButton}
                            >
                                📧 Contact Seller
                            </button>
                            <Link to="/books" className="btn" style={styles.ctaBrowseButton}>
                                Browse More Books
                            </Link>
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
    
    // Alert
    alert: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        borderRadius: '8px',
    },
    alertIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    
    // Hero Section
    hero: {
        padding: '3rem 0',
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
        fontSize: '2.5rem',
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
        fontSize: '1.1rem',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '2.5rem',
        lineHeight: '1.6',
    },
    
    // Breadcrumb
    breadcrumb: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        padding: '1rem 0',
    },
    breadcrumbLink: {
        color: '#6b7280',
        textDecoration: 'none',
        fontSize: '0.9rem',
        transition: 'color 0.3s ease',
    },
    breadcrumbSeparator: {
        color: '#9ca3af',
        fontSize: '0.8rem',
    },
    breadcrumbCurrent: {
        color: '#1e3a8a',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    
    // Book Detail Grid
    bookDetailGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2.5rem',
        marginBottom: '3rem',
    },
    
    // Left Column
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    imageCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        padding: '1.5rem',
    },
    imageContainer: {
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        backgroundColor: '#f3f4f6',
    },
    bookImage: {
        width: '100%',
        height: 'auto',
        display: 'block',
        transition: 'transform 0.5s ease',
    },
    bookBadges: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1.5rem',
    },
    conditionBadge: {
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        textAlign: 'center',
        display: 'inline-block',
    },
    collectionBadge: {
        backgroundColor: '#f0f9ff',
        color: '#1e3a8a',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500',
        textAlign: 'center',
        display: 'inline-block',
    },
    quickStats: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    statIcon: {
        fontSize: '1.5rem',
        width: '40px',
        height: '40px',
        backgroundColor: '#f0f9ff',
        color: '#1e3a8a',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    statLabel: {
        display: 'block',
        color: '#6b7280',
        fontSize: '0.8rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    statValue: {
        display: 'block',
        color: '#1f2937',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    quickActionsCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem',
    },
    quickActionsTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1.5rem',
        fontWeight: '600',
    },
    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0.75rem',
    },
    quickActionButton: {
        padding: '0.75rem 1rem',
        fontSize: '0.95rem',
        fontWeight: '500',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        position: 'relative',
        minHeight: '44px',
    },
    buyNowButton: {
        padding: '0.75rem 1rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        backgroundColor: '#10b981',
        color: '#ffffff',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    contactButton: {
        padding: '0.75rem 1rem',
        fontSize: '0.95rem',
        fontWeight: '500',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    wishlistActive: {
        borderColor: '#fbbf24',
        color: '#fbbf24',
        backgroundColor: 'transparent',
    },
    buttonSpinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    
    // Right Column
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    bookHeader: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        padding: '2rem',
    },
    bookTitle: {
        fontSize: '2rem',
        color: '#1f2937',
        marginBottom: '0.5rem',
        fontWeight: '700',
        lineHeight: '1.3',
    },
    bookAuthor: {
        fontSize: '1.2rem',
        color: '#6b7280',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
    },
    priceSection: {
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
    },
    price: {
        fontSize: '2.5rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        fontWeight: '700',
    },
    priceDetails: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    priceNote: {
        color: '#6b7280',
        fontSize: '0.95rem',
    },
    stockStatus: {
        color: '#10b981',
        fontSize: '0.95rem',
        fontWeight: '500',
        backgroundColor: '#d1fae5',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
    },
    categoryTags: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    categoryTag: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
    },
    conditionTag: {
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    
    // Tabs
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '0.5rem',
    },
    tab: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#6b7280',
        transition: 'all 0.3s ease',
        borderRadius: '6px 6px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    activeTab: {
        color: '#1e3a8a',
        borderBottomColor: '#1e3a8a',
        backgroundColor: '#f0f9ff',
    },
    tabContent: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        padding: '2rem',
        minHeight: '300px',
    },
    
    // Tab Content Styles
    descriptionContent: {
        lineHeight: '1.6',
    },
    descriptionText: {
        color: '#4b5563',
        fontSize: '1.1rem',
        marginTop: '1rem',
        whiteSpace: 'pre-line',
    },
    noDescription: {
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
    },
    noDescriptionText: {
        color: '#6b7280',
        fontSize: '0.95rem',
        fontStyle: 'italic',
    },
    sellerContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    sellerInfoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
    },
    sellerInfoCard: {
        backgroundColor: '#f9fafb',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    sellerInfoLabel: {
        color: '#6b7280',
        fontSize: '0.85rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '0.5rem',
    },
    sellerInfoValue: {
        color: '#1f2937',
        fontSize: '1rem',
        fontWeight: '500',
    },
    sellerEmail: {
        color: '#1e3a8a',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.3s ease',
    },
    sellerContactCard: {
        backgroundColor: '#f0f9ff',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #bae6fd',
        textAlign: 'center',
    },
    sellerContactText: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginBottom: '1rem',
        lineHeight: '1.5',
    },
    sellerContactButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '500',
    },
    detailsContent: {},
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    detailLabel: {
        color: '#6b7280',
        fontSize: '0.85rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    detailValue: {
        color: '#1f2937',
        fontSize: '1rem',
        fontWeight: '500',
    },
    detailLink: {
        color: '#1e3a8a',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.3s ease',
    },
    
    // Action Buttons
    actionButtons: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    mainActionButton: {
        flex: 1,
        padding: '1rem 1.5rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        minWidth: '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        position: 'relative',
        minHeight: '54px',
    },
    secondaryActionButton: {
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        backgroundColor: '#10b981',
        color: '#ffffff',
        minWidth: '140px',
    },
    tertiaryActionButton: {
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        minWidth: '140px',
    },
    
    // Guarantee Section
    guaranteeSection: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem',
        marginTop: '1rem',
    },
    guaranteeTitle: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    guaranteeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
    },
    guaranteeItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
    },
    guaranteeIcon: {
        fontSize: '1.2rem',
    },
    guaranteeText: {
        color: '#4b5563',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    
    // Similar Books Section
    similarSection: {
        marginTop: '3rem',
        marginBottom: '2rem',
    },
    similarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    similarTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        margin: 0,
    },
    viewAllLink: {
        color: '#1e3a8a',
        fontSize: '0.95rem',
        fontWeight: '500',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
    },
    similarBooksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1.5rem',
    },
    similarBookCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
    },
    similarBookLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
    },
    similarBookImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
    },
    similarBookInfo: {
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    similarBookTitle: {
        fontSize: '1rem',
        color: '#1f2937',
        fontWeight: '600',
        lineHeight: '1.3',
        height: '2.6rem',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    similarBookAuthor: {
        color: '#6b7280',
        fontSize: '0.85rem',
    },
    similarBookMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.5rem',
    },
    similarBookPrice: {
        color: '#1e3a8a',
        fontWeight: '600',
        fontSize: '1rem',
    },
    similarBookCondition: {
        color: '#6b7280',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    
    // CTA Section
    ctaSection: {
        padding: '3rem 0',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        marginTop: '2rem',
    },
    ctaContent: {
        maxWidth: '800px',
        margin: '0 auto',
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
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    ctaBrowseButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: '#fbbf24',
        color: '#000000',
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
        animation: 'spin 1s linear infinite',
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
        color: '#991b1b',
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
    backButton: {
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
    browseButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        textAlign: 'center',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .book-image:hover {
        transform: scale(1.05);
    }
    
    .similar-book-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border-color: #1e3a8a;
    }
    
    .quick-action-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .main-action-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .secondary-action-button:hover:not(:disabled) {
        background-color: #0ea271 !important;
        transform: translateY(-2px);
    }
    
    .tertiary-action-button:hover:not(:disabled) {
        background-color: #e5e7eb !important;
        transform: translateY(-2px);
    }
    
    .tab:hover:not(.active) {
        color: #1e3a8a;
        background-color: #f0f9ff;
    }
    
    .category-tag:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .detail-link:hover,
    .seller-email:hover,
    .view-all-link:hover {
        color: #fbbf24 !important;
    }
    
    .breadcrumb-link:hover {
        color: #1e3a8a !important;
    }
    
    .cta-button:hover:not(:disabled) {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .cta-secondary-button:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        transform: translateY(-2px);
    }
    
    .cta-browse-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .guarantee-item:hover {
        background-color: #ffffff;
        border-color: #1e3a8a;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .seller-contact-button:hover:not(:disabled) {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .buy-now-button:hover:not(:disabled) {
        background-color: #0ea271 !important;
        transform: translateY(-2px);
    }
    
    .contact-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    @media (max-width: 992px) {
        .book-detail-grid {
            grid-template-columns: 1fr !important;
        }
        
        .left-column {
            max-width: 400px;
            margin: 0 auto;
        }
    }
    
    @media (max-width: 768px) {
        .hero-title {
            font-size: 2rem !important;
        }
        
        .book-title {
            font-size: 1.5rem !important;
        }
        
        .price {
            font-size: 2rem !important;
        }
        
        .tabs {
            flex-direction: column !important;
        }
        
        .tab {
            width: 100% !important;
            justify-content: center;
        }
        
        .action-buttons {
            flex-direction: column !important;
        }
        
        .similar-books-grid {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }
    
    @media (max-width: 480px) {
        .similar-books-grid {
            grid-template-columns: 1fr !important;
        }
        
        .cta-buttons {
            flex-direction: column !important;
            align-items: stretch !important;
        }
    }
`;
document.head.appendChild(styleSheet);

export default BookDetailPage;