import React, { useState } from 'react';
import { contactAPI } from '../services/api';
import '../styles/theme.css';

/**
 * Contact Page - Professional contact page for SomaNova
 */
const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

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
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.subject.trim()) {
            errors.subject = 'Subject is required';
        }
        
        if (!formData.message.trim()) {
            errors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setError('Please fix the errors below');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await contactAPI.submit(formData);
            
            if (response.success) {
                setSuccess(true);
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                });
                setFormErrors({});
            } else {
                setError(response.message || 'Failed to submit form. Please try again.');
            }
        } catch (err) {
            setError('Error submitting form. Please try again or contact us directly.');
            console.error('Contact form error:', err);
        } finally {
            setLoading(false);
        }
    };

    const contactOptions = [
        {
            icon: '📧',
            title: 'Email Support',
            description: 'For general inquiries and support',
            value: 'support@somanova.com',
            action: 'mailto:support@somanova.com',
            color: '#3b82f6'
        },
        {
            icon: '💼',
            title: 'Business Inquiries',
            description: 'For partnerships and collaborations',
            value: 'business@somanova.com',
            action: 'mailto:business@somanova.com',
            color: '#8b5cf6'
        },
        {
            icon: '🤝',
            title: 'Seller Support',
            description: 'Help with listing and selling books',
            value: 'sellers@somanova.com',
            action: 'mailto:sellers@somanova.com',
            color: '#10b981'
        },
        {
            icon: '📱',
            title: 'Response Time',
            description: 'We typically respond within',
            value: '24-48 hours',
            action: null,
            color: '#f59e0b'
        }
    ];

    const faqs = [
        {
            question: 'How do I sell my books on SomaNova?',
            answer: 'Visit our Sell page, create a listing with book details, set your price, and connect with interested readers directly.'
        },
        {
            question: 'Is there a fee for using SomaNova?',
            answer: 'No, listing and browsing books is completely free. We only facilitate connections between readers and sellers.'
        },
        {
            question: 'How are book conditions verified?',
            answer: 'Sellers provide detailed condition descriptions and photos. We encourage honest communication between all parties.'
        },
        {
            question: 'Can I request a specific book?',
            answer: 'Yes! Use our contact form to request books, and our community will help you find what you\'re looking for.'
        }
    ];

    return (
        <div style={styles.page}>
            {/* Hero Section */}
            <section className="blue-bg" style={styles.hero}>
                <div className="container">
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={styles.badgeText}>📬 Get in Touch</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            We're Here to
                            <span style={styles.highlight}> Help You</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            Have questions, feedback, or need assistance? Our team is ready to help 
                            you with anything related to your SomaNova experience.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Options */}
            <section className="container mt-5">
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>How to Reach Us</h2>
                    <p style={styles.sectionSubtitle}>
                        Choose the best way to connect based on your needs
                    </p>
                </div>
                
                <div style={styles.contactGrid}>
                    {contactOptions.map((option, index) => (
                        <div 
                            key={index} 
                            className="contact-card"
                            style={styles.contactCard}
                        >
                            <div style={{
                                ...styles.contactIcon,
                                backgroundColor: `${option.color}15`
                            }}>
                                <span style={{ 
                                    ...styles.icon,
                                    color: option.color 
                                }}>
                                    {option.icon}
                                </span>
                            </div>
                            <div style={styles.contactContent}>
                                <h3 style={styles.contactTitle}>{option.title}</h3>
                                <p style={styles.contactDescription}>{option.description}</p>
                                {option.action ? (
                                    <a 
                                        href={option.action}
                                        style={styles.contactValue}
                                    >
                                        {option.value}
                                    </a>
                                ) : (
                                    <span style={styles.contactValue}>{option.value}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Content */}
            <div className="container mt-5">
                <div style={styles.contentGrid}>
                    {/* Contact Form */}
                    <div style={styles.formSection}>
                        <div style={styles.formHeader}>
                            <h2 style={styles.formTitle}>Send Us a Message</h2>
                            <p style={styles.formSubtitle}>
                                Fill out the form below and we'll get back to you as soon as possible.
                            </p>
                        </div>
                        
                        {success ? (
                            <div style={styles.successCard}>
                                <div style={styles.successIcon}>✓</div>
                                <h3 style={styles.successTitle}>Message Sent Successfully!</h3>
                                <p style={styles.successText}>
                                    Thank you for reaching out. We've received your message and will 
                                    respond within 24-48 hours.
                                </p>
                                <button 
                                    onClick={() => setSuccess(false)} 
                                    className="btn btn-gold"
                                    style={styles.newMessageButton}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={styles.form}>
                                {error && (
                                    <div style={styles.errorAlert}>
                                        <div style={styles.errorIcon}>⚠️</div>
                                        <div>
                                            <strong>Error:</strong> {error}
                                        </div>
                                    </div>
                                )}
                                
                                <div style={styles.formGrid}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="name">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter your full name"
                                            style={{
                                                ...styles.input,
                                                ...(formErrors.name && styles.inputError)
                                            }}
                                        />
                                        {formErrors.name && (
                                            <div style={styles.errorText}>{formErrors.name}</div>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="email">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="your.email@example.com"
                                            style={{
                                                ...styles.input,
                                                ...(formErrors.email && styles.inputError)
                                            }}
                                        />
                                        {formErrors.email && (
                                            <div style={styles.errorText}>{formErrors.email}</div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label" htmlFor="subject">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="What is this regarding?"
                                        style={{
                                            ...styles.input,
                                            ...(formErrors.subject && styles.inputError)
                                        }}
                                    />
                                    {formErrors.subject && (
                                        <div style={styles.errorText}>{formErrors.subject}</div>
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label" htmlFor="message">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="form-input form-textarea"
                                        placeholder="Please provide as much detail as possible..."
                                        rows="6"
                                        style={{
                                            ...styles.textarea,
                                            ...(formErrors.message && styles.inputError)
                                        }}
                                    />
                                    {formErrors.message && (
                                        <div style={styles.errorText}>{formErrors.message}</div>
                                    )}
                                    <div style={styles.charCount}>
                                        {formData.message.length} / 5000 characters
                                    </div>
                                </div>
                                
                                <div style={styles.formActions}>
                                    <button 
                                        type="submit" 
                                        className="btn btn-gold"
                                        style={styles.submitButton}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div style={styles.buttonSpinner}></div>
                                                Sending Message...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setFormData({
                                                name: '',
                                                email: '',
                                                subject: '',
                                                message: '',
                                            });
                                            setFormErrors({});
                                            setError('');
                                        }}
                                        className="btn btn-outline"
                                        style={styles.resetButton}
                                    >
                                        Clear Form
                                    </button>
                                </div>
                                
                                <div style={styles.formFooter}>
                                    <p style={styles.footerText}>
                                        * Required fields. We respect your privacy and will never 
                                        share your information with third parties.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                    
                    {/* FAQ Sidebar */}
                    <div style={styles.faqSection}>
                        <div style={styles.faqHeader}>
                            <h2 style={styles.faqTitle}>Frequently Asked Questions</h2>
                            <p style={styles.faqSubtitle}>
                                Quick answers to common questions
                            </p>
                        </div>
                        
                        <div style={styles.faqList}>
                            {faqs.map((faq, index) => (
                                <div key={index} style={styles.faqItem}>
                                    <h3 style={styles.faqQuestion}>{faq.question}</h3>
                                    <p style={styles.faqAnswer}>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div style={styles.helpSection}>
                            <h3 style={styles.helpTitle}>Need Immediate Help?</h3>
                            <p style={styles.helpText}>
                                Check our <a href="/help" style={styles.helpLink}>Help Center</a> 
                                for detailed guides and troubleshooting articles.
                            </p>
                            <div style={styles.helpStats}>
                                <div style={styles.stat}>
                                    <span style={styles.statNumber}>98%</span>
                                    <span style={styles.statLabel}>Customer Satisfaction</span>
                                </div>
                                <div style={styles.stat}>
                                    <span style={styles.statNumber}>24h</span>
                                    <span style={styles.statLabel}>Average Response Time</span>
                                </div>
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
    
    // Section Header
    sectionHeader: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    sectionTitle: {
        fontSize: '2.2rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    sectionSubtitle: {
        color: '#6b7280',
        fontSize: '1rem',
    },
    
    // Contact Options
    contactGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
    },
    contactCard: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s ease',
        textAlign: 'center',
    },
    contactIcon: {
        width: '70px',
        height: '70px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1rem',
    },
    icon: {
        fontSize: '2rem',
    },
    contactContent: {
        textAlign: 'center',
    },
    contactTitle: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        fontWeight: '600',
    },
    contactDescription: {
        color: '#6b7280',
        fontSize: '0.9rem',
        marginBottom: '0.75rem',
        lineHeight: '1.4',
    },
    contactValue: {
        color: '#1e3a8a',
        fontSize: '0.95rem',
        fontWeight: '500',
        textDecoration: 'none',
        display: 'block',
        wordBreak: 'break-word',
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
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
    },
    formHeader: {
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    formTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    formSubtitle: {
        color: '#6b7280',
        fontSize: '1rem',
        lineHeight: '1.5',
    },
    
    // Success Card
    successCard: {
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: '#d1fae5',
        borderRadius: '12px',
        border: '1px solid #a7f3d0',
        color: '#065f46',
    },
    successIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
    },
    successTitle: {
        fontSize: '1.8rem',
        marginBottom: '1rem',
        color: '#065f46',
    },
    successText: {
        fontSize: '1rem',
        lineHeight: '1.6',
        marginBottom: '2rem',
        maxWidth: '500px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    newMessageButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
    },
    
    // Form Styles
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    errorAlert: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid #fecaca',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
    },
    errorIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
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
        minHeight: '150px',
        transition: 'all 0.3s ease',
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
    
    // Form Actions
    formActions: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
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
    resetButton: {
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
    formFooter: {
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
    },
    footerText: {
        color: '#6b7280',
        fontSize: '0.85rem',
        lineHeight: '1.4',
    },
    
    // FAQ Section
    faqSection: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    faqHeader: {
        marginBottom: '1rem',
    },
    faqTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    faqSubtitle: {
        color: '#6b7280',
        fontSize: '1rem',
    },
    faqList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    faqItem: {
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        transition: 'all 0.3s ease',
    },
    faqQuestion: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '0.75rem',
        fontWeight: '600',
    },
    faqAnswer: {
        color: '#6b7280',
        fontSize: '0.95rem',
        lineHeight: '1.5',
    },
    
    // Help Section
    helpSection: {
        padding: '1.5rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd',
    },
    helpTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
        fontWeight: '600',
    },
    helpText: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginBottom: '1.5rem',
        lineHeight: '1.5',
    },
    helpLink: {
        color: '#1e3a8a',
        fontWeight: '500',
        textDecoration: 'none',
    },
    helpStats: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    stat: {
        textAlign: 'center',
        flex: 1,
        minWidth: '80px',
    },
    statNumber: {
        display: 'block',
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1e3a8a',
        marginBottom: '0.25rem',
    },
    statLabel: {
        display: 'block',
        fontSize: '0.8rem',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .contact-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .faq-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #1e3a8a;
        background-color: #ffffff;
    }
    
    .input:focus, .textarea:focus {
        border-color: #1e3a8a !important;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1) !important;
        outline: none;
    }
    
    .submit-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .reset-button:hover {
        border-color: #1e3a8a !important;
        color: #1e3a8a !important;
        background-color: #f0f9ff !important;
    }
    
    .new-message-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .contact-value:hover {
        color: #f59e0b !important;
        text-decoration: underline;
    }
    
    .help-link:hover {
        color: #f59e0b !important;
        text-decoration: underline;
    }
    
    @media (max-width: 768px) {
        .content-grid {
            grid-template-columns: 1fr;
        }
        
        .contact-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
    }
`;
document.head.appendChild(styleSheet);

export default ContactPage;