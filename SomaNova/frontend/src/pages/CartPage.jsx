import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { getBookImage, handleImageError } from '../utils/imageUtils';
import '../styles/theme.css';

/**
 * Cart Page - Professional shopping cart for SomaNova
 */
const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [updatingItem, setUpdatingItem] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    // Check screen size for mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.getAll();
            
            if (response.success) {
                const items = response.data || [];
                setCartItems(items);
                setSelectedItems(items.map(item => item.id));
                setError('');
            } else {
                setError('Unable to load cart items. Please try again.');
            }
        } catch (err) {
            console.error('Cart fetch error:', err);
            setError('Error loading cart. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            setUpdatingItem(itemId);
            await cartAPI.remove(itemId);
            
            const updatedItems = cartItems.filter(item => item.id !== itemId);
            setCartItems(updatedItems);
            setSelectedItems(selectedItems.filter(id => id !== itemId));
            
            setSuccessMessage('Item removed from cart');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error removing item:', error);
            setError('Failed to remove item. Please try again.');
        } finally {
            setUpdatingItem(null);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }

        try {
            setUpdatingItem(itemId);
            const item = cartItems.find(item => item.id === itemId);
            
            if (item) {
                await cartAPI.remove(itemId);
                await cartAPI.add(item.book_id, newQuantity);
                fetchCartItems();
                setSuccessMessage('Quantity updated');
                setTimeout(() => setSuccessMessage(''), 2000);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            setError('Failed to update quantity. Please try again.');
        } finally {
            setUpdatingItem(null);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
            try {
                await cartAPI.clear();
                setCartItems([]);
                setSelectedItems([]);
                setSuccessMessage('Cart cleared successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Error clearing cart:', error);
                setError('Failed to clear cart. Please try again.');
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
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.id));
        }
    };

    const handleRemoveSelected = async () => {
        if (selectedItems.length === 0) return;
        
        if (window.confirm(`Remove ${selectedItems.length} selected item${selectedItems.length > 1 ? 's' : ''} from cart?`)) {
            try {
                for (const itemId of selectedItems) {
                    await cartAPI.remove(itemId);
                }
                
                const updatedItems = cartItems.filter(item => !selectedItems.includes(item.id));
                setCartItems(updatedItems);
                setSelectedItems([]);
                
                setSuccessMessage(`${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} removed`);
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Error removing selected items:', error);
                setError('Failed to remove selected items. Please try again.');
            }
        }
    };

    const handleProceedToCheckout = () => {
        if (selectedItems.length === 0) {
            setError('Please select at least one item to checkout');
            return;
        }
        
        navigate('/checkout', { state: { selectedItems } });
    };

    // Calculate totals for selected items
    const calculateTotals = () => {
        const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
        
        const subtotal = selectedCartItems.reduce((sum, item) => {
            const price = item.book?.price || 0;
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
        }, 0);

        const shipping = subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        return {
            subtotal,
            shipping,
            tax,
            total,
            itemCount: selectedCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
            selectedCount: selectedCartItems.length
        };
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

    const totals = calculateTotals();

    if (loading) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading your cart...</p>
                    <p style={styles.loadingSubtext}>Gathering your selected books</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h3 style={styles.errorTitle}>Error Loading Cart</h3>
                    <p style={styles.errorMessage}>{error}</p>
                    <div style={styles.errorActions}>
                        <button 
                            onClick={fetchCartItems} 
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
                            <span style={styles.badgeText}>🛒 Your Reading Cart</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Shopping Cart
                            <span style={styles.highlight}> Review & Checkout</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Review your selected books and proceed to checkout. 
                            Your next great read is just a few clicks away.
                        </p>
                    </div>
                </div>
            </section>

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
                {cartItems.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🛒</div>
                        <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
                        <p style={styles.emptyMessage}>
                            Add books to your cart and they'll appear here. Start your reading journey today!
                        </p>
                        <div style={styles.emptyActions}>
                            <Link to="/books" className="btn btn-gold" style={styles.emptyBrowseButton}>
                                Browse Books
                            </Link>
                            <Link to="/featured" className="btn" style={styles.featuredButton}>
                                View Featured Books
                            </Link>
                            <Link to="/wishlist" className="btn btn-outline" style={styles.wishlistButton}>
                                View Wishlist
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cart Summary */}
                        {isMobile && (
                            <div style={styles.mobileSummary}>
                                <div style={styles.mobileSummaryContent}>
                                    <div style={styles.mobileSummaryRow}>
                                        <span>Items:</span>
                                        <span>{totals.selectedCount} selected</span>
                                    </div>
                                    <div style={styles.mobileSummaryRow}>
                                        <span>Total:</span>
                                        <span style={styles.mobileTotal}>{formatPrice(totals.total)}</span>
                                    </div>
                                    <button 
                                        onClick={handleProceedToCheckout}
                                        className="btn btn-gold"
                                        style={styles.mobileCheckoutButton}
                                        disabled={selectedItems.length === 0}
                                    >
                                        Checkout ({selectedItems.length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions Bar */}
                        <div style={styles.actionsBar}>
                            <div style={styles.actionsBarLeft}>
                                <div style={styles.selectAllContainer}>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === cartItems.length}
                                        onChange={toggleSelectAll}
                                        style={styles.selectCheckbox}
                                    />
                                    <span style={styles.selectLabel}>
                                        {selectedItems.length > 0 
                                            ? `${selectedItems.length} of ${cartItems.length} selected` 
                                            : 'Select all items'}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={styles.actionsBarRight}>
                                {selectedItems.length > 0 && (
                                    <button 
                                        onClick={handleRemoveSelected}
                                        className="btn btn-outline"
                                        style={styles.removeSelectedButton}
                                        disabled={updatingItem}
                                    >
                                        {updatingItem ? 'Processing...' : '🗑️ Remove Selected'}
                                    </button>
                                )}
                                <button 
                                    onClick={handleClearCart}
                                    className="btn btn-outline"
                                    style={styles.clearButton}
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* Cart Layout */}
                        <div style={styles.cartLayout}>
                            {/* Cart Items */}
                            <div style={styles.cartItemsSection}>
                                <h2 style={styles.sectionTitle}>
                                    Cart Items ({cartItems.length})
                                </h2>
                                
                                <div style={styles.cartItemsList}>
                                    {cartItems.map((item) => {
                                        const book = item.book || {};
                                        const quantity = item.quantity || 1;
                                        const itemTotal = (book.price || 0) * quantity;
                                        const isSelected = selectedItems.includes(item.id);
                                        
                                        return (
                                            <div 
                                                key={item.id} 
                                                className="cart-item-card" 
                                                style={{
                                                    ...styles.cartItemCard,
                                                    borderColor: isSelected ? '#1e3a8a' : '#e5e7eb',
                                                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff'
                                                }}
                                            >
                                                {/* Mobile Compact View */}
                                                {isMobile ? (
                                                    <div style={styles.mobileCartItem}>
                                                        <div style={styles.mobileItemHeader}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleItemSelection(item.id)}
                                                                style={styles.mobileItemCheckbox}
                                                            />
                                                            <div style={styles.mobileItemInfo}>
                                                                <Link to={`/book/${book.id}`} style={styles.mobileItemTitle}>
                                                                    {book.title}
                                                                </Link>
                                                                <p style={styles.mobileItemAuthor}>by {book.author || 'Unknown Author'}</p>
                                                            </div>
                                                            <div style={styles.mobileItemPrice}>
                                                                {formatPrice(itemTotal)}
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={styles.mobileItemDetails}>
                                                            <div style={styles.mobileItemImageContainer}>
                                                                <img
                                                                    src={getBookImage(book.image_url, book.title)}
                                                                    alt={book.title}
                                                                    style={styles.mobileItemImage}
                                                                    onError={(e) => handleImageError(e, book.title)}
                                                                />
                                                            </div>
                                                            
                                                            <div style={styles.mobileItemControls}>
                                                                <div style={styles.mobileQuantityControls}>
                                                                    <button 
                                                                        onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                                                                        disabled={updatingItem === item.id || quantity <= 1}
                                                                        style={styles.mobileQuantityButton}
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span style={styles.mobileQuantity}>{quantity}</span>
                                                                    <button 
                                                                        onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                                                                        disabled={updatingItem === item.id}
                                                                        style={styles.mobileQuantityButton}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                                
                                                                <div style={styles.mobileItemMeta}>
                                                                    <span style={styles.mobileCategory}>{book.category || 'General'}</span>
                                                                    <span style={styles.mobileUnitPrice}>
                                                                        {formatPrice(book.price || 0)} each
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={styles.mobileItemActions}>
                                                            <button 
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="btn btn-outline"
                                                                style={styles.mobileRemoveButton}
                                                                disabled={updatingItem === item.id}
                                                            >
                                                                {updatingItem === item.id ? 'Removing...' : 'Remove'}
                                                            </button>
                                                            <Link 
                                                                to={`/book/${book.id}`}
                                                                className="btn"
                                                                style={styles.mobileViewButton}
                                                            >
                                                                View
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Desktop View */
                                                    <>
                                                        <div style={styles.cartItemHeader}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleItemSelection(item.id)}
                                                                style={styles.itemCheckbox}
                                                            />
                                                            <span style={styles.itemStatus}>
                                                                {book.condition || 'Good'} Condition
                                                            </span>
                                                        </div>
                                                        
                                                        <div style={styles.cartItemContent}>
                                                            <div style={styles.cartItemImageContainer}>
                                                                <Link to={`/book/${book.id}`}>
                                                                    <img
                                                                        src={getBookImage(book.image_url, book.title)}
                                                                        alt={book.title}
                                                                        style={styles.itemImage}
                                                                        onError={(e) => handleImageError(e, book.title)}
                                                                    />
                                                                </Link>
                                                            </div>
                                                            
                                                            <div style={styles.cartItemDetails}>
                                                                <div style={styles.cartItemInfo}>
                                                                    <Link to={`/book/${book.id}`} style={styles.itemTitleLink}>
                                                                        <h3 style={styles.itemTitle}>{book.title}</h3>
                                                                    </Link>
                                                                    <p style={styles.itemAuthor}>by {book.author || 'Unknown Author'}</p>
                                                                    
                                                                    <div style={styles.itemMeta}>
                                                                        <span style={styles.itemCategory}>{book.category || 'General'}</span>
                                                                        <span style={styles.itemISBN}>ISBN: {book.isbn || 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div style={styles.cartItemControls}>
                                                                    <div style={styles.quantitySection}>
                                                                        <div style={styles.quantityControls}>
                                                                            <button 
                                                                                onClick={() => handleUpdateQuantity(item.id, quantity - 1)}
                                                                                disabled={updatingItem === item.id || quantity <= 1}
                                                                                style={styles.quantityButton}
                                                                            >
                                                                                −
                                                                            </button>
                                                                            <span style={styles.quantity}>{quantity}</span>
                                                                            <button 
                                                                                onClick={() => handleUpdateQuantity(item.id, quantity + 1)}
                                                                                disabled={updatingItem === item.id}
                                                                                style={styles.quantityButton}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        
                                                                        <div style={styles.priceBreakdown}>
                                                                            <span style={styles.unitPrice}>
                                                                                {formatPrice(book.price || 0)} each
                                                                            </span>
                                                                            <span style={styles.totalPrice}>
                                                                                Total: {formatPrice(itemTotal)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div style={styles.cartItemActions}>
                                                                <div style={styles.itemPrice}>
                                                                    {formatPrice(itemTotal)}
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    className="btn btn-outline"
                                                                    style={styles.removeButton}
                                                                    disabled={updatingItem === item.id}
                                                                >
                                                                    {updatingItem === item.id ? 'Removing...' : 'Remove'}
                                                                </button>
                                                                <Link 
                                                                    to={`/book/${book.id}`}
                                                                    className="btn"
                                                                    style={styles.viewButton}
                                                                >
                                                                    View Details
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Order Summary - Hidden on Mobile except in sticky bar */}
                            {!isMobile && (
                                <div style={styles.orderSummarySection}>
                                    <div style={styles.orderSummaryCard}>
                                        <h2 style={styles.summaryTitle}>Order Summary</h2>
                                        
                                        <div style={styles.summaryDetails}>
                                            <div style={styles.summaryRow}>
                                                <span style={styles.summaryLabel}>Items ({totals.itemCount}):</span>
                                                <span style={styles.summaryValue}>{formatPrice(totals.subtotal)}</span>
                                            </div>
                                            
                                            <div style={styles.summaryRow}>
                                                <span style={styles.summaryLabel}>Shipping:</span>
                                                <span style={styles.summaryValue}>
                                                    {totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}
                                                </span>
                                            </div>
                                            
                                            <div style={styles.summaryRow}>
                                                <span style={styles.summaryLabel}>Tax (8%):</span>
                                                <span style={styles.summaryValue}>{formatPrice(totals.tax)}</span>
                                            </div>
                                            
                                            {totals.shipping === 0 && totals.subtotal > 0 && (
                                                <div style={styles.freeShipping}>
                                                    🎉 Free shipping on orders over $50!
                                                </div>
                                            )}
                                            
                                            <div style={styles.summaryTotal}>
                                                <span style={styles.totalLabel}>Total</span>
                                                <span style={styles.totalValue}>{formatPrice(totals.total)}</span>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.checkoutNote}>
                                            <div style={styles.noteIcon}>💳</div>
                                            <div>
                                                <strong>Secure checkout</strong>
                                                <p style={styles.noteText}>All transactions are encrypted and secure</p>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={handleProceedToCheckout}
                                            className="btn btn-gold"
                                            style={styles.checkoutButton}
                                            disabled={selectedItems.length === 0}
                                        >
                                            Proceed to Checkout ({selectedItems.length})
                                        </button>
                                        
                                        <div style={styles.paymentMethods}>
                                            <span style={styles.paymentLabel}>We accept:</span>
                                            <div style={styles.paymentIcons}>
                                                <span style={styles.paymentIcon}>💳</span>
                                                <span style={styles.paymentIcon}>🏦</span>
                                                <span style={styles.paymentIcon}>📱</span>
                                                <span style={styles.paymentIcon}>🔗</span>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.continueLinks}>
                                            <Link to="/books" style={styles.continueLink}>
                                                ← Continue Shopping
                                            </Link>
                                            <Link to="/wishlist" style={styles.wishlistLink}>
                                                View Wishlist →
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    {/* Promo Code */}
                                    <div style={styles.promoCard}>
                                        <h3 style={styles.promoTitle}>🎁 Have a Promo Code?</h3>
                                        <div style={styles.promoForm}>
                                            <input
                                                type="text"
                                                placeholder="Enter promo code"
                                                style={styles.promoInput}
                                            />
                                            <button className="btn" style={styles.promoButton}>
                                                Apply
                                            </button>
                                        </div>
                                        <p style={styles.promoNote}>
                                            * Promo codes can be applied at checkout
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Bottom Checkout Bar */}
                        {isMobile && cartItems.length > 0 && (
                            <div style={styles.mobileBottomBar}>
                                <div style={styles.mobileBottomContent}>
                                    <div style={styles.mobileBottomInfo}>
                                        <span style={styles.mobileBottomLabel}>Total ({selectedItems.length} items):</span>
                                        <span style={styles.mobileBottomTotal}>{formatPrice(totals.total)}</span>
                                    </div>
                                    <button 
                                        onClick={handleProceedToCheckout}
                                        className="btn btn-gold"
                                        style={styles.mobileBottomButton}
                                        disabled={selectedItems.length === 0}
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        paddingBottom: '80px', // Space for mobile bottom bar
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
        padding: '0 1rem',
    },
    
    // Success Alert
    successAlert: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        borderRadius: '8px',
        fontSize: '0.95rem',
    },
    successIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    
    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        margin: '1rem 0',
    },
    emptyIcon: {
        fontSize: '3.5rem',
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
        fontSize: '1.1rem',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    emptyActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
    },
    emptyBrowseButton: {
        padding: '0.75rem 1.5rem',
        width: '100%',
        maxWidth: '300px',
    },
    featuredButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        width: '100%',
        maxWidth: '300px',
    },
    wishlistButton: {
        padding: '0.75rem 1.5rem',
        borderColor: '#1e3a8a',
        color: '#1e3a8a',
        width: '100%',
        maxWidth: '300px',
    },
    
    // Mobile Summary
    mobileSummary: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '1.5rem',
        padding: '1.5rem',
    },
    mobileSummaryContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    mobileSummaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mobileTotal: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1e3a8a',
    },
    mobileCheckoutButton: {
        width: '100%',
        padding: '1rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        marginTop: '0.5rem',
    },
    
    // Actions Bar
    actionsBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem',
        border: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    actionsBarLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flex: 1,
    },
    actionsBarRight: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    selectAllContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    selectCheckbox: {
        width: '20px',
        height: '20px',
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
        whiteSpace: 'nowrap',
    },
    clearButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
    },
    
    // Cart Layout
    cartLayout: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
    },
    
    // Cart Items Section
    cartItemsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        paddingLeft: '0.5rem',
    },
    cartItemsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    
    // Cart Item Card
    cartItemCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
    },
    
    // Desktop Cart Item
    cartItemHeader: {
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
    itemStatus: {
        color: '#6b7280',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    cartItemContent: {
        padding: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: '1.5rem',
        alignItems: 'start',
    },
    cartItemImageContainer: {
        width: '100px',
        height: '150px',
        flexShrink: 0,
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    cartItemDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    cartItemInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    itemTitleLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
    itemTitle: {
        fontSize: '1.2rem',
        color: '#1f2937',
        fontWeight: '600',
        lineHeight: '1.3',
        marginBottom: '0.25rem',
    },
    itemAuthor: {
        color: '#6b7280',
        fontSize: '0.95rem',
    },
    itemMeta: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    itemCategory: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    itemISBN: {
        color: '#6b7280',
        fontSize: '0.85rem',
    },
    cartItemControls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    quantitySection: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    quantityButton: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '1px solid #d1d5db',
        backgroundColor: '#ffffff',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    },
    quantity: {
        width: '40px',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: '600',
    },
    priceBreakdown: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    unitPrice: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    totalPrice: {
        color: '#1e3a8a',
        fontSize: '1.1rem',
        fontWeight: '600',
    },
    cartItemActions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '1rem',
        minWidth: '140px',
    },
    itemPrice: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#1e3a8a',
    },
    removeButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        width: '100%',
    },
    viewButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        width: '100%',
        textAlign: 'center',
        textDecoration: 'none',
    },
    
    // Mobile Cart Item
    mobileCartItem: {
        padding: '1rem',
    },
    mobileItemHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    mobileItemCheckbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        marginTop: '2px',
    },
    mobileItemInfo: {
        flex: 1,
    },
    mobileItemTitle: {
        fontSize: '1.1rem',
        color: '#1f2937',
        fontWeight: '600',
        textDecoration: 'none',
        lineHeight: '1.3',
        marginBottom: '0.25rem',
        display: 'block',
    },
    mobileItemAuthor: {
        color: '#6b7280',
        fontSize: '0.9rem',
        margin: 0,
    },
    mobileItemPrice: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#1e3a8a',
    },
    mobileItemDetails: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
    },
    mobileItemImageContainer: {
        width: '80px',
        height: '120px',
        flexShrink: 0,
    },
    mobileItemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    mobileItemControls: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    mobileQuantityControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    mobileQuantityButton: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1px solid #d1d5db',
        backgroundColor: '#ffffff',
        fontSize: '1.2rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
    },
    mobileQuantity: {
        fontSize: '1.1rem',
        fontWeight: '600',
        minWidth: '30px',
        textAlign: 'center',
    },
    mobileItemMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    mobileCategory: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    mobileUnitPrice: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    mobileItemActions: {
        display: 'flex',
        gap: '0.75rem',
    },
    mobileRemoveButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        flex: 1,
    },
    mobileViewButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textDecoration: 'none',
        textAlign: 'center',
        flex: 1,
    },
    
    // Order Summary Section
    orderSummarySection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    orderSummaryCard: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
    },
    summaryTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    summaryDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#6b7280',
        fontSize: '1rem',
    },
    summaryValue: {
        color: '#1f2937',
        fontSize: '1rem',
        fontWeight: '500',
    },
    freeShipping: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: '0.5rem',
    },
    summaryTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '2px solid #e5e7eb',
    },
    totalLabel: {
        fontSize: '1.3rem',
        color: '#1e3a8a',
        fontWeight: '600',
    },
    totalValue: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        fontWeight: '700',
    },
    checkoutNote: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd',
        marginBottom: '1.5rem',
    },
    noteIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    noteText: {
        color: '#6b7280',
        fontSize: '0.9rem',
        marginTop: '0.25rem',
    },
    checkoutButton: {
        width: '100%',
        padding: '1rem',
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
    },
    paymentMethods: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '1.5rem',
    },
    paymentLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    paymentIcons: {
        display: 'flex',
        gap: '0.5rem',
    },
    paymentIcon: {
        fontSize: '1.2rem',
    },
    continueLinks: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    continueLink: {
        color: '#1e3a8a',
        fontSize: '0.95rem',
        textDecoration: 'none',
        textAlign: 'center',
        padding: '0.5rem',
    },
    wishlistLink: {
        color: '#6b7280',
        fontSize: '0.95rem',
        textDecoration: 'none',
        textAlign: 'center',
        padding: '0.5rem',
    },
    
    // Promo Card
    promoCard: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
    },
    promoTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    promoForm: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.75rem',
    },
    promoInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '0.95rem',
    },
    promoButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        whiteSpace: 'nowrap',
    },
    promoNote: {
        color: '#9ca3af',
        fontSize: '0.85rem',
        fontStyle: 'italic',
        margin: 0,
    },
    
    // Mobile Bottom Bar
    mobileBottomBar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        padding: '1rem',
    },
    mobileBottomContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
    },
    mobileBottomInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    mobileBottomLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    mobileBottomTotal: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#1e3a8a',
    },
    mobileBottomButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
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
    
    .cart-item-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .quantity-button:hover:not(:disabled),
    .mobile-quantity-button:hover:not(:disabled) {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
        border-color: #1e3a8a !important;
        transform: scale(1.1);
    }
    
    .remove-button:hover:not(:disabled),
    .mobile-remove-button:hover:not(:disabled) {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        background-color: #fef2f2 !important;
    }
    
    .remove-selected-button:hover:not(:disabled) {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        background-color: #fef2f2 !important;
        transform: translateY(-2px);
    }
    
    .clear-button:hover {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
        background-color: #fef2f2 !important;
        transform: translateY(-2px);
    }
    
    .checkout-button:hover:not(:disabled),
    .mobile-checkout-button:hover:not(:disabled),
    .mobile-bottom-button:hover:not(:disabled) {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .promo-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .view-button:hover,
    .mobile-view-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .continue-link:hover,
    .wishlist-link:hover {
        color: #fbbf24 !important;
        text-decoration: underline;
    }
    
    @media (min-width: 768px) {
        .cart-layout {
            grid-template-columns: 2fr 1fr !important;
        }
    }
    
    @media (max-width: 767px) {
        .hero-title {
            font-size: 2rem !important;
        }
        
        .hero-subtitle {
            font-size: 1rem !important;
        }
        
        .actions-bar {
            flex-direction: column !important;
            align-items: stretch !important;
        }
        
        .actions-bar-left,
        .actions-bar-right {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
        }
        
        .mobile-item-actions {
            flex-direction: column !important;
        }
    }
`;
document.head.appendChild(styleSheet);

export default CartPage;