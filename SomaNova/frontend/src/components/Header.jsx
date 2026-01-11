import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import '../styles/theme.css';

/**
 * Header component with centered navigation
 */
const Header = () => {
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Fetch user info including cart/wishlist counts
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setLoading(true);
                const response = await userAPI.getInfo();
                if (response.success && response.data) {
                    setCartCount(response.data.cart_count || 0);
                    setWishlistCount(response.data.wishlist_count || 0);
                    
                    // Check admin status from localStorage
                    const adminFlag = localStorage.getItem('isAdmin') === 'true';
                    setIsAdmin(adminFlag);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchUserInfo, 30000);
        return () => clearInterval(interval);
    }, []);

    // Toggle admin mode (for development/testing)
    const toggleAdminMode = () => {
        const newAdminState = !isAdmin;
        setIsAdmin(newAdminState);
        localStorage.setItem('isAdmin', newAdminState.toString());
    };

    return (
        <header className="header" style={styles.header}>
            <div className="container">
                {/* Logo Section - Centered at top */}
                <div style={styles.logoSection}>
                    <Link to="/" className="logo-link">
                        <div style={styles.logoContent}>
                            <h1 style={styles.logoTitle}>SomaNova</h1>
                            <p style={styles.logoTagline}>Second-Hand Books Marketplace</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation Section - Centered below logo */}
                <nav style={styles.navigation}>
                    <div style={styles.navContainer}>
                        {/* Main Navigation Links */}
                        <div style={styles.navLinks}>
                            <Link to="/" className="nav-link">
                                <span style={styles.linkText}>Home</span>
                            </Link>
                            <Link to="/books" className="nav-link">
                                <span style={styles.linkText}>Books</span>
                            </Link>
                            <Link to="/categories" className="nav-link">
                                <span style={styles.linkText}>Categories</span>
                            </Link>
                            <Link to="/about" className="nav-link">
                                <span style={styles.linkText}>About</span>
                            </Link>
                            <Link to="/contact" className="nav-link">
                                <span style={styles.linkText}>Contact</span>
                            </Link>
                            
                            {/* Admin Dashboard Link (Conditional) */}
                            {isAdmin && (
                                <Link to="/admin" className="admin-nav-link">
                                    <span style={styles.adminLinkText}>
                                        <span style={styles.adminIcon}>👑</span> Admin
                                    </span>
                                </Link>
                            )}
                            
                            {/* Action Buttons & Icons */}
                            <div style={styles.actionButtons}>
                                {/* Cart with Badge */}
                                <Link to="/cart" className="icon-button">
                                    <div style={styles.iconWrapper}>
                                        <span style={styles.cartIcon}>🛒</span>
                                        {cartCount > 0 && (
                                            <span style={styles.countBadge}>{cartCount}</span>
                                        )}
                                        <span style={styles.iconLabel}>Cart</span>
                                    </div>
                                </Link>
                                
                                {/* Wishlist with Badge */}
                                <Link to="/wishlist" className="icon-button">
                                    <div style={styles.iconWrapper}>
                                        <span style={styles.heartIcon}>❤️</span>
                                        {wishlistCount > 0 && (
                                            <span style={styles.countBadge}>{wishlistCount}</span>
                                        )}
                                        <span style={styles.iconLabel}>Wishlist</span>
                                    </div>
                                </Link>
                                
                                {/* Sell Book Button */}
                                <Link to="/sell" className="sell-button">
                                    <span style={styles.sellButtonText}>
                                        <span style={styles.sellIcon}>📚</span> Sell Books
                                    </span>
                                </Link>
                                
                                {/* Admin Toggle (Development Only) */}
                                <button 
                                    onClick={toggleAdminMode}
                                    className="admin-toggle-button"
                                    style={styles.adminToggle}
                                    title={isAdmin ? "Exit Admin Mode" : "Enter Admin Mode"}
                                >
                                    {isAdmin ? '👑' : '⚙️'}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
};

