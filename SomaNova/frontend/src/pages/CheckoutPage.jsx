import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkoutAPI, cartAPI, bookAPI } from '../services/api';
import { getBookImage, handleImageError } from '../utils/imageUtils';
import '../styles/theme.css';

/**
 * Checkout Page - Professional styling with full responsiveness
 */
const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const bookId = queryParams.get('book_id');
    
    const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [transaction, setTransaction] = useState(null);
    const [book, setBook] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    
    const [formData, setFormData] = useState({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        payment_method: 'cash',
        pickup_location: 'SomaNova Main Store - 123 Book St, Reading City',
        pickup_instructions: '',
        agree_terms: false,
        subscribe_newsletter: false
    });

    useEffect(() => {
        if (bookId) {
            fetchBookDetails();
        } else {
            fetchCartItems();
        }
    }, [bookId]);

    const fetchBookDetails = async () => {
        try {
            setLoading(true);
            const response = await bookAPI.getById(bookId);
            if (response.success) {
                setBook(response.data);
                setError('');
            } else {
                setError('Failed to load book details');
            }
        } catch (error) {
            setError('Error loading book. Please try again.');
            console.error('Book fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.getAll();
            if (response.success) {
                setCartItems(response.data || []);
                setError('');
            } else {
                setError('Failed to load cart items');
            }
        } catch (error) {
            setError('Error loading cart items. Please try again.');
            console.error('Cart fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (error && (name === 'buyer_name' || name === 'buyer_email')) {
            setError('');
        }
    };

    const calculateTotal = () => {
        if (book) {
            return book.price || 0;
        }
        return cartItems.reduce((sum, item) => {
            const itemPrice = item.book?.price || item.price || 0;
            const quantity = item.quantity || 1;
            return sum + (itemPrice * quantity);
        }, 0);
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

    const validateForm = () => {
        if (!formData.buyer_name.trim()) {
            setError('Please enter your full name');
            return false;
        }
        if (!formData.buyer_email.trim()) {
            setError('Please enter your email address');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.buyer_email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.agree_terms) {
            setError('You must agree to the terms and conditions');
            return false;
        }
        return true;
    };

    const handleCheckout = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const checkoutData = {
                book_id: book ? book.id : null,
                buyer_name: formData.buyer_name,
                buyer_email: formData.buyer_email,
                buyer_phone: formData.buyer_phone,
                transaction_amount: calculateTotal(),
                payment_method: formData.payment_method,
                pickup_location: formData.pickup_location,
                pickup_instructions: formData.pickup_instructions
            };
            
            console.log('Sending checkout data:', checkoutData);
            
            const response = await checkoutAPI.create(checkoutData);
            console.log('Checkout response:', response);
            
            if (response.success) {
                setTransaction(response.data);
                setStep(2);
                
                // Clear cart if checking out from cart
                if (!bookId && cartItems.length > 0) {
                    await cartAPI.clear();
                }
                
                setError('');
            } else {
                setError(response.message || 'Checkout failed. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setError(error.message || 'Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentComplete = async () => {
        setLoading(true);
        setError('');
        try {
            if (transaction) {
                const response = await checkoutAPI.complete(transaction.id);
                if (response.success) {
                    setTransaction(response.data);
                    setSuccess(true);
                    setStep(3);
                } else {
                    setError(response.message || 'Payment failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const pickupLocations = [
        'SomaNova Main Store - 123 Book St, Reading City',
        'Downtown Branch - 456 Library Ave, Booktown',
        'University Campus Store - 789 Academic Rd, College City',
        'Shipping to Address (Extra $5.99)'
    ];

    const paymentMethods = [
        { value: 'cash', label: '💵 Cash on Pickup', description: 'Pay when you collect your books' },
        { value: 'card', label: '💳 Credit/Debit Card', description: 'Secure online payment' },
        { value: 'mobile', label: '📱 Mobile Payment', description: 'Pay with mobile wallet' },
        { value: 'bank', label: '🏦 Bank Transfer', description: 'Direct bank transfer' }
    ];

    const renderOrderItems = () => {
        if (book) {
            return (
                <div key={book.id} style={styles.orderItem}>
                    <div style={styles.itemImage}>
                        <img
                            src={getBookImage(book.image_url, book.title)}
                            alt={book.title}
                            style={styles.itemImageSrc}
                            onError={(e) => handleImageError(e, book.title)}
                        />
                    </div>
                    <div style={styles.itemDetails}>
                        <h4 style={styles.itemTitle}>{book.title}</h4>
                        <p style={styles.itemAuthor}>by {book.author}</p>
                        <p style={styles.itemCategory}>{book.category}</p>
                    </div>
                    <div style={styles.itemPrice}>
                        <span style={styles.priceValue}>{formatPrice(book.price)}</span>
                    </div>
                </div>
            );
        } else {
            return cartItems.map(item => {
                const bookData = item.book || item;
                const quantity = item.quantity || 1;
                const totalPrice = (bookData.price || 0) * quantity;
                
                return (
                    <div key={item.id || bookData.id} style={styles.orderItem}>
                        <div style={styles.itemImage}>
                            <img
                                src={getBookImage(bookData.image_url, bookData.title)}
                                alt={bookData.title}
                                style={styles.itemImageSrc}
                                onError={(e) => handleImageError(e, bookData.title)}
                            />
                        </div>
                        <div style={styles.itemDetails}>
                            <h4 style={styles.itemTitle}>{bookData.title}</h4>
                            <p style={styles.itemAuthor}>by {bookData.author}</p>
                            <div style={styles.itemQuantity}>
                                <span style={styles.quantityLabel}>Quantity:</span>
                                <span style={styles.quantityValue}>{quantity}</span>
                            </div>
                        </div>
                        <div style={styles.itemPrice}>
                            <span style={styles.priceValue}>{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                );
            });
        }
    };

    const renderInstructionsList = () => {
        const items = [
            `Save your Transaction ID: ${transaction?.id}`,
            'Go to pickup location within 7 days',
            'Bring your ID and transaction reference',
            'Complete payment on pickup',
            'Collect your book(s)!'
        ];

        return items.map((item, index) => (
            <li key={index} style={styles.instructionsListItem}>
                {item}
            </li>
        ));
    };

    const getWindowWidth = () => {
        return window.innerWidth;
    };

    const isMobile = getWindowWidth() < 768;

    if (loading && !book && !cartItems.length) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading checkout...</p>
                    <p style={styles.loadingSubtext}>Preparing your order details</p>
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
                            <span style={styles.badgeText}>🛒 Secure Checkout</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Complete Your
                            <span style={styles.highlight}> Purchase</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Follow these simple steps to complete your book purchase. 
                            Your pre-loved books are waiting for you!
                        </p>
                    </div>
                </div>
            </section>

            {/* Progress Steps */}
            <section className="container mt-5">
                <div style={styles.progressSteps}>
                    <div style={isMobile ? styles.mobileSteps : styles.stepsContainer}>
                        <div style={{...styles.step, ...(step >= 1 ? styles.activeStep : {})}}>
                            <div style={styles.stepNumber}>1</div>
                            {!isMobile && (
                                <div style={styles.stepContent}>
                                    <h4 style={styles.stepTitle}>Your Details</h4>
                                    <p style={styles.stepDescription}>Enter contact information</p>
                                </div>
                            )}
                        </div>
                        <div style={styles.stepConnector}></div>
                        <div style={{...styles.step, ...(step >= 2 ? styles.activeStep : {})}}>
                            <div style={styles.stepNumber}>2</div>
                            {!isMobile && (
                                <div style={styles.stepContent}>
                                    <h4 style={styles.stepTitle}>Review Order</h4>
                                    <p style={styles.stepDescription}>Confirm your purchase</p>
                                </div>
                            )}
                        </div>
                        <div style={styles.stepConnector}></div>
                        <div style={{...styles.step, ...(step >= 3 ? styles.activeStep : {})}}>
                            <div style={styles.stepNumber}>3</div>
                            {!isMobile && (
                                <div style={styles.stepContent}>
                                    <h4 style={styles.stepTitle}>Confirmation</h4>
                                    <p style={styles.stepDescription}>Get your receipt</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Error Alert */}
            {error && (
                <section className="container mt-4">
                    <div className="alert alert-error" style={styles.alert}>
                        <div style={styles.alertIcon}>⚠️</div>
                        <div style={styles.alertContent}>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                </section>
            )}

            {/* Step 1: Checkout Form */}
            {step === 1 && (
                <section className="container mt-5">
                    <div style={styles.checkoutCard}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Buyer Information</h2>
                            <p style={styles.cardSubtitle}>Please fill in your details to proceed</p>
                        </div>
                        
                        <div style={isMobile ? styles.mobileFormGrid : styles.formGrid}>
                            <div style={styles.formSection}>
                                <h3 style={styles.sectionTitle}>Contact Details</h3>
                                
                                <div className="form-group">
                                    <label className="form-label" htmlFor="buyer_name">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="buyer_name"
                                        name="buyer_name"
                                        value={formData.buyer_name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        required
                                        style={styles.input}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="buyer_email">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="buyer_email"
                                        name="buyer_email"
                                        value={formData.buyer_email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="you@example.com"
                                        required
                                        style={styles.input}
                                    />
                                    <small style={styles.helperText}>
                                        Order confirmation will be sent to this email
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="buyer_phone">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="buyer_phone"
                                        name="buyer_phone"
                                        value={formData.buyer_phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="(123) 456-7890"
                                        style={styles.input}
                                    />
                                    <small style={styles.helperText}>
                                        Optional - for pickup notifications
                                    </small>
                                </div>
                            </div>

                            <div style={styles.formSection}>
                                <h3 style={styles.sectionTitle}>Order Summary</h3>
                                
                                <div style={styles.orderSummary}>
                                    <div style={styles.orderItems}>
                                        {renderOrderItems()}
                                    </div>
                                    
                                    <div style={styles.orderTotal}>
                                        <div style={styles.totalRow}>
                                            <span style={styles.totalLabel}>Subtotal</span>
                                            <span style={styles.totalValue}>{formatPrice(calculateTotal())}</span>
                                        </div>
                                        <div style={styles.totalRow}>
                                            <span style={styles.totalLabel}>Shipping</span>
                                            <span style={styles.totalValue}>$0.00</span>
                                        </div>
                                        <div style={styles.totalRow}>
                                            <span style={styles.totalLabel}>Tax</span>
                                            <span style={styles.totalValue}>$0.00</span>
                                        </div>
                                        <div style={styles.finalTotal}>
                                            <span style={styles.finalLabel}>Total Amount</span>
                                            <span style={styles.finalValue}>{formatPrice(calculateTotal())}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pickup_location">
                                        Pickup Location *
                                    </label>
                                    <select
                                        id="pickup_location"
                                        name="pickup_location"
                                        value={formData.pickup_location}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        style={styles.select}
                                    >
                                        {pickupLocations.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="payment_method">
                                        Payment Method
                                    </label>
                                    <select
                                        id="payment_method"
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        style={styles.select}
                                    >
                                        {paymentMethods.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                    <small style={styles.helperText}>
                                        {paymentMethods.find(m => m.value === formData.payment_method)?.description}
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pickup_instructions">
                                        Special Instructions
                                    </label>
                                    <textarea
                                        id="pickup_instructions"
                                        name="pickup_instructions"
                                        value={formData.pickup_instructions}
                                        onChange={handleInputChange}
                                        className="form-input form-textarea"
                                        rows="3"
                                        placeholder="Any special instructions for pickup..."
                                        style={styles.textarea}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={styles.checkboxGroup}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="agree_terms"
                                    checked={formData.agree_terms}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.checkbox}
                                />
                                <span style={styles.checkboxText}>
                                    I agree to the <a href="/terms" style={styles.link}>Terms of Service</a> and <a href="/privacy" style={styles.link}>Privacy Policy</a>.
                                </span>
                            </label>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="subscribe_newsletter"
                                    checked={formData.subscribe_newsletter}
                                    onChange={handleInputChange}
                                    style={styles.checkbox}
                                />
                                <span style={styles.checkboxText}>
                                    Subscribe to our newsletter for updates and special offers
                                </span>
                            </label>
                        </div>

                        <div style={isMobile ? styles.mobileFormActions : styles.formActions}>
                            <button 
                                onClick={() => navigate(-1)}
                                className="btn btn-outline"
                                style={styles.backButton}
                                disabled={loading}
                            >
                                ← Back
                            </button>
                            <button 
                                onClick={handleCheckout}
                                className="btn btn-gold"
                                style={styles.submitButton}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div style={styles.buttonSpinner}></div>
                                        Processing...
                                    </>
                                ) : isMobile ? (
                                    'Review →'
                                ) : (
                                    'Proceed to Review →'
                                )}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Step 2: Review & Payment */}
            {step === 2 && transaction && (
                <section className="container mt-5">
                    <div style={styles.reviewCard}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Review Your Order</h2>
                            <p style={styles.cardSubtitle}>Please review your details before completing payment</p>
                        </div>

                        <div className="alert alert-success" style={styles.successAlert}>
                            <div style={styles.alertIcon}>✅</div>
                            <div style={styles.alertContent}>
                                <h4 style={styles.alertTitle}>Order Confirmed!</h4>
                                <p>Your transaction has been created successfully. Transaction ID: <strong>{transaction.id}</strong></p>
                            </div>
                        </div>

                        <div style={isMobile ? styles.mobileReviewGrid : styles.reviewGrid}>
                            <div style={styles.reviewSection}>
                                <h3 style={styles.sectionTitle}>Order Details</h3>
                                <div style={styles.orderReview}>
                                    {renderOrderItems()}
                                    <div style={styles.orderSummary}>
                                        <div style={styles.totalRow}>
                                            <span style={styles.totalLabel}>Total</span>
                                            <span style={styles.totalValue}>{formatPrice(calculateTotal())}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.reviewSection}>
                                <h3 style={styles.sectionTitle}>Pickup Information</h3>
                                <div style={styles.infoCard}>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Location:</span>
                                        <span style={styles.infoValue}>{formData.pickup_location}</span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>Method:</span>
                                        <span style={styles.infoValue}>
                                            {paymentMethods.find(m => m.value === formData.payment_method)?.label}
                                        </span>
                                    </div>
                                    {formData.pickup_instructions && (
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>Instructions:</span>
                                            <span style={styles.infoValue}>{formData.pickup_instructions}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.instructionsBox}>
                                    <h4 style={styles.instructionsTitle}>📋 Next Steps:</h4>
                                    <ol style={styles.instructionsList}>
                                        {renderInstructionsList()}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div style={isMobile ? styles.mobileReviewActions : styles.reviewActions}>
                            <button 
                                onClick={() => setStep(1)}
                                className="btn btn-outline"
                                style={styles.editButton}
                                disabled={loading}
                            >
                                ← Edit Details
                            </button>
                            <button 
                                onClick={handlePaymentComplete}
                                className="btn btn-gold"
                                style={styles.payButton}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div style={styles.buttonSpinner}></div>
                                        Processing...
                                    </>
                                ) : isMobile ? (
                                    'Complete Payment'
                                ) : (
                                    'Complete Payment (Demo)'
                                )}
                            </button>
                            <button 
                                onClick={() => navigate('/books')}
                                className="btn"
                                style={styles.continueButton}
                            >
                                {isMobile ? 'Shop' : 'Continue Shopping'}
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Step 3: Success Page */}
            {step === 3 && success && (
                <section className="container mt-5">
                    <div style={styles.successCard}>
                        <div style={styles.successHeader}>
                            <div style={styles.successIcon}>🎉</div>
                            <h1 style={styles.successTitle}>Payment Successful!</h1>
                            <p style={styles.successSubtitle}>
                                Thank you for your purchase. Your order has been confirmed.
                            </p>
                        </div>

                        <div style={isMobile ? styles.mobileSuccessDetails : styles.successDetails}>
                            <div style={styles.detailCard}>
                                <h3 style={styles.detailTitle}>Order Confirmation</h3>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Transaction ID:</span>
                                    <span style={styles.detailValue}>{transaction?.id}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Status:</span>
                                    <span style={styles.completedStatus}>✅ Completed</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Amount Paid:</span>
                                    <span style={styles.detailValue}>{formatPrice(calculateTotal())}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Date:</span>
                                    <span style={styles.detailValue}>
                                        {new Date().toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.detailCard}>
                                <h3 style={styles.detailTitle}>Pickup Information</h3>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Location:</span>
                                    <span style={styles.detailValue}>{formData.pickup_location}</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>What to bring:</span>
                                    <span style={styles.detailValue}>Photo ID & Transaction ID</span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Valid until:</span>
                                    <span style={styles.detailValue}>
                                        {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.detailCard}>
                                <h3 style={styles.detailTitle}>Need Help?</h3>
                                <div style={styles.contactInfo}>
                                    <p style={styles.contactText}>
                                        <strong>Email:</strong> support@somanova.com
                                    </p>
                                    <p style={styles.contactText}>
                                        <strong>Phone:</strong> (123) 456-7890
                                    </p>
                                    <p style={styles.contactText}>
                                        <strong>Hours:</strong> Mon-Fri 9am-6pm, Sat 10am-4pm
                                    </p>
                                </div>
                                <div style={styles.receiptNote}>
                                    A confirmation email has been sent to {formData.buyer_email}
                                </div>
                            </div>
                        </div>

                        <div style={isMobile ? styles.mobileSuccessActions : styles.successActions}>
                            <button 
                                onClick={() => navigate('/books')}
                                className="btn btn-gold"
                                style={styles.successButton}
                            >
                                {isMobile ? 'Shop' : 'Continue Shopping'}
                            </button>
                            <button 
                                onClick={() => navigate('/user/transactions')}
                                className="btn btn-outline"
                                style={styles.successButton}
                            >
                                {isMobile ? 'My Orders' : 'View My Orders'}
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="btn"
                                style={styles.successButton}
                            >
                                {isMobile ? '📄 Print' : '📄 Print Receipt'}
                            </button>
                        </div>

                        <div style={styles.successFooter}>
                            <p style={styles.footerText}>
                                Thank you for shopping with SomaNova! Your purchase helps keep books in circulation. 📚
                            </p>
                            <p style={styles.footerSubtext}>
                                You'll receive pickup reminders via email.
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Back to Top - Mobile only */}
            {isMobile && (
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={styles.mobileBackToTop}
                    className="btn"
                >
                    ↑ Top
                </button>
            )}
        </div>
    );
};

const styles = {
    page: {
        minHeight: '100vh',
        paddingBottom: '3rem',
    },
    
    // Loading state
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
        padding: '0.5rem 1rem',
        borderRadius: '50px',
        marginBottom: '1rem',
        border: '1px solid rgba(251, 191, 36, 0.3)',
    },
    badgeText: {
        color: '#fbbf24',
        fontWeight: '500',
        fontSize: '0.8rem',
        letterSpacing: '0.5px',
    },
    heroTitle: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '0.75rem',
        lineHeight: '1.2',
    },
    highlight: {
        color: '#fbbf24',
        display: 'block',
    },
    heroSubtitle: {
        fontSize: '1rem',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: '0.5rem',
        lineHeight: '1.5',
        padding: '0 1rem',
    },
    
    // Progress Steps
    progressSteps: {
        marginBottom: '2rem',
        padding: '0 1rem',
    },
    stepsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    mobileSteps: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    step: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        flex: 1,
        minWidth: '80px',
        maxWidth: '300px',
        transition: 'all 0.3s ease',
        opacity: 0.7,
    },
    activeStep: {
        backgroundColor: '#f0f9ff',
        border: '2px solid #1e3a8a',
        opacity: 1,
        transform: 'scale(1.02)',
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
        fontWeight: '700',
        fontSize: '0.9rem',
        flexShrink: 0,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: '0.85rem',
        color: '#1f2937',
        marginBottom: '0.1rem',
        fontWeight: '600',
    },
    stepDescription: {
        color: '#6b7280',
        fontSize: '0.7rem',
    },
    stepConnector: {
        width: '20px',
        height: '2px',
        backgroundColor: '#d1d5db',
        flexShrink: 0,
    },
    
    // Alert
    alert: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        marginLeft: '1rem',
        marginRight: '1rem',
    },
    alertIcon: {
        fontSize: '1.2rem',
        flexShrink: 0,
    },
    alertContent: {
        flex: 1,
        fontSize: '0.9rem',
    },
    alertTitle: {
        fontSize: '1rem',
        marginBottom: '0.25rem',
    },
    
    // Card Styles
    checkoutCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        margin: '0 1rem',
    },
    reviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        margin: '0 1rem',
    },
    successCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        margin: '0 1rem',
    },
    cardHeader: {
        padding: '1.5rem 1rem 1rem',
        borderBottom: '1px solid #e5e7eb',
    },
    cardTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    cardSubtitle: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    
    // Form Grid
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        padding: '1.5rem',
    },
    mobileFormGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1rem',
    },
    reviewGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        padding: '1.5rem',
    },
    mobileReviewGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1rem',
    },
    
    // Form Sections
    formSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    reviewSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    sectionTitle: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid #f3f4f6',
    },
    
    // Input Styles
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    select: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        minHeight: '80px',
        transition: 'all 0.3s ease',
    },
    helperText: {
        color: '#6b7280',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
        display: 'block',
    },
    
    // Order Summary
    orderSummary: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid #e5e7eb',
    },
    orderItems: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
    },
    itemImage: {
        width: '50px',
        height: '70px',
        flexShrink: 0,
    },
    itemImageSrc: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    itemDetails: {
        flex: 1,
        minWidth: 0, // Prevents overflow
    },
    itemTitle: {
        fontSize: '0.85rem',
        color: '#1f2937',
        marginBottom: '0.1rem',
        fontWeight: '600',
        lineHeight: '1.3',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    itemAuthor: {
        color: '#6b7280',
        fontSize: '0.75rem',
        marginBottom: '0.1rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    itemCategory: {
        color: '#1e3a8a',
        fontSize: '0.7rem',
        fontWeight: '500',
        backgroundColor: '#f0f9ff',
        padding: '0.2rem 0.4rem',
        borderRadius: '4px',
        display: 'inline-block',
    },
    itemQuantity: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.25rem',
    },
    quantityLabel: {
        color: '#6b7280',
        fontSize: '0.75rem',
    },
    quantityValue: {
        color: '#1f2937',
        fontSize: '0.8rem',
        fontWeight: '600',
        backgroundColor: '#f3f4f6',
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
    },
    itemPrice: {
        flexShrink: 0,
    },
    priceValue: {
        color: '#1e3a8a',
        fontSize: '1rem',
        fontWeight: '700',
        whiteSpace: 'nowrap',
    },
    
    // Order Total
    orderTotal: {
        marginTop: '1rem',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.4rem 0',
        borderBottom: '1px solid #e5e7eb',
    },
    totalLabel: {
        color: '#6b7280',
        fontSize: '0.85rem',
    },
    totalValue: {
        color: '#1f2937',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    finalTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 0 0',
        marginTop: '0.5rem',
        borderTop: '2px solid #e5e7eb',
    },
    finalLabel: {
        color: '#1f2937',
        fontSize: '1rem',
        fontWeight: '600',
    },
    finalValue: {
        color: '#1e3a8a',
        fontSize: '1.3rem',
        fontWeight: '700',
    },
    
    // Checkbox Group
    checkboxGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '0 1rem 1rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        cursor: 'pointer',
    },
    checkbox: {
        width: '16px',
        height: '16px',
        marginTop: '0.2rem',
        flexShrink: 0,
        cursor: 'pointer',
    },
    checkboxText: {
        color: '#4b5563',
        fontSize: '0.85rem',
        lineHeight: '1.3',
    },
    link: {
        color: '#1e3a8a',
        fontWeight: '500',
        textDecoration: 'none',
        fontSize: '0.85rem',
    },
    
    // Form Actions
    formActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    },
    mobileFormActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    },
    backButton: {
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        minWidth: 'auto',
    },
    submitButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        minWidth: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    buttonSpinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    
    // Review Section
    successAlert: {
        margin: '0 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem',
    },
    orderReview: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid #e5e7eb',
    },
    infoCard: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid #e5e7eb',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        marginBottom: '0.75rem',
    },
    infoLabel: {
        color: '#6b7280',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    infoValue: {
        color: '#1f2937',
        fontSize: '0.9rem',
        fontWeight: '500',
        wordBreak: 'break-word',
    },
    instructionsBox: {
        backgroundColor: '#dbeafe',
        padding: '1rem',
        borderRadius: '8px',
        borderLeft: '4px solid #1e3a8a',
    },
    instructionsTitle: {
        color: '#1e3a8a',
        fontSize: '0.9rem',
        marginBottom: '0.5rem',
        fontWeight: '600',
    },
    instructionsList: {
        margin: '0.25rem 0 0 1.25rem',
        padding: 0,
    },
    instructionsListItem: {
        color: '#374151',
        fontSize: '0.8rem',
        marginBottom: '0.4rem',
        lineHeight: '1.3',
    },
    
    // Review Actions
    reviewActions: {
        display: 'flex',
        gap: '0.75rem',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        flexWrap: 'wrap',
    },
    mobileReviewActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    },
    editButton: {
        padding: '0.75rem',
        fontSize: '0.9rem',
        minWidth: 'auto',
    },
    payButton: {
        padding: '0.75rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        minWidth: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    continueButton: {
        padding: '0.75rem',
        fontSize: '0.9rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        minWidth: 'auto',
    },
    
    // Success Page
    successHeader: {
        padding: '2rem 1rem 1.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    successIcon: {
        fontSize: '3rem',
        marginBottom: '0.75rem',
    },
    successTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    successSubtitle: {
        color: '#6b7280',
        fontSize: '0.95rem',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0 1rem',
    },
    successDetails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
        padding: '1.5rem',
    },
    mobileSuccessDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '1rem',
    },
    detailCard: {
        backgroundColor: '#f9fafb',
        padding: '1.25rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        textAlign: 'left',
    },
    detailTitle: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    detailItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        marginBottom: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #e5e7eb',
    },
    detailLabel: {
        color: '#6b7280',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    detailValue: {
        color: '#1f2937',
        fontSize: '0.9rem',
        fontWeight: '500',
        wordBreak: 'break-word',
    },
    completedStatus: {
        color: '#10b981',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
    },
    contactInfo: {
        marginTop: '0.75rem',
    },
    contactText: {
        color: '#4b5563',
        fontSize: '0.85rem',
        marginBottom: '0.4rem',
        lineHeight: '1.3',
    },
    receiptNote: {
        marginTop: '0.75rem',
        padding: '0.5rem',
        backgroundColor: '#d1fae5',
        color: '#065f46',
        borderRadius: '6px',
        fontSize: '0.8rem',
    },
    
    // Success Actions
    successActions: {
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        padding: '1.5rem',
        borderTop: '1px solid #e5e7eb',
        flexWrap: 'wrap',
    },
    mobileSuccessActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
    },
    successButton: {
        padding: '0.75rem',
        fontSize: '0.9rem',
        minWidth: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    
    // Success Footer
    successFooter: {
        padding: '1.5rem 1rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    },
    footerText: {
        color: '#1e3a8a',
        fontSize: '1rem',
        marginBottom: '0.5rem',
        fontWeight: '500',
        lineHeight: '1.4',
    },
    footerSubtext: {
        color: '#6b7280',
        fontSize: '0.85rem',
        lineHeight: '1.3',
    },
    
    // Mobile Back to Top
    mobileBackToTop: {
        position: 'fixed',
        bottom: '1.5rem',
        right: '1rem',
        zIndex: 1000,
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: '0.8rem',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @media (max-width: 767px) {
        .step {
            min-width: 60px;
            justify-content: center;
        }
        
        .step-number {
            width: 25px;
            height: 25px;
            font-size: 0.8rem;
        }
        
        .step-connector {
            width: 10px;
        }
        
        .order-item {
            flex-wrap: wrap;
        }
        
        .item-price {
            width: 100%;
            text-align: right;
            margin-top: 0.5rem;
        }
    }
    
    @media (max-width: 480px) {
        .hero-title {
            font-size: 1.6rem;
        }
        
        .hero-subtitle {
            font-size: 0.9rem;
        }
        
        .card-title {
            font-size: 1.3rem;
        }
        
        .success-title {
            font-size: 1.5rem;
        }
        
        .success-actions {
            flex-direction: column;
        }
        
        .review-actions {
            flex-direction: column;
        }
        
        .form-actions {
            flex-direction: column;
            gap: 0.75rem;
        }
    }
    
    .step:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .input:focus, .select:focus, .textarea:focus {
        border-color: #1e3a8a !important;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1) !important;
        outline: none;
    }
    
    .submit-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .back-button:hover {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
    }
    
    .pay-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .edit-button:hover {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
    }
    
    .continue-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .success-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .checkbox:hover {
        border-color: #1e3a8a;
    }
    
    .link:hover {
        color: #fbbf24 !important;
        text-decoration: underline;
    }
    
    .back-to-top:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4);
    }
    
    .order-item:hover {
        border-color: #1e3a8a;
        background-color: #f0f9ff;
    }
`;
document.head.appendChild(styleSheet);

export default CheckoutPage;