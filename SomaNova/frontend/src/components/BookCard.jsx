import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI, wishlistAPI } from '../services/api';
import '../styles/theme.css';

/**
 * Book Card component for displaying book previews
 * @param {object} props - Component props
 * @param {object} props.book - Book data
 * @param {boolean} props.showActions - Whether to show cart/wishlist actions
 */
const BookCard = ({ book, showActions = true }) => {
    const [isInCart, setIsInCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get book image URL - use default if no image or image failed to load
    const getBookImage = () => {
        if (imageError || !book.image_url || book.image_url.trim() === '') {
            return getDefaultCover();
        }
        return book.image_url;
    };

    // Generate default book cover SVG if no image URL
    const getDefaultCover = () => {
        const title = book.title || 'Book Cover';
        const encodedTitle = encodeURIComponent(title.substring(0, 20));
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231e3a8a'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='16' fill='%23fbbf24' text-anchor='middle' dominant-baseline='middle'%3E${encodedTitle}%3C/text%3E%3C/svg%3E`;
    };

    // Format price with 2 decimal places
    const formattedPrice = book.price ? `$${book.price.toFixed(2)}` : '$0.00';

    // Check if book is in cart or wishlist
    useEffect(() => {
        const checkBookStatus = async () => {
            try {
                const [cartResponse, wishlistResponse] = await Promise.all([
                    cartAPI.getAll(),
                    wishlistAPI.getAll()
                ]);
                
                if (cartResponse.success) {
                    const inCart = cartResponse.data.some(item => item.book_id === book.id);
                    setIsInCart(inCart);
                    setCartCount(cartResponse.data.length);
                }
                
                if (wishlistResponse.success) {
                    const inWishlist = wishlistResponse.data.some(item => item.book_id === book.id);
                    setIsInWishlist(inWishlist);
                }
            } catch (error) {
                console.error('Error checking book status:', error);
            }
        };

        if (showActions) {
            checkBookStatus();
        }
    }, [book.id, showActions]);

    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
    };

    // Handle add to cart
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            if (isInCart) {
                // First get the cart item ID
                const cartResponse = await cartAPI.getAll();
                if (cartResponse.success) {
                    const cartItem = cartResponse.data.find(item => item.book_id === book.id);
                    if (cartItem) {
                        await cartAPI.remove(cartItem.id);
                        setIsInCart(false);
                        setCartCount(prev => Math.max(0, prev - 1));
                    }
                }
            } else {
                await cartAPI.add(book.id, 1);
                setIsInCart(true);
                setCartCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert(`Failed to ${isInCart ? 'remove from' : 'add to'} cart: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle add to wishlist
    const handleAddToWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            if (isInWishlist) {
                // First get the wishlist item ID
                const wishlistResponse = await wishlistAPI.getAll();
                if (wishlistResponse.success) {
                    const wishlistItem = wishlistResponse.data.find(item => item.book_id === book.id);
                    if (wishlistItem) {
                        await wishlistAPI.remove(wishlistItem.id);
                        setIsInWishlist(false);
                    }
                }
            } else {
                await wishlistAPI.add(book.id);
                setIsInWishlist(true);
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
            alert(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle card click - make sure buttons don't trigger navigation
    const handleCardClick = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <Link 
            to={`/book/${book.id}`} 
            style={styles.cardLink}
            onClick={handleCardClick}
        >
            <div className="card" style={styles.card}>
                {/* Book Image */}
                <div style={styles.imageContainer}>
                    <img
                        src={getBookImage()}
                        alt={book.title}
                        style={styles.image}
                        onError={handleImageError}
                        loading="lazy"
                    />
                </div>

                {/* Book Info */}
                <div style={styles.content}>
                    <h3 style={styles.title} title={book.title}>
                        {book.title}
                    </h3>
                    <p style={styles.author}>by {book.author}</p>

                    {/* Category & Condition */}
                    <div style={styles.details}>
                        <span style={styles.category}>{book.category}</span>
                        <span style={styles.condition}>{book.condition}</span>
                    </div>

                    {/* Price & Actions */}
                    <div style={styles.footer}>
                        <span style={styles.price}>{formattedPrice}</span>
                        {showActions && (
                            <div style={styles.actions}>
                                <button 
                                    onClick={handleAddToCart}
                                    style={{
                                        ...styles.actionButton,
                                        ...(isInCart ? styles.inCartButton : {})
                                    }}
                                    disabled={isLoading}
                                    title={isInCart ? "Remove from Cart" : "Add to Cart"}
                                >
                                    {isInCart ? '✓' : '🛒'}
                                </button>
                                <button 
                                    onClick={handleAddToWishlist}
                                    style={{
                                        ...styles.actionButton,
                                        ...(isInWishlist ? styles.inWishlistButton : {})
                                    }}
                                    disabled={isLoading}
                                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                >
                                    {isInWishlist ? '❤️' : '🤍'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Inline styles for BookCard
const styles = {
    cardLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
        cursor: 'pointer',
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        ':hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
    },
    imageContainer: {
        height: '200px',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
        ':hover': {
            transform: 'scale(1.05)',
        },
    },
    content: {
        padding: '1.25rem',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#1e3a8a',
        lineHeight: 1.3,
        height: '2.6rem',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
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
        fontSize: '0.85rem',
    },
    category: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontWeight: '500',
        fontSize: '0.8rem',
    },
    condition: {
        color: '#6b7280',
        fontSize: '0.8rem',
    },
    footer: {
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    actionButton: {
        backgroundColor: '#f3f4f6',
        color: '#1e3a8a',
        border: 'none',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        ':hover': {
            transform: 'scale(1.1)',
        },
    },
    inCartButton: {
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    inWishlistButton: {
        backgroundColor: '#fbbf24',
        color: '#000000',
    },
};

export default BookCard;