import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/theme.css';

/**
 * About Page - Professional about page for SomaNova
 */
const AboutPage = () => {
    return (
        <div style={styles.page}>
            {/* Hero Section */}
            <section className="blue-bg" style={styles.hero}>
                <div className="container">
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <span style={styles.badgeText}>📖 Our Story</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            Welcome to
                            <span style={styles.highlight}> SomaNova</span>
                        </h1>
                        <p style={styles.heroSubtitle}>
                            A modern marketplace where stories find new homes and readers 
                            discover affordable treasures. Join us in creating a sustainable 
                            reading community.
                        </p>
                        <div style={styles.heroStats}>
                            <div style={styles.statItem}>
                                <span style={styles.statNumber}>1000+</span>
                                <span style={styles.statLabel}>Books Shared</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statNumber}>500+</span>
                                <span style={styles.statLabel}>Happy Readers</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statNumber}>50+</span>
                                <span style={styles.statLabel}>Categories</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="container mt-5">
                <div style={styles.missionGrid}>
                    <div style={styles.missionCard}>
                        <div style={styles.missionIcon}>🎯</div>
                        <h2 style={styles.missionTitle}>Our Mission</h2>
                        <p style={styles.missionText}>
                            To create an accessible, sustainable platform that connects book lovers 
                            with affordable pre-owned books while reducing waste and promoting 
                            literacy.
                        </p>
                    </div>
                    <div style={styles.missionCard}>
                        <div style={styles.missionIcon}>🌟</div>
                        <h2 style={styles.missionTitle}>Our Vision</h2>
                        <p style={styles.missionText}>
                            A world where every book finds its next reader, creating a circular 
                            economy of knowledge and fostering a global community of sustainable 
                            readers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="blue-bg" style={styles.whySection}>
                <div className="container">
                    <div style={styles.sectionHeaderCenter}>
                        <h2 style={styles.whiteTitle}>Why Choose SomaNova</h2>
                        <p style={styles.whiteSubtitle}>
                            Experience the difference with our reader-first approach
                        </p>
                    </div>
                    
                    <div style={styles.featuresGrid}>
                        <div className="feature-card" style={styles.featureCard}>
                            <div style={styles.featureIcon}>💰</div>
                            <h3 style={styles.featureTitle}>Unbeatable Prices</h3>
                            <p style={styles.featureDescription}>
                                Find pre-owned books at 50-80% off retail prices. Quality reading 
                                shouldn't break the bank.
                            </p>
                        </div>
                        
                        <div className="feature-card" style={styles.featureCard}>
                            <div style={styles.featureIcon}>🌱</div>
                            <h3 style={styles.featureTitle}>Eco-Friendly</h3>
                            <p style={styles.featureDescription}>
                                Each book sold saves trees and reduces carbon footprint. Join our 
                                sustainable reading revolution.
                            </p>
                        </div>
                        
                        <div className="feature-card" style={styles.featureCard}>
                            <div style={styles.featureIcon}>✨</div>
                            <h3 style={styles.featureTitle}>Curated Quality</h3>
                            <p style={styles.featureDescription}>
                                Every book is carefully reviewed and categorized. Find exactly 
                                what you're looking for with ease.
                            </p>
                        </div>
                        
                        <div className="feature-card" style={styles.featureCard}>
                            <div style={styles.featureIcon}>🤝</div>
                            <h3 style={styles.featureTitle}>Community Trust</h3>
                            <p style={styles.featureDescription}>
                                Built on genuine reviews and transparent transactions. Join thousands 
                                of satisfied book lovers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="container mt-5">
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>How SomaNova Works</h2>
                    <p style={styles.sectionSubtitle}>
                        Simple, secure, and sustainable - experience the future of book trading
                    </p>
                </div>
                
                <div style={styles.workflow}>
                    <div style={styles.workflowStep}>
                        <div style={styles.stepVisual}>
                            <div style={styles.stepNumber}>01</div>
                            <div style={styles.stepLine}></div>
                        </div>
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>Discover & Browse</h3>
                            <p style={styles.stepDescription}>
                                Explore our vast collection organized by genre, condition, and price. 
                                Use our advanced filters to find your perfect match.
                            </p>
                        </div>
                    </div>
                    
                    <div style={styles.workflowStep}>
                        <div style={styles.stepVisual}>
                            <div style={styles.stepNumber}>02</div>
                            <div style={styles.stepLine}></div>
                        </div>
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>Connect & Verify</h3>
                            <p style={styles.stepDescription}>
                                Message sellers directly, ask questions, and verify book conditions 
                                through our secure communication platform.
                            </p>
                        </div>
                    </div>
                    
                    <div style={styles.workflowStep}>
                        <div style={styles.stepVisual}>
                            <div style={styles.stepNumber}>03</div>
                            <div style={styles.stepLine}></div>
                        </div>
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>Secure Transaction</h3>
                            <p style={styles.stepDescription}>
                                Complete purchases with confidence using our protected payment system 
                                and buyer satisfaction guarantee.
                            </p>
                        </div>
                    </div>
                    
                    <div style={styles.workflowStep}>
                        <div style={styles.stepVisual}>
                            <div style={styles.stepNumber}>04</div>
                        </div>
                        <div style={styles.stepContent}>
                            <h3 style={styles.stepTitle}>Enjoy & Share</h3>
                            <p style={styles.stepDescription}>
                                Receive your book and dive into your next adventure. Share your 
                                experience and help grow our reading community.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Impact */}
            <section style={styles.impactSection}>
                <div className="container">
                    <div style={styles.sectionHeaderCenter}>
                        <h2 style={styles.sectionTitle}>Our Community Impact</h2>
                        <p style={styles.sectionSubtitle}>
                            Join a movement that makes a real difference
                        </p>
                    </div>
                    
                    <div style={styles.impactGrid}>
                        <div style={styles.impactCard}>
                            <div style={styles.impactIcon}>📚</div>
                            <div style={styles.impactContent}>
                                <h3 style={styles.impactTitle}>Books Given New Life</h3>
                                <p style={styles.impactText}>
                                    Every book sold extends its lifespan, reducing waste and 
                                    preserving literary treasures for future generations.
                                </p>
                            </div>
                        </div>
                        
                        <div style={styles.impactCard}>
                            <div style={styles.impactIcon}>👥</div>
                            <div style={styles.impactContent}>
                                <h3 style={styles.impactTitle}>Reading Made Accessible</h3>
                                <p style={styles.impactText}>
                                    Affordable prices mean more people can access great literature, 
                                    promoting literacy and lifelong learning.
                                </p>
                            </div>
                        </div>
                        
                        <div style={styles.impactCard}>
                            <div style={styles.impactIcon}>💚</div>
                            <div style={styles.impactContent}>
                                <h3 style={styles.impactTitle}>Environmental Savings</h3>
                                <p style={styles.impactText}>
                                    By reusing books, we save thousands of trees annually and 
                                    significantly reduce our carbon footprint.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Values */}
            <section className="blue-bg" style={styles.valuesSection}>
                <div className="container">
                    <div style={styles.sectionHeaderCenter}>
                        <h2 style={styles.whiteTitle}>Our Core Values</h2>
                        <p style={styles.whiteSubtitle}>
                            The principles that guide everything we do
                        </p>
                    </div>
                    
                    <div style={styles.valuesGrid}>
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>🔍</div>
                            <h4 style={styles.valueTitle}>Transparency</h4>
                            <p style={styles.valueDescription}>
                                Clear pricing, honest condition descriptions, and open 
                                communication between all members.
                            </p>
                        </div>
                        
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>🤝</div>
                            <h4 style={styles.valueTitle}>Community</h4>
                            <p style={styles.valueDescription}>
                                Building meaningful connections between readers and fostering 
                                a supportive book-loving environment.
                            </p>
                        </div>
                        
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>🌍</div>
                            <h4 style={styles.valueTitle}>Sustainability</h4>
                            <p style={styles.valueDescription}>
                                Committed to reducing environmental impact through circular 
                                economy practices and conscious consumption.
                            </p>
                        </div>
                        
                        <div style={styles.valueCard}>
                            <div style={styles.valueIcon}>🎯</div>
                            <h4 style={styles.valueTitle}>Accessibility</h4>
                            <p style={styles.valueDescription}>
                                Making quality literature available to everyone, regardless 
                                of budget or location.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join CTA */}
            <section className="container mt-5">
                <div style={styles.joinCard}>
                    <div style={styles.joinContent}>
                        <h2 style={styles.joinTitle}>Ready to Join Our Story?</h2>
                        <p style={styles.joinText}>
                            Become part of a growing community that's changing how we read, 
                            share, and value books. Your next literary adventure awaits.
                        </p>
                        <div style={styles.joinButtons}>
                            <Link to="/books" className="btn btn-gold" style={styles.joinButton}>
                                Start Browsing
                            </Link>
                            <Link to="/sell" className="btn" style={styles.joinSecondaryButton}>
                                Sell Your Books
                            </Link>
                            <Link to="/contact" className="btn btn-outline" style={styles.joinOutlineButton}>
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    <div style={styles.joinImage}>
                        <div style={styles.imagePlaceholder}>📚✨</div>
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
    heroStats: {
        display: 'flex',
        justifyContent: 'center',
        gap: '3rem',
        flexWrap: 'wrap',
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    statItem: {
        textAlign: 'center',
    },
    statNumber: {
        display: 'block',
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#fbbf24',
        marginBottom: '0.25rem',
    },
    statLabel: {
        display: 'block',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    
    // Mission Section
    missionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    missionCard: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        transition: 'all 0.3s ease',
    },
    missionIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    missionTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    missionText: {
        color: '#6b7280',
        fontSize: '1rem',
        lineHeight: '1.6',
    },
    
    // Why Section
    whySection: {
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        margin: '3rem 0',
    },
    sectionHeaderCenter: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    whiteTitle: {
        fontSize: '2.2rem',
        color: '#ffffff',
        marginBottom: '0.5rem',
    },
    whiteSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1rem',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    featureCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        transition: 'all 0.3s ease',
    },
    featureIcon: {
        fontSize: '2.5rem',
        marginBottom: '1.5rem',
    },
    featureTitle: {
        fontSize: '1.2rem',
        color: '#ffffff',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    featureDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.95rem',
        lineHeight: '1.5',
    },
    
    // How It Works
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
    workflow: {
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
    },
    workflowStep: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '2.5rem',
    },
    stepVisual: {
        position: 'relative',
        marginRight: '2rem',
        flexShrink: 0,
    },
    stepNumber: {
        width: '50px',
        height: '50px',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: '700',
        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
    },
    stepLine: {
        position: 'absolute',
        left: '25px',
        top: '50px',
        width: '2px',
        height: '100px',
        backgroundColor: '#1e3a8a',
        opacity: 0.3,
    },
    stepContent: {
        flex: 1,
        paddingTop: '0.5rem',
    },
    stepTitle: {
        fontSize: '1.3rem',
        color: '#1e3a8a',
        marginBottom: '0.75rem',
        fontWeight: '600',
    },
    stepDescription: {
        color: '#6b7280',
        fontSize: '1rem',
        lineHeight: '1.5',
    },
    
    // Impact Section
    impactSection: {
        padding: '4rem 0',
        backgroundColor: '#f9fafb',
        margin: '3rem 0',
    },
    impactGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    impactCard: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem',
        transition: 'all 0.3s ease',
    },
    impactIcon: {
        fontSize: '2.5rem',
        width: '70px',
        height: '70px',
        backgroundColor: '#f0f9ff',
        color: '#1e3a8a',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    impactContent: {
        flex: 1,
    },
    impactTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        marginBottom: '0.75rem',
        fontWeight: '600',
    },
    impactText: {
        color: '#6b7280',
        fontSize: '0.95rem',
        lineHeight: '1.5',
    },
    
    // Values Section
    valuesSection: {
        padding: '4rem 0',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
    },
    valuesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    valueCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        transition: 'all 0.3s ease',
    },
    valueIcon: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },
    valueTitle: {
        fontSize: '1.2rem',
        color: '#ffffff',
        marginBottom: '0.75rem',
        fontWeight: '600',
    },
    valueDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.9rem',
        lineHeight: '1.5',
    },
    
    // Join CTA
    joinCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        minHeight: '300px',
    },
    joinContent: {
        flex: 1,
        padding: '3rem',
    },
    joinTitle: {
        fontSize: '2rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
        fontWeight: '700',
    },
    joinText: {
        color: '#6b7280',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        marginBottom: '2rem',
    },
    joinButtons: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    joinButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
    },
    joinSecondaryButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textDecoration: 'none',
    },
    joinOutlineButton: {
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        borderColor: '#1e3a8a',
        color: '#1e3a8a',
        textDecoration: 'none',
    },
    joinImage: {
        flex: 1,
        height: '300px',
        backgroundColor: '#1e3a8a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePlaceholder: {
        fontSize: '5rem',
        color: '#fbbf24',
        opacity: 0.8,
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .mission-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border-color: #1e3a8a;
    }
    
    .feature-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        background-color: rgba(255, 255, 255, 0.15);
    }
    
    .impact-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .value-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        background-color: rgba(255, 255, 255, 0.15);
    }
    
    .join-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }
    
    .join-secondary-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .join-outline-button:hover {
        background-color: #1e3a8a !important;
        color: #ffffff !important;
        transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
        .join-card {
            flex-direction: column;
        }
        
        .join-image {
            order: -1;
            width: 100%;
            height: 200px;
        }
        
        .workflow-step {
            flex-direction: column;
            text-align: center;
        }
        
        .step-visual {
            margin-right: 0;
            margin-bottom: 1rem;
        }
        
        .step-line {
            display: none;
        }
    }
`;
document.head.appendChild(styleSheet);

export default AboutPage;