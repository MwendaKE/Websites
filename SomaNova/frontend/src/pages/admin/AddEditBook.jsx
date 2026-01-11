import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI, adminAPI, collectionAPI } from '../../services/api';
import '../../styles/theme.css';

/**
 * Add/Edit Book Page
 */
const AddEditBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        price: '',
        category: '',
        description: '',
        image_url: '',
        condition: 'Good',
        isbn: '',
        seller_name: '',
        seller_email: '',
        seller_phone: '',
        collection_id: '',
        stock_quantity: 1,
        featured: false,
        status: 'available' // available, sold, reserved
    });
    
    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (isEditMode) {
            fetchBookData();
        }
        fetchCategories();
        fetchCollections();
    }, [id]);

    useEffect(() => {
        if (formData.image_url) {
            setImagePreview(formData.image_url);
        }
    }, [formData.image_url]);

    const fetchBookData = async () => {
        try {
            setLoadingData(true);
            const response = await bookAPI.getById(id);
            
            if (response.success) {
                const book = response.data;
                setFormData({
                    title: book.title || '',
                    author: book.author || '',
                    price: book.price || '',
                    category: book.category || '',
                    description: book.description || '',
                    image_url: book.image_url || '',
                    condition: book.condition || 'Good',
                    isbn: book.isbn || '',
                    seller_name: book.seller_name || '',
                    seller_email: book.seller_email || '',
                    seller_phone: book.seller_phone || '',
                    collection_id: book.collection_id || '',
                    stock_quantity: book.stock_quantity || 1,
                    featured: book.featured || false,
                    status: book.status || 'available'
                });
            } else {
                setError('Failed to load book data');
            }
        } catch (err) {
            setError('Error loading book data. Please try again.');
            console.error('Book fetch error:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await bookAPI.getCategories();
            if (response.success && Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                // Fallback to common categories
                const commonCategories = [
                    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
                    'Romance', 'Biography', 'Self-Help', 'Business', 'Technology',
                    'Science', 'History', 'Art', 'Children', 'Young Adult',
                    'Poetry', 'Drama', 'Cookbooks', 'Travel', 'Health & Fitness'
                ];
                setCategories(commonCategories);
            }
        } catch (err) {
            console.error('Categories fetch error:', err);
            // Fallback to common categories on error
            const commonCategories = [
                'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery',
                'Romance', 'Biography', 'Self-Help', 'Business', 'Technology',
                'Science', 'History', 'Art', 'Children', 'Young Adult'
            ];
            setCategories(commonCategories);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await collectionAPI.getAll();
            if (response.success && Array.isArray(response.data)) {
                setCollections(response.data);
            }
        } catch (err) {
            console.error('Collections fetch error:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageUrlChange = (url) => {
        setFormData(prev => ({ ...prev, image_url: url }));
        setImagePreview(url);
    };

    const validateForm = () => {
        const errors = {};
        
        // Required fields
        if (!formData.title.trim()) errors.title = 'Book title is required';
        if (!formData.author.trim()) errors.author = 'Author name is required';
        if (!formData.price) errors.price = 'Price is required';
        if (parseFloat(formData.price) <= 0) errors.price = 'Price must be greater than 0';
        if (!formData.category) errors.category = 'Category is required';
        
        // Optional field validation
        if (formData.seller_email && !isValidEmail(formData.seller_email)) {
            errors.seller_email = 'Please enter a valid email address';
        }
        
        if (formData.isbn && !isValidISBN(formData.isbn)) {
            errors.isbn = 'Please enter a valid ISBN (10 or 13 digits)';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidISBN = (isbn) => {
        // Simple ISBN validation - accepts 10 or 13 digits
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        return /^(\d{10}|\d{13})$/.test(cleanISBN);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setError('Please fix the validation errors below.');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const bookData = {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity) || 1
            };

            let response;
            if (isEditMode) {
                // Use update endpoint for editing
                response = await adminAPI.updateBook(id, bookData);
                setSuccess('Book updated successfully!');
            } else {
                response = await bookAPI.create(bookData);
                setSuccess('Book added successfully!');
                
                // Reset form after successful creation
                setTimeout(() => {
                    setFormData({
                        title: '',
                        author: '',
                        price: '',
                        category: '',
                        description: '',
                        image_url: '',
                        condition: 'Good',
                        isbn: '',
                        seller_name: '',
                        seller_email: '',
                        seller_phone: '',
                        collection_id: '',
                        stock_quantity: 1,
                        featured: false,
                        status: 'available'
                    });
                    setImagePreview('');
                }, 1500);
            }

            if (response.success) {
                setTimeout(() => {
                    if (isEditMode) {
                        navigate('/admin/books');
                    }
                }, 2000);
            } else {
                throw new Error(response.message || 'Failed to save book');
            }

        } catch (err) {
            setError(err.message || 'Error saving book. Please try again.');
            console.error('Save error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            navigate('/admin/books');
        }
    };

    const handleImageError = () => {
        setImagePreview('');
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const conditionOptions = [
        { value: 'New', label: 'New - Perfect condition' },
        { value: 'Like New', label: 'Like New - Minor wear' },
        { value: 'Very Good', label: 'Very Good - Light wear' },
        { value: 'Good', label: 'Good - Moderate wear' },
        { value: 'Fair', label: 'Fair - Significant wear' },
        { value: 'Poor', label: 'Poor - Heavy wear' }
    ];

    const statusOptions = [
        { value: 'available', label: 'Available', color: '#10b981' },
        { value: 'sold', label: 'Sold', color: '#6b7280' },
        { value: 'reserved', label: 'Reserved', color: '#f59e0b' },
        { value: 'pending', label: 'Pending', color: '#8b5cf6' }
    ];

    if (loadingData) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading book data...</p>
                    <p style={styles.loadingSubtext}>Please wait while we fetch book details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 page-container">
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        {isEditMode ? 'Edit Book' : 'Add New Book'}
                    </h1>
                    <p style={styles.subtitle}>
                        {isEditMode 
                            ? 'Update book details and inventory information'
                            : 'Add a new book to your store inventory'}
                    </p>
                </div>
                <button 
                    onClick={handleCancel}
                    className="btn btn-outline"
                    style={styles.cancelButton}
                >
                    Cancel
                </button>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="alert alert-error" style={styles.alert}>
                    <div style={styles.alertIcon}>⚠️</div>
                    <div>
                        <strong>Error:</strong> {error}
                    </div>
                </div>
            )}

            {success && (
                <div className="alert alert-success" style={styles.alert}>
                    <div style={styles.alertIcon}>✓</div>
                    <div>
                        <strong>Success!</strong> {success}
                        {isEditMode && (
                            <div style={styles.successRedirect}>
                                Redirecting to books list...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div style={styles.tabs}>
                <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'basic' ? styles.activeTab : {})
                    }}
                >
                    📝 Basic Information
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'details' ? styles.activeTab : {})
                    }}
                >
                    📄 Additional Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('seller')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'seller' ? styles.activeTab : {})
                    }}
                >
                    👤 Seller Information
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'preview' ? styles.activeTab : {})
                    }}
                >
                    👁️ Preview
                </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formContent}>
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                        <div style={styles.tabContent}>
                            <div style={styles.formGrid}>
                                <div style={styles.formColumn}>
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
                                            placeholder="Enter book title"
                                            required
                                            style={{
                                                ...styles.input,
                                                ...(validationErrors.title && styles.inputError)
                                            }}
                                        />
                                        {validationErrors.title && (
                                            <div style={styles.errorText}>{validationErrors.title}</div>
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
                                            placeholder="Enter author name"
                                            required
                                            style={{
                                                ...styles.input,
                                                ...(validationErrors.author && styles.inputError)
                                            }}
                                        />
                                        {validationErrors.author && (
                                            <div style={styles.errorText}>{validationErrors.author}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="price">
                                            Price *
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
                                                step="0.01"
                                                min="0"
                                                required
                                                style={{
                                                    ...styles.input,
                                                    ...styles.priceInput,
                                                    ...(validationErrors.price && styles.inputError)
                                                }}
                                            />
                                        </div>
                                        {validationErrors.price && (
                                            <div style={styles.errorText}>{validationErrors.price}</div>
                                        )}
                                        <small style={styles.helperText}>
                                            Enter price in USD
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
                                            required
                                            style={{
                                                ...styles.input,
                                                ...(validationErrors.category && styles.inputError)
                                            }}
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.category && (
                                            <div style={styles.errorText}>{validationErrors.category}</div>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.formColumn}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="image_url">
                                            Cover Image URL
                                        </label>
                                        <input
                                            type="url"
                                            id="image_url"
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={(e) => handleImageUrlChange(e.target.value)}
                                            className="form-input"
                                            placeholder="https://example.com/book-cover.jpg"
                                            style={styles.input}
                                        />
                                        <small style={styles.helperText}>
                                            Enter a direct image URL. Leave empty for default cover.
                                        </small>
                                        
                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div style={styles.imagePreviewContainer}>
                                                <div style={styles.imagePreviewLabel}>Preview:</div>
                                                <img
                                                    src={imagePreview}
                                                    alt="Book cover preview"
                                                    style={styles.imagePreview}
                                                    onError={handleImageError}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="collection_id">
                                            Collection (Optional)
                                        </label>
                                        <select
                                            id="collection_id"
                                            name="collection_id"
                                            value={formData.collection_id}
                                            onChange={handleChange}
                                            className="form-input"
                                            style={styles.input}
                                        >
                                            <option value="">No Collection</option>
                                            {collections.map(collection => (
                                                <option key={collection.id} value={collection.id}>
                                                    {collection.name}
                                                </option>
                                            ))}
                                        </select>
                                        <small style={styles.helperText}>
                                            Group books into collections for better organization
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Additional Details Tab */}
                    {activeTab === 'details' && (
                        <div style={styles.tabContent}>
                            <div style={styles.formGrid}>
                                <div style={styles.formColumn}>
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
                                            {conditionOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="isbn">
                                            ISBN
                                        </label>
                                        <input
                                            type="text"
                                            id="isbn"
                                            name="isbn"
                                            value={formData.isbn}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="978-3-16-148410-0"
                                            style={{
                                                ...styles.input,
                                                ...(validationErrors.isbn && styles.inputError)
                                            }}
                                        />
                                        {validationErrors.isbn && (
                                            <div style={styles.errorText}>{validationErrors.isbn}</div>
                                        )}
                                        <small style={styles.helperText}>
                                            10 or 13 digit ISBN number
                                        </small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="stock_quantity">
                                            Stock Quantity
                                        </label>
                                        <input
                                            type="number"
                                            id="stock_quantity"
                                            name="stock_quantity"
                                            value={formData.stock_quantity}
                                            onChange={handleChange}
                                            className="form-input"
                                            min="0"
                                            style={styles.input}
                                        />
                                        <small style={styles.helperText}>
                                            Number of copies available for sale
                                        </small>
                                    </div>
                                </div>

                                <div style={styles.formColumn}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="status">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="form-input"
                                            style={{
                                                ...styles.input,
                                                ...(formData.status && {
                                                    color: statusOptions.find(o => o.value === formData.status)?.color || '#1f2937'
                                                })
                                            }}
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
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
                                            placeholder="Enter a detailed description of the book..."
                                            rows="6"
                                            style={styles.textarea}
                                        />
                                        <div style={styles.charCount}>
                                            {formData.description.length} / 2000 characters
                                        </div>
                                    </div>

                                    <div style={styles.checkboxGroup}>
                                        <label style={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="featured"
                                                checked={formData.featured}
                                                onChange={handleChange}
                                                style={styles.checkbox}
                                            />
                                            <span style={styles.checkboxText}>
                                                ⭐ Feature this book on homepage
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seller Information Tab */}
                    {activeTab === 'seller' && (
                        <div style={styles.tabContent}>
                            <div style={styles.sellerInfoSection}>
                                <h3 style={styles.sectionTitle}>Seller Details</h3>
                                <p style={styles.sectionDescription}>
                                    Information about the person selling this book
                                </p>
                            </div>
                            
                            <div style={styles.formGrid}>
                                <div style={styles.formColumn}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="seller_name">
                                            Seller Name
                                        </label>
                                        <input
                                            type="text"
                                            id="seller_name"
                                            name="seller_name"
                                            value={formData.seller_name}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter seller's name"
                                            style={styles.input}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="seller_email">
                                            Seller Email
                                        </label>
                                        <input
                                            type="email"
                                            id="seller_email"
                                            name="seller_email"
                                            value={formData.seller_email}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="seller@example.com"
                                            style={{
                                                ...styles.input,
                                                ...(validationErrors.seller_email && styles.inputError)
                                            }}
                                        />
                                        {validationErrors.seller_email && (
                                            <div style={styles.errorText}>{validationErrors.seller_email}</div>
                                        )}
                                    </div>
                                </div>

                                <div style={styles.formColumn}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="seller_phone">
                                            Seller Phone
                                        </label>
                                        <input
                                            type="tel"
                                            id="seller_phone"
                                            name="seller_phone"
                                            value={formData.seller_phone}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="+1 (123) 456-7890"
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.sellerNotes}>
                                        <h4 style={styles.notesTitle}>Notes:</h4>
                                        <ul style={styles.notesList}>
                                            <li>Seller information is optional</li>
                                            <li>Used for order notifications and communication</li>
                                            <li>Email will be verified for order confirmations</li>
                                            <li>Phone number is optional but recommended</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Tab */}
                    {activeTab === 'preview' && (
                        <div style={styles.tabContent}>
                            <div style={styles.previewSection}>
                                <h3 style={styles.previewTitle}>Book Preview</h3>
                                <p style={styles.previewSubtitle}>
                                    How your book will appear to customers
                                </p>
                                
                                <div style={styles.previewCard}>
                                    <div style={styles.previewHeader}>
                                        <div style={styles.previewBadge}>
                                            {formData.featured && (
                                                <span style={styles.featuredBadge}>⭐ Featured</span>
                                            )}
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: statusOptions.find(o => o.value === formData.status)?.color || '#6b7280'
                                            }}>
                                                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.previewContent}>
                                        <div style={styles.previewImageSection}>
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt={formData.title || 'Book cover'}
                                                    style={styles.previewImage}
                                                    onError={() => setImagePreview('')}
                                                />
                                            ) : (
                                                <div style={styles.previewNoImage}>
                                                    <div style={styles.noImageIcon}>📚</div>
                                                    <span style={styles.noImageText}>No Cover Image</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div style={styles.previewDetails}>
                                            <h4 style={styles.previewBookTitle}>
                                                {formData.title || 'Untitled Book'}
                                            </h4>
                                            <p style={styles.previewBookAuthor}>
                                                by {formData.author || 'Unknown Author'}
                                            </p>
                                            
                                            <div style={styles.previewPrice}>
                                                <span style={styles.priceLabel}>Price:</span>
                                                <span style={styles.priceValue}>
                                                    {formatPrice(formData.price) || '$0.00'}
                                                </span>
                                            </div>
                                            
                                            <div style={styles.previewMeta}>
                                                <div style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>Category:</span>
                                                    <span style={styles.categoryBadge}>
                                                        {formData.category || 'Uncategorized'}
                                                    </span>
                                                </div>
                                                <div style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>Condition:</span>
                                                    <span style={styles.conditionBadge}>
                                                        {formData.condition || 'Good'}
                                                    </span>
                                                </div>
                                                <div style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>ISBN:</span>
                                                    <span style={styles.metaValue}>
                                                        {formData.isbn || 'Not specified'}
                                                    </span>
                                                </div>
                                                <div style={styles.metaItem}>
                                                    <span style={styles.metaLabel}>Stock:</span>
                                                    <span style={styles.stockBadge}>
                                                        {formData.stock_quantity || 1} available
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {formData.description && (
                                                <div style={styles.previewDescription}>
                                                    <h5 style={styles.descriptionTitle}>Description:</h5>
                                                    <p style={styles.descriptionText}>
                                                        {formData.description.length > 200 
                                                            ? `${formData.description.substring(0, 200)}...` 
                                                            : formData.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.previewMissing}>
                                    <h5 style={styles.missingTitle}>Missing Required Fields:</h5>
                                    <ul style={styles.missingList}>
                                        {!formData.title && <li>Book title is required</li>}
                                        {!formData.author && <li>Author name is required</li>}
                                        {!formData.price && <li>Price is required</li>}
                                        {!formData.category && <li>Category is required</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div style={styles.formActions}>
                    <div style={styles.navigationButtons}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            disabled={activeTab === 'basic'}
                            className="btn btn-outline"
                            style={styles.navButton}
                        >
                            ← Basic
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            disabled={activeTab === 'details'}
                            className="btn btn-outline"
                            style={styles.navButton}
                        >
                            Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('seller')}
                            disabled={activeTab === 'seller'}
                            className="btn btn-outline"
                            style={styles.navButton}
                        >
                            Seller
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            disabled={activeTab === 'preview'}
                            className="btn btn-outline"
                            style={styles.navButton}
                        >
                            Preview →
                        </button>
                    </div>
                    
                    <div style={styles.actionButtons}>
                        <button
                            type="submit"
                            className="btn btn-gold"
                            style={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div style={styles.buttonSpinner}></div>
                                    {isEditMode ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? '📝 Update Book' : '➕ Add Book'}
                                </>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-outline"
                            style={styles.secondaryButton}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const styles = {
    // Header
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    title: {
        fontSize: '2.5rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#6b7280',
        fontSize: '1rem',
        maxWidth: '600px',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
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

    // Alerts
    alert: {
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.25rem',
    },
    alertIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    successRedirect: {
        fontSize: '0.9rem',
        color: '#065f46',
        marginTop: '0.5rem',
        fontStyle: 'italic',
    },

    // Tabs
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
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

    // Form
    form: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
    },
    formContent: {
        padding: '2rem',
    },
    tabContent: {
        minHeight: '400px',
    },

    // Form Grid
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
    },
    formColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },

    // Input Styles
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
        minHeight: '120px',
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
    charCount: {
        textAlign: 'right',
        color: '#9ca3af',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
    },

    // Helper Text
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

    // Checkbox
    checkboxGroup: {
        marginTop: '1rem',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    checkboxText: {
        color: '#1f2937',
        fontSize: '0.95rem',
        fontWeight: '500',
    },

    // Sections
    sellerInfoSection: {
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    sectionTitle: {
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        fontSize: '1.3rem',
    },
    sectionDescription: {
        color: '#6b7280',
        fontSize: '0.95rem',
    },
    sellerNotes: {
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },
    notesTitle: {
        color: '#1e3a8a',
        fontSize: '1rem',
        marginBottom: '0.5rem',
    },
    notesList: {
        margin: 0,
        paddingLeft: '1.5rem',
        color: '#6b7280',
        fontSize: '0.9rem',
        lineHeight: '1.6',
    },

    // Preview Section
    previewSection: {
        padding: '1rem',
    },
    previewTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    previewSubtitle: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginBottom: '2rem',
    },
    previewCard: {
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        marginBottom: '2rem',
    },
    previewHeader: {
        padding: '1rem 1.5rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
    },
    previewBadge: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
    },
    featuredBadge: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    statusBadge: {
        color: '#ffffff',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
    },
    previewContent: {
        padding: '1.5rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
    },
    previewImageSection: {
        flexShrink: 0,
    },
    previewImage: {
        width: '180px',
        height: '270px',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    previewNoImage: {
        width: '180px',
        height: '270px',
        backgroundColor: '#1e3a8a',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fbbf24',
    },
    noImageIcon: {
        fontSize: '3rem',
        marginBottom: '0.5rem',
    },
    noImageText: {
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    previewDetails: {
        flex: 1,
    },
    previewBookTitle: {
        fontSize: '1.5rem',
        color: '#1f2937',
        marginBottom: '0.5rem',
        fontWeight: '600',
    },
    previewBookAuthor: {
        color: '#6b7280',
        fontSize: '1rem',
        marginBottom: '1.5rem',
    },
    previewPrice: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    priceLabel: {
        color: '#6b7280',
        fontSize: '0.95rem',
    },
    priceValue: {
        color: '#1e3a8a',
        fontSize: '1.8rem',
        fontWeight: '700',
    },
    previewMeta: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    metaItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    metaLabel: {
        color: '#6b7280',
        fontSize: '0.85rem',
    },
    metaValue: {
        color: '#1f2937',
        fontSize: '0.95rem',
        fontWeight: '500',
    },
    categoryBadge: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
        display: 'inline-block',
    },
    conditionBadge: {
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
        display: 'inline-block',
    },
    stockBadge: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '500',
        display: 'inline-block',
    },
    previewDescription: {
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
    },
    descriptionTitle: {
        color: '#1e3a8a',
        fontSize: '1rem',
        marginBottom: '0.5rem',
        fontWeight: '600',
    },
    descriptionText: {
        color: '#4b5563',
        fontSize: '0.95rem',
        lineHeight: '1.6',
    },
    previewMissing: {
        backgroundColor: '#fef3c7',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #fbbf24',
    },
    missingTitle: {
        color: '#92400e',
        fontSize: '1rem',
        marginBottom: '0.75rem',
        fontWeight: '600',
    },
    missingList: {
        margin: 0,
        paddingLeft: '1.5rem',
        color: '#92400e',
        fontSize: '0.95rem',
        lineHeight: '1.6',
    },

    // Form Actions
    formActions: {
        padding: '2rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    navigationButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    navButton: {
        padding: '0.75rem 1.5rem',
        minWidth: '100px',
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    submitButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        minWidth: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
    },
    secondaryButton: {
        padding: '0.75rem 2rem',
        minWidth: '120px',
    },
    buttonSpinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .tab:hover:not(.active) {
        color: #1e3a8a;
        background-color: #f0f9ff;
    }
    
    .input:focus, .textarea:focus, .filter-select:focus {
        border-color: #1e3a8a;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        outline: none;
    }
    
    .submit-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .nav-button:hover:not(:disabled) {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
    }
    
    .cancel-button:hover {
        border-color: #6b7280 !important;
        color: #6b7280 !important;
        background-color: #f3f4f6 !important;
    }
    
    .secondary-button:hover {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
    }
    
    .checkbox:hover {
        border-color: #1e3a8a;
    }
`;
document.head.appendChild(styleSheet);

export default AddEditBook;