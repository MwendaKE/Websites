import React from 'react';
import '../styles/theme.css';

/**
 * Footer Component
 * Fully responsive footer with mobile-first design
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="blue-bg footer" style={styles.footer}>
            <div className="container" style={styles.container}>
                {/* Top Section - Brand & Newsletter */}
                <div style={styles.topSection}>
                    {/* Brand Section */}
                    <div style={styles.brandSection}>
                        <div style={styles.brandHeader}>
                            <h2 style={styles.brandTitle}>SomaNova</h2>
                            <span style={styles.brandBadge}>📚</span>
                        </div>
                        <p style={styles.brandDescription}>
                            Your premier marketplace for affordable, pre-owned books. 
                            Discover timeless reads and hidden literary treasures.
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div style={styles.newsletterSection}>
                        <h4 style={styles.newsletterTitle}>Stay Updated</h4>
                        <p style={styles.newsletterText}>Get notified about new arrivals and deals</p>
                        <div style={styles.newsletterForm}>
                            <input 
                                type="email" 
                                placeholder="Your email address"
                                style={styles.newsletterInput}
                            />
                            <button type="submit" style={styles.newsletterButton}>
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Links Grid */}
                <div style={styles.linksGrid}>
                    {/* Shop Links */}
                    <div style={styles.linkColumn}>
                        <h3 style={styles.columnTitle}>
                            <span style={styles.columnIcon}>🛍️</span> Shop
                        </h3>
                        <ul style={styles.linkList}>
                            <li style={styles.listItem}><a href="/books" style={styles.linkItem}>All Books</a></li>
                            <li style={styles.listItem}><a href="/categories" style={styles.linkItem}>Categories</a></li>
                            <li style={styles.listItem}><a href="/featured" style={styles.linkItem}>Featured Books</a></li>
                            <li style={styles.listItem}><a href="/new-arrivals" style={styles.linkItem}>New Arrivals</a></li>
                            <li style={styles.listItem}><a href="/bestsellers" style={styles.linkItem}>Bestsellers</a></li>
                        </ul>
                    </div>

                    {/* Sell Links */}
                    <div style={styles.linkColumn}>
                        <h3 style={styles.columnTitle}>
                            <span style={styles.columnIcon}>💰</span> Sell
                        </h3>
                        <ul style={styles.linkList}>
                            <li style={styles.listItem}><a href="/sell" style={styles.linkItem}>Sell Your Books</a></li>
                            <li style={styles.listItem}><a href="/seller-guidelines" style={styles.linkItem}>Seller Guidelines</a></li>
                            <li style={styles.listItem}><a href="/pricing" style={styles.linkItem}>Pricing</a></li>
                            <li style={styles.listItem}><a href="/shipping" style={styles.linkItem}>Shipping Info</a></li>
                            <li style={styles.listItem}><a href="/seller-dashboard" style={styles.linkItem}>Seller Dashboard</a></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div style={styles.linkColumn}>
                        <h3 style={styles.columnTitle}>
                            <span style={styles.columnIcon}>🏢</span> Company
                        </h3>
                        <ul style={styles.linkList}>
                            <li style={styles.listItem}><a href="/about" style={styles.linkItem}>About Us</a></li>
                            <li style={styles.listItem}><a href="/contact" style={styles.linkItem}>Contact</a></li>
                            <li style={styles.listItem}><a href="/blog" style={styles.linkItem}>Blog</a></li>
                            <li style={styles.listItem}><a href="/careers" style={styles.linkItem}>Careers</a></li>
                            <li style={styles.listItem}><a href="/press" style={styles.linkItem}>Press</a></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div style={styles.linkColumn}>
                        <h3 style={styles.columnTitle}>
                            <span style={styles.columnIcon}>🛟</span> Support
                        </h3>
                        <ul style={styles.linkList}>
                            <li style={styles.listItem}><a href="/help-center" style={styles.linkItem}>Help Center</a></li>
                            <li style={styles.listItem}><a href="/faq" style={styles.linkItem}>FAQ</a></li>
                            <li style={styles.listItem}><a href="/shipping-policy" style={styles.linkItem}>Shipping Policy</a></li>
                            <li style={styles.listItem}><a href="/returns" style={styles.linkItem}>Returns & Refunds</a></li>
                            <li style={styles.listItem}><a href="/contact-support" style={styles.linkItem}>Contact Support</a></li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div style={styles.divider}></div>

                {/* Bottom Section */}
                <div style={styles.bottomSection}>
                    {/* Copyright & Legal */}
                    <div style={styles.bottomLeft}>
                        <p style={styles.copyright}>
                            © {currentYear} SomaNova Books. All rights reserved.
                        </p>
                        <div style={styles.legalLinks}>
                            <a href="/privacy" style={styles.legalLink}>Privacy Policy</a>
                            <span style={styles.linkSeparator}>•</span>
                            <a href="/terms" style={styles.legalLink}>Terms of Service</a>
                            <span style={styles.linkSeparator}>•</span>
                            <a href="/cookies" style={styles.legalLink}>Cookie Policy</a>
                        </div>
                    </div>

                    {/* Social & Credit */}
                    <div style={styles.bottomRight}>
                        <div style={styles.socialLinks}>
                            <a href="https://twitter.com/somanova" style={styles.socialLink} title="Twitter">
                                <span style={styles.socialIcon}>🐦</span>
                            </a>
                            <a href="https://facebook.com/somanova" style={styles.socialLink} title="Facebook">
                                <span style={styles.socialIcon}>📘</span>
                            </a>
                            <a href="https://instagram.com/somanova" style={styles.socialLink} title="Instagram">
                                <span style={styles.socialIcon}>📸</span>
                            </a>
                            <a href="https://pinterest.com/somanova" style={styles.socialLink} title="Pinterest">
                                <span style={styles.socialIcon}>📌</span>
                            </a>
                            <a href="https://youtube.com/somanova" style={styles.socialLink} title="YouTube">
                                <span style={styles.socialIcon}>🎬</span>
                            </a>
                        </div>
                        
                        <div style={styles.credit}>
                            <p style={styles.creditText}>
                                Made with <span style={styles.heart}>💛</span> for book lovers
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    // Main Footer
    footer: {
        padding: '3rem 0 1.5rem',
        marginTop: 'auto',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        borderTop: '3px solid #fbbf24',
        width: '100%',
    },
    container: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
    },
    
    // Top Section - Brand & Newsletter
    topSection: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '3rem',
        flexWrap: 'wrap',
        gap: '2rem',
    },
    brandSection: {
        flex: '1 1 300px',
        minWidth: '300px',
    },
    brandHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
    },
    brandTitle: {
        fontSize: '2rem',
        fontWeight: '800',
        color: '#ffffff',
        margin: 0,
        lineHeight: 1.2,
    },
    brandBadge: {
        fontSize: '1.8rem',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        padding: '0.5rem',
        borderRadius: '10px',
    },
    brandDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        margin: 0,
    },
    newsletterSection: {
        flex: '1 1 300px',
        minWidth: '300px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    newsletterTitle: {
        color: '#fbbf24',
        fontSize: '1.1rem',
        marginBottom: '0.5rem',
        fontWeight: '600',
        marginTop: 0,
    },
    newsletterText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        marginTop: 0,
    },
    newsletterForm: {
        display: 'flex',
        flexDirection: 'row',
        gap: '0.5rem',
    },
    newsletterInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        fontSize: '0.9rem',
        minWidth: '150px',
    },
    newsletterButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#fbbf24',
        color: '#000000',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontSize: '0.9rem',
    },
    
    // Links Grid
    linksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
        marginBottom: '3rem',
    },
    linkColumn: {
        display: 'flex',
        flexDirection: 'column',
    },
    columnTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: 0,
    },
    columnIcon: {
        fontSize: '1rem',
    },
    linkList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    listItem: {
        margin: 0,
        padding: 0,
    },
    linkItem: {
        color: 'rgba(255, 255, 255, 0.8)',
        textDecoration: 'none',
        fontSize: '0.9rem',
        padding: '0.25rem 0',
        display: 'block',
        transition: 'color 0.2s ease',
    },
    
    // Divider
    divider: {
        height: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: '2rem',
        width: '100%',
    },
    
    // Bottom Section
    bottomSection: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2rem',
        width: '100%',
    },
    bottomLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: '1 1 300px',
    },
    copyright: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.85rem',
        margin: 0,
        lineHeight: 1.4,
    },
    legalLinks: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
    },
    legalLink: {
        color: 'rgba(255, 255, 255, 0.8)',
        textDecoration: 'none',
        fontSize: '0.8rem',
        transition: 'color 0.2s ease',
        whiteSpace: 'nowrap',
    },
    linkSeparator: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.7rem',
    },
    
    // Social & Credit
    bottomRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '1rem',
        flex: '1 1 300px',
    },
    socialLinks: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'flex-end',
    },
    socialLink: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        flexShrink: 0,
    },
    socialIcon: {
        fontSize: '1rem',
    },
    credit: {
        textAlign: 'right',
    },
    creditText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.8rem',
        margin: 0,
        lineHeight: 1.4,
    },
    heart: {
        color: '#fbbf24',
        display: 'inline-block',
    },
};

