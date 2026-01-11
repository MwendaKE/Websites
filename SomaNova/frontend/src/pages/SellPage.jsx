import React, { useState } from 'react';
import { bookAPI } from '../services/api';
import '../styles/theme.css';

/**
 * Sell Page - Professional book selling form for SomaNova
 */
const SellPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        category: '',
        description: '',
        condition: 'Good',
        isbn: '',
        seller_name: '',
        seller_email: '',
        seller_phone: '',
        image_url: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [imagePreview, setImagePreview] = useState('');
    const [formErrors, setFormErrors] = useState({});
    
    const categories = [
        'Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller',
        'Biography', 'Autobiography', 'Memoir', 'History', 'Science', 'Technology',
        'Business', 'Self-Help', 'Health & Fitness', 'Cookbooks', 'Travel',
        'Art & Photography', 'Poetry', 'Drama', 'Religion', 'Philosophy',
        'Children', 'Young Adult', 'Graphic Novels', 'Comics'
    ];
    
    const conditions = [
        { value: 'New', label: 'New - Perfect condition, never read' },
        { value: 'Like New', label: 'Like New - Minor shelf wear' },
        { value: 'Very Good', label: 'Very Good - Light wear, no markings' },
        { value: 'Good', label: 'Good - Moderate wear, still readable' },
        { value: 'Fair', label: 'Fair - Significant wear, readable' },
        { value: 'Poor', label: 'Poor - Heavy wear, may have damage' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Handle image URL change for preview
        if (name === 'image_url') {
            setImagePreview(value);
        }
    };

    const validateStep = (step) => {
        const errors = {};
        
        switch (step) {
            case 1:
                if (!formData.title.trim()) errors.title = 'Book title is required';
                if (!formData.author.trim()) errors.author = 'Author name is required';
                if (!formData.price) errors.price = 'Price is required';
                if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) <= 0)) {
                    errors.price = 'Please enter a valid price';
                }
                if (!formData.category) errors.category = 'Category is required';
                break;
                
            case 2:
                if (!formData.seller_name.trim()) errors.seller_name = 'Your name is required';
                if (!formData.seller_email.trim()) errors.seller_email = 'Email is required';
                if (formData.seller_email && !/\S+@\S+\.\S+/.test(formData.seller_email)) {
                    errors.seller_email = 'Please enter a valid email address';
                }
                break;
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep(2)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const bookData = {
                ...formData,
                price: parseFloat(formData.price)
            };
            
            const response = await bookAPI.create(bookData);
            
            if (response.success) {
                setSuccess(true);
                // Reset form
                setFormData({
                    title: '',
                    author: '',
                    price: '',
                    category: '',
                    description: '',
                    condition: 'Good',
                    isbn: '',
                    seller_name: '',
                    seller_email: '',
                    seller_phone: '',
                    image_url: ''
                });
                setImagePreview('');
                setCurrentStep(1);
                setFormErrors({});
            } else {
                setError(response.message || 'Failed to list book. Please try again.');
            }
        } catch (err) {
            console.error('Book listing error:', err);
            setError('Error listing book. Please try again or contact support.');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    const sellingTips = [
        'Take clear, well-lit photos of your book from multiple angles',
        'Be honest about the book condition - it builds trust with buyers',
        'Include any interesting details about the book\'s history or edition',
        'Check similar listings to price your book competitively',
        'Pack books securely for shipping to prevent damage'
    ];

    const commissionRates = [
        { range: 'Under $10', rate: 'No commission' },
        { range: '$10 - $25', rate: '5% commission' },
        { range: '$25 - $50', rate: '7.5% commission' },
        { range: 'Over $50', rate: '10% commission' }
    ];

    if (success) {
        return (
            <div className="container mt-5">
                <div style={styles.successCard}>
                    <div style={styles.successIcon}>🎉</div>
                    <h1 style={styles.successTitle}>Book Listed Successfully!</h1>
                    <p style={styles.successText}>
                        Your book has been listed on SomaNova. Buyers can now see and contact you about your book.
                        We've sent a confirmation email with listing details.
                    </p>
                    
                    <div style={styles.successDetails}>
                        <h3 style={styles.detailsTitle}>What happens next:</h3>
                        <ul style={styles.detailsList}>
                            <li>Your book will appear in search results immediately</li>
                            <li>Interested buyers will contact you via email or phone</li>
                            <li>Respond promptly to inquiries for best results</li>
                            <li>Update your listing if the book sells elsewhere</li>
                        </ul>
                    </div>
                    
                    <div style={styles.successActions}>
                        <button 
                            onClick={() => {
                                setSuccess(false);
                                setCurrentStep(1);
                            }} 
                            className="btn btn-gold"
                            style={styles.anotherButton}
                        >
                            List Another Book
                        </button>
                        <a href="/books" className="btn" style={styles.browseButton}>
                            Browse Books
                        </a>
                        <a href="/seller/dashboard" className="btn btn-outline" style={styles.dashboardButton}>
                            Go to Dashboard
                        </a>
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
                            <span style={styles.badgeText}>💰 Sell Your Books</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Turn Your Books into
                            <span style={styles.highlight}> Cash & Community</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            List your pre-owned books in minutes and connect with readers 
                            who are looking for exactly what you have.
                        </p>
                    </div>
                </div>
            </section>

            {/* Progress Bar */}
            <div className="container mt-4">
                <div style={styles.progressBar}>
                    <div style={styles.progressSteps}>
                        <div style={{
                            ...styles.progressStep,
                            ...(currentStep >= 1 && styles.activeStep)
                        }}>
                            <div style={styles.stepCircle}>1</div>
                            <span style={styles.stepLabel}>Book Details</span>
                        </div>
                        <div style={styles.stepConnector}></div>
                        <div style={{
                            ...styles.progressStep,
                            ...(currentStep >= 2 && styles.activeStep)
                        }}>
                            <div style={styles.stepCircle}>2</div>
                            <span style={styles.stepLabel}>Seller Info</span>
                        </div>
                        <div style={styles.stepConnector}></div>
                        <div style={{
                            ...styles.progressStep,
                            ...(currentStep >= 3 && styles.activeStep)
                        }}>
                            <div style={styles.stepCircle}>3</div>
                            <span style={styles.stepLabel}>Review & Submit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mt-5">
                <div style={styles.contentGrid}>
                    {/* Form Section */}
                    <div style={styles.formSection}>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            {error && (
                                <div style={styles.errorAlert}>
                                    <div style={styles.errorIcon}>⚠️</div>
                                    <div>
                                        <strong>Error:</strong> {error}
                                    </div>
                                </div>
                            )}
                            
                            {/* Step 1: Book Details */}
                            {currentStep === 1 && (
                                <div style={styles.stepContent}>
                                    <h2 style={styles.stepTitle}>Book Information</h2>
                                    <p style={styles.stepDescription}>
                                        Tell us about the book you're selling. Complete and accurate 
                                        information helps buyers find your listing.
                                    </p>
                                    
                                    <div style={styles.formGrid}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="title">
                                                Book Title *
                                            </label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="Enter the complete book title"
                                                style={{
                                                    ...styles.input,
                                                    ...(formErrors.title && styles.inputError)
                                                }}
                                            />
                                            {formErrors.title && (
                                                <div style={styles.errorText}>{formErrors.title}</div>
                                            )}
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="author">
                                                Author *
                                            </label>
                                            <input
                                                type="text"
                                                id="author"
                                                name="author"
                                                value={formData.author}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="Author's full name"
                                                style={{
                                                    ...styles.input,
                                                    ...(formErrors.author && styles.inputError)
                                                }}
                                            />
                                            {formErrors.author && (
                                                <div style={styles.errorText}>{formErrors.author}</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={styles.formGrid}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="price">
                                                Price ($) *
                                            </label>
                                            <div style={styles.priceInputContainer}>
                                                <span style={styles.currencySymbol}>$</span>
                                                <input
                                                    type="number"
                                                    id="price"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    style={{
                                                        ...styles.input,
                                                        ...styles.priceInput,
                                                        ...(formErrors.price && styles.inputError)
                                                    }}
                                                />
                                            </div>
                                            {formErrors.price && (
                                                <div style={styles.errorText}>{formErrors.price}</div>
                                            )}
                                            <small style={styles.helperText}>
                                                Competitive pricing: {formatPrice(formData.price || 0)}
                                            </small>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="category">
                                                Category *
                                            </label>
                                            <select
                                                id="category"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="form-input"
                                                style={{
                                                    ...styles.input,
                                                    ...(formErrors.category && styles.inputError)
                                                }}
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            {formErrors.category && (
                                                <div style={styles.errorText}>{formErrors.category}</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={styles.formGrid}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="condition">
                                                Book Condition
                                            </label>
                                            <select
                                                id="condition"
                                                name="condition"
                                                value={formData.condition}
                                                onChange={handleChange}
                                                className="form-input"
                                                style={styles.input}
                                            >
                                                {conditions.map(cond => (
                                                    <option key={cond.value} value={cond.value}>
                                                        {cond.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="isbn">
                                                ISBN (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                id="isbn"
                                                name="isbn"
                                                value={formData.isbn}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="978-3-16-148410-0"
                                                style={styles.input}
                                            />
                                            <small style={styles.helperText}>
                                                10 or 13 digit ISBN number
                                            </small>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="image_url">
                                            Book Cover Image URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            id="image_url"
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="https://example.com/book-cover.jpg"
                                            style={styles.input}
                                        />
                                        <small style={styles.helperText}>
                                            Direct link to a clear, high-quality image of your book
                                        </small>
                                        
                                        {imagePreview && (
                                            <div style={styles.imagePreviewContainer}>
                                                <div style={styles.imagePreviewLabel}>Preview:</div>
                                                <img
                                                    src={imagePreview}
                                                    alt="Book cover preview"
                                                    style={styles.imagePreview}
                                                    onError={() => setImagePreview('')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="description">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="form-input form-textarea"
                                            placeholder="Describe the book's condition, edition, special features, or any notes for buyers..."
                                            rows="4"
                                            style={styles.textarea}
                                        />
                                        <div style={styles.charCount}>
                                            {formData.description.length} / 2000 characters
                                        </div>
                                    </div>
                                    
                                    <div style={styles.stepActions}>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="btn btn-gold"
                                            style={styles.nextButton}
                                        >
                                            Continue to Seller Info →
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Step 2: Seller Information */}
                            {currentStep === 2 && (
                                <div style={styles.stepContent}>
                                    <h2 style={styles.stepTitle}>Seller Information</h2>
                                    <p style={styles.stepDescription}>
                                        This information will be visible to potential buyers. 
                                        We'll use your email for notifications and confirmations.
                                    </p>
                                    
                                    <div style={styles.formGrid}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="seller_name">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="seller_name"
                                                name="seller_name"
                                                value={formData.seller_name}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="Enter your full name"
                                                style={{
                                                    ...styles.input,
                                                    ...(formErrors.seller_name && styles.inputError)
                                                }}
                                            />
                                            {formErrors.seller_name && (
                                                <div style={styles.errorText}>{formErrors.seller_name}</div>
                                            )}
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="seller_email">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="seller_email"
                                                name="seller_email"
                                                value={formData.seller_email}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="your.email@example.com"
                                                style={{
                                                    ...styles.input,
                                                    ...(formErrors.seller_email && styles.inputError)
                                                }}
                                            />
                                            {formErrors.seller_email && (
                                                <div style={styles.errorText}>{formErrors.seller_email}</div>
                                            )}
                                            <small style={styles.helperText}>
                                                Used for notifications and buyer communication
                                            </small>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="seller_phone">
                                            Phone Number (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            id="seller_phone"
                                            name="seller_phone"
                                            value={formData.seller_phone}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="(123) 456-7890"
                                            style={styles.input}
                                        />
                                        <small style={styles.helperText}>
                                            Will be displayed publicly for buyers to contact you
                                        </small>
                                    </div>
                                    
                                    <div style={styles.stepActions}>
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="btn btn-outline"
                                            style={styles.backButton}
                                        >
                                            ← Back to Book Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="btn btn-gold"
                                            style={styles.nextButton}
                                        >
                                            Review & Submit →
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Step 3: Review & Submit */}
                            {currentStep === 3 && (
                                <div style={styles.stepContent}>
                                    <h2 style={styles.stepTitle}>Review & Submit</h2>
                                    <p style={styles.stepDescription}>
                                        Review your listing details before submitting. 
                                        Make sure everything is accurate and complete.
                                    </p>
                                    
                                    <div style={styles.reviewCard}>
                                        <div style={styles.reviewSection}>
                                            <h3 style={styles.reviewSectionTitle}>Book Information</h3>
                                            <div style={styles.reviewDetails}>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Title:</span>
                                                    <span style={styles.reviewValue}>{formData.title || 'Not provided'}</span>
                                                </div>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Author:</span>
                                                    <span style={styles.reviewValue}>{formData.author || 'Not provided'}</span>
                                                </div>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Price:</span>
                                                    <span style={styles.reviewValue}>{formatPrice(formData.price)}</span>
                                                </div>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Category:</span>
                                                    <span style={styles.reviewValue}>{formData.category || 'Not provided'}</span>
                                                </div>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Condition:</span>
                                                    <span style={styles.reviewValue}>{formData.condition}</span>
                                                </div>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>ISBN:</span>
                                                    <span style={styles.reviewValue}>{formData.isbn || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.reviewSection}>
                                            <h3 style={styles.reviewSectionTitle}>Seller Information</h3>
                                            <div style={styles.reviewDetails}>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Name:</span>
                                                    <span style={styles.reviewValue}>{formData.seller_name || 'Not provided'}</span>
                                                </div>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Email:</span>
                                                    <span style={styles.reviewValue}>{formData.seller_email || 'Not provided'}</span>
                                                </div>
                                                <div style={styles.reviewItem}>
                                                    <span style={styles.reviewLabel}>Phone:</span>
                                                    <span style={styles.reviewValue}>{formData.seller_phone || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.reviewSection}>
                                            <h3 style={styles.reviewSectionTitle}>Commission & Fees</h3>
                                            <div style={styles.commissionTable}>
                                                {commissionRates.map((rate, index) => (
                                                    <div key={index} style={styles.commissionRow}>
                                                        <span style={styles.commissionRange}>{rate.range}</span>
                                                        <span style={styles.commissionRate}>{rate.rate}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p style={styles.commissionNote}>
                                                * No listing fees. Commission only applies upon successful sale.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.termsSection}>
                                        <h3 style={styles.termsTitle}>Terms & Conditions</h3>
                                        <div style={styles.termsList}>
                                            <div style={styles.termItem}>
                                                <input 
                                                    type="checkbox" 
                                                    id="terms1" 
                                                    required 
                                                    style={styles.termCheckbox}
                                                />
                                                <label htmlFor="terms1" style={styles.termLabel}>
                                                    I confirm that I own this book and have the right to sell it
                                                </label>
                                            </div>
                                            <div style={styles.termItem}>
                                                <input 
                                                    type="checkbox" 
                                                    id="terms2" 
                                                    required 
                                                    style={styles.termCheckbox}
                                                />
                                                <label htmlFor="terms2" style={styles.termLabel}>
                                                    I agree to the <a href="/terms" style={styles.termLink}>Terms of Service</a> and <a href="/privacy" style={styles.termLink}>Privacy Policy</a>
                                                </label>
                                            </div>
                                            <div style={styles.termItem}>
                                                <input 
                                                    type="checkbox" 
                                                    id="terms3" 
                                                    required 
                                                    style={styles.termCheckbox}
                                                />
                                                <label htmlFor="terms3" style={styles.termLabel}>
                                                    I understand that I'm responsible for shipping arrangements and costs
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.stepActions}>
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="btn btn-outline"
                                            style={styles.backButton}
                                        >
                                            ← Back to Seller Info
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-gold"
                                            style={styles.submitButton}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <div style={styles.buttonSpinner}></div>
                                                    Listing Book...
                                                </>
                                            ) : (
                                                '📚 List My Book'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                    
                    {/* Tips Sidebar */}
                    <div style={styles.tipsSidebar}>
                        <div style={styles.tipsCard}>
                            <h3 style={styles.tipsTitle}>💡 Selling Tips</h3>
                            <ul style={styles.tipsList}>
                                {sellingTips.map((tip, index) => (
                                    <li key={index} style={styles.tipItem}>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div style={styles.benefitsCard}>
                            <h3 style={styles.benefitsTitle}>✅ Why Sell on SomaNova?</h3>
                            <ul style={styles.benefitsList}>
                                <li style={styles.benefitItem}>
                                    <strong>No listing fees</strong> - List as many books as you want
                                </li>
                                <li style={styles.benefitItem}>
                                    <strong>Reach thousands</strong> of potential buyers
                                </li>
                                <li style={styles.benefitItem}>
                                    <strong>Easy communication</strong> with interested readers
                                </li>
                                <li style={styles.benefitItem}>
                                    <strong>Secure transactions</strong> and buyer verification
                                </li>
                            </ul>
                        </div>
                        
                        <div style={styles.supportCard}>
                            <h3 style={styles.supportTitle}>🛠️ Need Help?</h3>
                            <p style={styles.supportText}>
                                Our seller support team is here to help you with:
                            </p>
                            <ul style={styles.supportList}>
                                <li>Pricing guidance</li>
                                <li>Listing optimization</li>
                                <li>Shipping best practices</li>
                                <li>Issue resolution</li>
                            </ul>
                            <a href="/contact" style={styles.supportLink}>
                                Contact Seller Support →
                            </a>
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
    
    // Progress Bar
    progressBar: {
        marginBottom: '2rem',
    },
    progressSteps: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    progressStep: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: '100px',
    },
    activeStep: {
        color: '#1e3a8a',
    },
    stepCircle: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
    stepLabel: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#6b7280',
    },
    stepConnector: {
        flex: 1,
        height: '2px',
        backgroundColor: '#e5e7eb',
        minWidth: '50px',
        maxWidth: '100px',
    },
    
    // Content Grid
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        alignItems: 'start',
    },
    
    // Form Section
    formSection: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
    },
    form: {
        padding: '2rem',
    },
    
    // Error Alert
    errorAlert: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid #fecaca',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        marginBottom: '2rem',
    },
    errorIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    
    // Step Content
    stepContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    stepTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    stepDescription: {
        color: '#6b7280',
        fontSize: '1rem',
        lineHeight: '1.5',
    },
    
    // Form Styles
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
        backgroundColor: '#ffffff',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        fontFamily: 'inherit',
        resize: 'vertical',
        minHeight: '100px',
        transition: 'all 0.3s ease',
    },
    priceInputContainer: {
        position: 'relative',
    },
    currencySymbol: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#6b7280',
        fontWeight: '500',
    },
    priceInput: {
        paddingLeft: '2.5rem',
    },
    helperText: {
        color: '#6b7280',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
        display: 'block',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
    },
    charCount: {
        textAlign: 'right',
        color: '#9ca3af',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
    },
    
    // Image Preview
    imagePreviewContainer: {
        marginTop: '1rem',
    },
    imagePreviewLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        marginBottom: '0.5rem',
    },
    imagePreview: {
        maxWidth: '200px',
        maxHeight: '300px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    
    // Review Card
    reviewCard: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
    },
    reviewSection: {
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    reviewSectionTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    reviewDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    reviewItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
    },
    reviewLabel: {
        color: '#6b7280',
        fontSize: '0.95rem',
        fontWeight: '500',
        minWidth: '100px',
    },
    reviewValue: {
        color: '#1f2937',
        fontSize: '0.95rem',
        textAlign: 'right',
        wordBreak: 'break-word',
        flex: 1,
    },
    
    // Commission Table
    commissionTable: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    commissionRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
    },
    commissionRange: {
        color: '#1f2937',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    commissionRate: {
        color: '#1e3a8a',
        fontSize: '0.95rem',
        fontWeight: '600',
    },
    commissionNote: {
        color: '#6b7280',
        fontSize: '0.85rem',
        fontStyle: 'italic',
        margin: 0,
    },
    
    // Terms Section
    termsSection: {
        padding: '1.5rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd',
    },
    termsTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    termsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    termItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
    },
    termCheckbox: {
        width: '18px',
        height: '18px',
        marginTop: '0.25rem',
        cursor: 'pointer',
    },
    termLabel: {
        color: '#1f2937',
        fontSize: '0.95rem',
        lineHeight: '1.4',
        cursor: 'pointer',
    },
    termLink: {
        color: '#1e3a8a',
        fontWeight: '500',
        textDecoration: 'none',
    },
    
    // Step Actions
    stepActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
    },
    nextButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        marginLeft: 'auto',
    },
    backButton: {
        padding: '0.75rem 2rem',
    },
    submitButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        minWidth: '180px',
    },
    buttonSpinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(0, 0, 0, 0.3)',
        borderTopColor: '#000000',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    
    // Tips Sidebar
    tipsSidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    
    // Tips Card
    tipsCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem',
    },
    tipsTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    tipsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        paddingLeft: '1.5rem',
    },
    tipItem: {
        color: '#6b7280',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        listStyleType: 'disc',
    },
    
    // Benefits Card
    benefitsCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem',
    },
    benefitsTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    benefitsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    benefitItem: {
        color: '#6b7280',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
    },
    
    // Support Card
    supportCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        padding: '1.5rem',
    },
    supportTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    supportText: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginBottom: '1rem',
        lineHeight: '1.5',
    },
    supportList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        paddingLeft: '1.5rem',
    },
    supportLink: {
        color: '#1e3a8a',
        fontSize: '0.95rem',
        fontWeight: '500',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    
    // Success Card
    successCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
    },
    successIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
        animation: 'bounce 1s infinite',
    },
    successTitle: {
        fontSize: '2.5rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    successText: {
        fontSize: '1.2rem',
        color: '#6b7280',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    successDetails: {
        backgroundColor: '#f9fafb',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
        textAlign: 'left',
    },
    detailsTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    detailsList: {
        color: '#6b7280',
        fontSize: '1rem',
        lineHeight: '1.6',
        paddingLeft: '1.5rem',
    },
    successActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    anotherButton: {
        padding: '0.75rem 2rem',
    },
    browseButton: {
        padding: '0.75rem 2rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    dashboardButton: {
        padding: '0.75rem 2rem',
        borderColor: '#1e3a8a',
        color: '#1e3a8a',
    },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .active-step .step-circle {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
    }
    
    .active-step .step-label {
        color: #1e3a8a !important;
        font-weight: 600 !important;
    }
    
    .tips-card:hover,
    .benefits-card:hover,
    .support-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .input:focus,
    .textarea:focus {
        border-color: #1e3a8a !important;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1) !important;
        outline: none;
    }
    
    .next-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .back-button:hover {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
        transform: translateY(-2px);
    }
    
    .submit-button:hover:not(:disabled) {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .another-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .browse-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .dashboard-button:hover {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
        transform: translateY(-2px);
    }
    
    .term-checkbox:hover {
        border-color: #1e3a8a;
    }
    
    .term-link:hover {
        text-decoration: underline;
    }
    
    .support-link:hover {
        color: #fbbf24 !important;
    }
`;
document.head.appendChild(styleSheet);

export default SellPage;