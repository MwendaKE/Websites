import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { collectionAPI, bookAPI } from '../services/api';
import '../styles/theme.css';

/**
 * Category Books Page - Display books by collection/category
 */
const CategoryBooksPage = () => {
    const { category } = useParams();
    const [collection, setCollection] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            fetchCategoryBooks();
        }
    }, [category]);

    const fetchCategoryBooks = async () => {
        try {
            setLoading(true);
            
            // Try to get collection by slug first
            const collectionResponse = await collectionAPI.getBySlug(category);
            
            if (collectionResponse.success && collectionResponse.data) {
                setCollection(collectionResponse.data);
                setBooks(collectionResponse.data.books || []);
                setError('');
            } else {
                // Fallback to category API
                const booksResponse = await bookAPI.getAll(category, '');
                if (booksResponse.success) {
                    setCollection({
                        name: category.charAt(0).toUpperCase() + category.slice(1),
                        description: `Books in ${category} category`,
                        book_count: booksResponse.data?.length || 0
                    });
                    setBooks(booksResponse.data || []);
                } else {
                    setError('Category not found');
                }
            }
        } catch (err) {
            console.error('Category books fetch error:', err);
            setError(`Error loading ${category} books. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 page-container">
            {/* Back Button */}
            <Link to="/categories" style={styles.backButton}>
                ← Back to Categories
            </Link>

            {/* Category Header */}
            <section style={styles.categoryHeader}>
                <h1>{collection?.name || category}</h1>
                <p style={styles.categoryDescription}>
                    {collection?.description || `Browse our collection of ${category} books`}
                </p>
                <div style={styles.categoryStats}>
                    <span>{books.length} {books.length === 1 ? 'book' : 'books'} available</span>
                </div>
            </section>

            {/* Books Grid */}
            <section className="mt-4">
                {loading ? (
                    <div style={styles.loading}>
                        <div className="spinner"></div>
                        <p>Loading books...</p>
                    </div>
                ) : error ? (
                    <div style={styles.error}>
                        <p>{error}</p>
                        <button onClick={fetchCategoryBooks} className="btn btn-gold">
                            Retry
                        </button>
                    </div>
                ) : books.length > 0 ? (
                    <div style={styles.booksGrid}>
                        {books.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div style={styles.noBooks}>
                        <h3>No Books in This Category</h3>
                        <p>Check back soon for new additions to this category!</p>
                        <Link to="/categories" className="btn btn-gold mt-3">
                            Browse Other Categories
                        </Link>
                    </div>
                )}
            </section>

            {/* Related Categories */}
            {collection && (
                <section className="blue-bg" style={styles.relatedSection}>
                    <div className="container">
                        <h2 style={styles.whiteText}>Explore More Categories</h2>
                        <p style={styles.whiteText}>
                            Discover books from other categories you might enjoy.
                        </p>
                        <div style={styles.relatedLinks}>
                            <Link to="/categories/fiction" style={styles.relatedLink}>Fiction</Link>
                            <Link to="/categories/science-fiction" style={styles.relatedLink}>Science Fiction</Link>
                            <Link to="/categories/mystery" style={styles.relatedLink}>Mystery</Link>
                            <Link to="/categories/romance" style={styles.relatedLink}>Romance</Link>
                            <Link to="/categories/biography" style={styles.relatedLink}>Biography</Link>
                            <Link to="/categories/self-help" style={styles.relatedLink}>Self-Help</Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

const styles = {
    backButton: {
        display: 'inline-block',
        color: '#1e3a8a',
        textDecoration: 'none',
        marginBottom: '1rem',
        fontSize: '1rem',
        fontWeight: '500',
    },
    categoryHeader: {
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    categoryDescription: {
        color: '#6b7280',
        fontSize: '1.1rem',
        margin: '0.5rem 0 1rem',
    },
    categoryStats: {
        color: '#1e3a8a',
        fontWeight: '500',
        fontSize: '1rem',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        gap: '1rem',
    },
    error: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: '#fee2e2',
        borderRadius: '8px',
        color: '#991b1b',
    },
    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    noBooks: {
        textAlign: 'center',
        padding: '4rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '2rem',
    },
    relatedSection: {
        padding: '3rem 0',
        borderRadius: '8px',
        marginTop: '2rem',
        textAlign: 'center',
    },
    whiteText: {
        color: '#ffffff',
    },
    relatedLinks: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        marginTop: '1.5rem',
    },
    relatedLink: {
        color: '#fbbf24',
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease',
    },
};

export default CategoryBooksPage;