// Create responsive CSS with proper media queries
const responsiveStyles = document.createElement('style');
responsiveStyles.textContent = `
    /* Mobile First Default Styles are already in the inline styles */
    
    /* Tablet: 768px and below */
    @media (max-width: 768px) {
        .footer .container {
            padding: 0 15px;
        }
        
        .top-section {
            flex-direction: column;
            align-items: stretch;
        }
        
        .brand-section, .newsletter-section {
            flex: 1 1 100%;
            min-width: 100%;
        }
        
        .links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
        }
        
        .link-column {
            align-items: center;
            text-align: center;
        }
        
        .column-title {
            justify-content: center;
        }
        
        .bottom-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .bottom-left, .bottom-right {
            align-items: center;
            flex: 1 1 100%;
        }
        
        .legal-links {
            justify-content: center;
        }
        
        .social-links {
            justify-content: center;
        }
        
        .credit {
            text-align: center;
        }
    }
    
    /* Mobile: 480px and below */
    @media (max-width: 480px) {
        .footer {
            padding: 2rem 0 1rem;
        }
        
        .container {
            padding: 0 10px;
        }
        
        .brand-title {
            font-size: 1.8rem;
        }
        
        .brand-badge {
            font-size: 1.5rem;
            padding: 0.4rem;
        }
        
        .brand-description {
            font-size: 0.9rem;
        }
        
        .newsletter-section {
            padding: 1rem;
        }
        
        .newsletter-title {
            font-size: 1rem;
        }
        
        .newsletter-text {
            font-size: 0.85rem;
        }
        
        .newsletter-form {
            flex-direction: column;
        }
        
        .newsletter-input {
            width: 100%;
            margin-bottom: 0.5rem;
        }
        
        .newsletter-button {
            width: 100%;
        }
        
        .links-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .link-column {
            align-items: center;
            text-align: center;
        }
        
        .column-title {
            font-size: 0.95rem;
            margin-bottom: 0.75rem;
        }
        
        .link-item {
            font-size: 0.85rem;
        }
        
        .copyright {
            font-size: 0.8rem;
            text-align: center;
        }
        
        .legal-link {
            font-size: 0.75rem;
        }
        
        .social-link {
            width: 32px;
            height: 32px;
        }
        
        .social-icon {
            font-size: 0.9rem;
        }
        
        .credit-text {
            font-size: 0.75rem;
        }
    }
    
    /* Small Mobile: 360px and below */
    @media (max-width: 360px) {
        .brand-title {
            font-size: 1.6rem;
        }
        
        .brand-description {
            font-size: 0.85rem;
        }
        
        .newsletter-title {
            font-size: 0.95rem;
        }
        
        .newsletter-text {
            font-size: 0.8rem;
        }
        
        .column-title {
            font-size: 0.9rem;
        }
        
        .link-item {
            font-size: 0.8rem;
        }
        
        .social-link {
            width: 28px;
            height: 28px;
        }
        
        .social-icon {
            font-size: 0.8rem;
        }
    }
    
    /* Hover Effects (Desktop only) */
    @media (hover: hover) {
        .link-item:hover {
            color: #fbbf24 !important;
        }
        
        .legal-link:hover {
            color: #ffffff !important;
        }
        
        .newsletter-button:hover {
            background-color: #f59e0b !important;
            transform: translateY(-1px);
        }
        
        .social-link:hover {
            background-color: #fbbf24 !important;
            transform: translateY(-2px);
        }
        
        .social-link:hover .social-icon {
            color: #1e3a8a !important;
        }
    }
    
    /* Animation for heart */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .heart {
        animation: pulse 1.5s infinite;
    }
`;

// Add styles to document
if (!document.querySelector('#footer-responsive-styles')) {
    responsiveStyles.id = 'footer-responsive-styles';
    document.head.appendChild(responsiveStyles);
}

export default Footer;