const styles = {
    // Header Container
    header: {
        backgroundColor: '#1e3a8a',
        padding: '1.5rem 0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '2px solid rgba(251, 191, 36, 0.3)',
    },
    
    // Logo Section
    logoSection: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    logoContent: {
        display: 'inline-block',
        textAlign: 'center',
    },
    logoTitle: {
        fontSize: '2.8rem',
        fontWeight: '800',
        marginBottom: '0.5rem',
        color: '#ffffff',
        letterSpacing: '1px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    logoTagline: {
        fontSize: '1rem',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '300',
        letterSpacing: '0.5px',
        margin: 0,
    },
    
    // Navigation
    navigation: {
        width: '100%',
    },
    navContainer: {
        maxWidth: '1000px',
        margin: '0 auto',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    
    // Navigation Links
    linkText: {
        color: '#fbbf24',
        fontSize: '1.1rem',
        fontWeight: '600',
        padding: '0.5rem 0',
        position: 'relative',
        transition: 'all 0.3s ease',
    },
    adminLinkText: {
        color: '#000000',
        fontSize: '1.1rem',
        fontWeight: '600',
        backgroundColor: '#fbbf24',
        padding: '0.5rem 1.2rem',
        borderRadius: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
    },
    adminIcon: {
        fontSize: '1rem',
    },
    
    // Action Buttons Container
    actionButtons: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        marginLeft: '1rem',
        paddingLeft: '1.5rem',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    },
    
    // Icon Buttons
    iconWrapper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        transition: 'all 0.3s ease',
    },
    cartIcon: {
        fontSize: '1.6rem',
    },
    heartIcon: {
        fontSize: '1.6rem',
    },
    iconLabel: {
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: '0.25rem',
        fontWeight: '500',
    },
    
    // Count Badge
    countBadge: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: '#ef4444',
        color: '#ffffff',
        borderRadius: '50%',
        minWidth: '20px',
        height: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        border: '2px solid #1e3a8a',
    },
    
    // Sell Button
    sellButtonText: {
        color: '#000000',
        fontSize: '1rem',
        fontWeight: '600',
        backgroundColor: '#fbbf24',
        padding: '0.75rem 1.5rem',
        borderRadius: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
        transition: 'all 0.3s ease',
    },
    sellIcon: {
        fontSize: '1.1rem',
    },
    
    // Admin Toggle (Development Only)
    adminToggle: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
    },
};

// Add CSS styles for hover effects and interactions
const headerStyles = document.createElement('style');
headerStyles.textContent = `
    .logo-link {
        text-decoration: none;
        display: inline-block;
        transition: transform 0.3s ease;
    }
    
    .logo-link:hover {
        transform: scale(1.02);
    }
    
    .nav-link {
        text-decoration: none;
        position: relative;
    }
    
    .nav-link:hover .link-text {
        color: #ffffff !important;
    }
    
    .nav-link:hover .link-text::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #fbbf24;
        transform: scaleX(1);
        transition: transform 0.3s ease;
    }
    
    .admin-nav-link {
        text-decoration: none;
    }
    
    .admin-nav-link:hover .admin-link-text {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
    }
    
    .icon-button {
        text-decoration: none;
    }
    
    .icon-button:hover .icon-wrapper {
        color: #fbbf24 !important;
        transform: translateY(-2px);
    }
    
    .sell-button {
        text-decoration: none;
    }
    
    .sell-button:hover .sell-button-text {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
    }
    
    .admin-toggle-button:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
        transform: rotate(15deg) scale(1.1);
    }
    
    /* Responsive adjustments */
    @media (max-width: 992px) {
        .nav-links {
            gap: 1.5rem;
        }
        .action-buttons {
            gap: 1rem;
            margin-left: 0.5rem;
            padding-left: 0.5rem;
        }
    }
    
    @media (max-width: 768px) {
        .nav-links {
            gap: 1rem;
            flex-direction: column;
            align-items: center;
        }
        .action-buttons {
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 1rem;
            margin-top: 1rem;
            width: 100%;
            justify-content: center;
        }
    }
`;
document.head.appendChild(headerStyles);

export default Header;