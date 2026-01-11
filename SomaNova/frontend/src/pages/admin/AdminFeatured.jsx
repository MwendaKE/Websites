import React, { useState, useEffect } from 'react';
import { adminAPI, bookAPI } from '../../services/api';
import { getBookImage, handleImageError } from '../../utils/imageUtils';
import '../../styles/theme.css';

/**
 * Admin Featured Books Management Page
 */
const AdminFeatured = () => {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [error, setError] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [displayOrder, setDisplayOrder] = useState(0);
    const [reorderMode, setReorderMode] = useState(false);

    useEffect(() => {
        fetchFeaturedBooks();
        fetchAllBooks();
    }, []);

    const fetchFeaturedBooks = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getFeaturedBooks();
            
            if (response.success) {
                // Sort by display_order
                const sorted = response.data.sort((a, b) => a.display_order - b.display_order);
                setFeaturedBooks(sorted);
                setError('');
            } else {
                setError('Failed to load featured books');
            }
        } catch (err) {
            setError('Error loading featured books. Please try again.');
            console.error('Featured books fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllBooks = async () => {
        try {
            setLoadingBooks(true);
            const response = await bookAPI.getAll();
            
            if (response.success) {
                setAllBooks(response.data);
            }
        } catch (err) {
            console.error('Books fetch error:', err);
        } finally {
            setLoadingBooks(false);
        }
    };

    const handleAddFeatured = async () => {
        if (!selectedBook) {
            setError('Please select a book');
            return;
        }

        try {
            await adminAPI.addFeatured({
                book_id: selectedBook.id,
                display_order: displayOrder || 0
            });
            
            fetchFeaturedBooks();
            setAddModalOpen(false);
            setSelectedBook(null);
            setDisplayOrder(0);
        } catch (error) {
            console.error('Error adding featured book:', error);
            setError('Failed to add book to featured');
        }
    };

    const handleRemoveFeatured = async (featuredId) => {
        try {
            await adminAPI.removeFeatured(featuredId);
            fetchFeaturedBooks();
        } catch (error) {
            console.error('Error removing featured book:', error);
            setError('Failed to remove book from featured');
        }
    };

    const handleReorder = async (fromIndex, toIndex) => {
        const reordered = [...featuredBooks];
        const [movedItem] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, movedItem);
        
        // Update display_order based on new position
        const updated = reordered.map((item, index) => ({
            ...item,
            display_order: index
        }));
        
        setFeaturedBooks(updated);
        
        // In a real app, you would send updates to the backend here
        // For now, we'll just update locally
    };

    const handleSaveOrder = async () => {
        try {
            // Save new order to backend
            // This would require a new API endpoint
            console.log('Saving new order:', featuredBooks);
            setReorderMode(false);
        } catch (error) {
            console.error('Error saving order:', error);
            setError('Failed to save order');
        }
    };

    const formatPrice = (price) => {
        return price ? `$${price.toFixed(2)}` : '$0.00';
    };

    const filteredBooks = allBooks.filter(book => {
        const isAlreadyFeatured = featuredBooks.some(fb => fb.book_id === book.id);
        const matchesSearch = !searchTerm || 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        
        return !isAlreadyFeatured && matchesSearch;
    });

    return (
        <div className="container mt-4 page-container">
            <div style={styles.header}>
                <div>
                    <h1>Featured Books Management</h1>
                    <p style={styles.subtitle}>
                        Showcase special books on the homepage
                    </p>
                </div>
                <div style={styles.headerActions}>
                    <button 
                        onClick={() => setReorderMode(!reorderMode)}
                        className="btn"
                        style={styles.actionButton}
                    >
                        {reorderMode ? 'Cancel Reorder' : 'Reorder Items'}
                    </button>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="btn btn-gold"
                        style={styles.addButton}
                    >
                        Add Featured Book
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={styles.alert}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>
                    <div className="spinner"></div>
                    <p>Loading featured books...</p>
                </div>
            ) : featuredBooks.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>⭐</div>
                    <h3>No Featured Books Yet</h3>
                    <p>Start by adding some books to the featured section.</p>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="btn btn-gold"
                    >
                        Add Your First Featured Book
                    </button>
                </div>
            ) : (
                <>
                    {reorderMode && (
                        <div style={styles.reorderNotice}>
                            <p>
                                <strong>Reorder Mode:</strong> Drag and drop books to reorder them.
                                Click "Save Order" when done.
                            </p>
                            <div style={styles.reorderActions}>
                                <button 
                                    onClick={handleSaveOrder}
                                    className="btn btn-gold"
                                    style={styles.saveOrderButton}
                                >
                                    Save Order
                                </button>
                                <button 
                                    onClick={() => setReorderMode(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={styles.featuredGrid}>
                        {featuredBooks.map((featured, index) => (
                            <div 
                                key={featured.id}
                                draggable={reorderMode}
                                onDragStart={(e) => {
                                    if (reorderMode) {
                                        e.dataTransfer.setData('text/plain', index.toString());
                                    }
                                }}
                                onDragOver={(e) => {
                                    if (reorderMode) {
                                        e.preventDefault();
                                    }
                                }}
                                onDrop={(e) => {
                                    if (reorderMode) {
                                        e.preventDefault();
                                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                        handleReorder(fromIndex, index);
                                    }
                                }}
                                style={{
                                    ...styles.featuredCard,
                                    ...(reorderMode ? styles.reorderCard : {})
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    <div style={styles.orderBadge}>
                                        #{index + 1}
                                    </div>
                                    {reorderMode ? (
                                        <div style={styles.dragHandle}>
                                            ⋮⋮
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleRemoveFeatured(featured.id)}
                                            className="btn btn-outline"
                                            style={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                
                                {featured.book ? (
                                    <div style={styles.bookInfo}>
                                        <img
                                            src={getBookImage(featured.book.image_url, featured.book.title)}
                                            alt={featured.book.title}
                                            style={styles.bookImage}
                                            onError={(e) => handleImageError(e, featured.book.title)}
                                        />
                                        <div style={styles.bookDetails}>
                                            <h4 style={styles.bookTitle}>{featured.book.title}</h4>
                                            <p style={styles.bookAuthor}>by {featured.book.author}</p>
                                            <p style={styles.bookPrice}>
                                                {formatPrice(featured.book.price)}
                                            </p>
                                            <div style={styles.bookMeta}>
                                                <span style={styles.categoryBadge}>
                                                    {featured.book.category}
                                                </span>
                                                {featured.book.condition && (
                                                    <span style={styles.conditionBadge}>
                                                        {featured.book.condition}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.bookMissing}>
                                        <p>Book information unavailable</p>
                                    </div>
                                )}
                                
                                <div style={styles.cardFooter}>
                                    <small style={styles.addedDate}>
                                        Added: {new Date(featured.created_at).toLocaleDateString()}
                                    </small>
                                    <div style={styles.displayOrder}>
                                        Display Order: <strong>{featured.display_order}</strong>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Add Featured Book Modal */}
            {addModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3>Add Featured Book</h3>
                            <button 
                                onClick={() => {
                                    setAddModalOpen(false);
                                    setSelectedBook(null);
                                    setDisplayOrder(0);
                                }}
                                style={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={styles.modalContent}>
                            <div className="form-group">
                                <label className="form-label">Display Order</label>
                                <input
                                    type="number"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                                    className="form-input"
                                    placeholder="0"
                                    min="0"
                                />
                                <small style={styles.helperText}>
                                    Lower numbers appear first
                                </small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Search Books</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input"
                                    placeholder="Search books by title or author..."
                                />
                            </div>

                            {loadingBooks ? (
                                <div style={styles.booksLoading}>
                                    <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                    <p>Loading books...</p>
                                </div>
                            ) : (
                                <div style={styles.booksList}>
                                    {filteredBooks.length === 0 ? (
                                        <div style={styles.noBooks}>
                                            <p>
                                                {searchTerm 
                                                    ? 'No books found matching your search'
                                                    : 'All books are already featured'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredBooks.slice(0, 10).map(book => (
                                            <div
                                                key={book.id}
                                                onClick={() => setSelectedBook(book)}
                                                style={{
                                                    ...styles.bookOption,
                                                    ...(selectedBook?.id === book.id ? styles.selectedBook : {})
                                                }}
                                            >
                                                <img
                                                    src={getBookImage(book.image_url, book.title)}
                                                    alt={book.title}
                                                    style={styles.optionImage}
                                                    onError={(e) => handleImageError(e, book.title)}
                                                />
                                                <div style={styles.optionInfo}>
                                                    <strong>{book.title}</strong>
                                                    <p style={styles.optionAuthor}>by {book.author}</p>
                                                    <p style={styles.optionPrice}>{formatPrice(book.price)}</p>
                                                </div>
                                                {selectedBook?.id === book.id && (
                                                    <div style={styles.selectedIndicator}>✓</div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {selectedBook && (
                                <div style={styles.selectionSummary}>
                                    <h4>Selected Book:</h4>
                                    <div style={styles.selectedBookInfo}>
                                        <img
                                            src={getBookImage(selectedBook.image_url, selectedBook.title)}
                                            alt={selectedBook.title}
                                            style={styles.summaryImage}
                                            onError={(e) => handleImageError(e, selectedBook.title)}
                                        />
                                        <div>
                                            <strong>{selectedBook.title}</strong>
                                            <p>by {selectedBook.author}</p>
                                            <p>{formatPrice(selectedBook.price)} • {selectedBook.category}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.modalActions}>
                            <button 
                                onClick={() => {
                                    setAddModalOpen(false);
                                    setSelectedBook(null);
                                    setDisplayOrder(0);
                                }}
                                className="btn"
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddFeatured}
                                className="btn btn-gold"
                                style={styles.confirmButton}
                                disabled={!selectedBook}
                            >
                                Add to Featured
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
    },
    subtitle: {
        color: '#6b7280',
        marginTop: '0.5rem',
    },
    headerActions: {
        display: 'flex',
        gap: '1rem',
    },
    actionButton: {
        padding: '0.75rem 1.5rem',
    },
    addButton: {
        padding: '0.75rem 1.5rem',
    },
    alert: {
        marginBottom: '2rem',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        gap: '1rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
    },
    reorderNotice: {
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        color: '#92400e',
    },
    reorderActions: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    saveOrderButton: {
        padding: '0.75rem 1.5rem',
    },
    featuredGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    featuredCard: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
        position: 'relative',
    },
    reorderCard: {
        cursor: 'move',
        border: '2px dashed #d1d5db',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    orderBadge: {
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    dragHandle: {
        color: '#6b7280',
        cursor: 'move',
        fontSize: '1.5rem',
        padding: '0.5rem',
        userSelect: 'none',
    },
    removeButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
    },
    bookInfo: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
    },
    bookImage: {
        width: '80px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    bookDetails: {
        flex: 1,
    },
    bookTitle: {
        fontSize: '1.1rem',
        marginBottom: '0.5rem',
        color: '#1f2937',
    },
    bookAuthor: {
        color: '#6b7280',
        fontSize: '0.9rem',
        marginBottom: '0.5rem',
    },
    bookPrice: {
        color: '#1e3a8a',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },
    bookMeta: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    categoryBadge: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    conditionBadge: {
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
    },
    bookMissing: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '4px',
        color: '#6b7280',
    },
    cardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
        fontSize: '0.85rem',
        color: '#6b7280',
    },
    addedDate: {
        fontSize: '0.8rem',
    },
    displayOrder: {
        fontSize: '0.9rem',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#6b7280',
        padding: '0.5rem',
        borderRadius: '4px',
        ':hover': {
            backgroundColor: '#f3f4f6',
        },
    },
    modalContent: {
        padding: '1.5rem',
        flex: 1,
        overflowY: 'auto',
    },
    helperText: {
        color: '#6b7280',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
        display: 'block',
    },
    booksLoading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        gap: '1rem',
    },
    booksList: {
        marginTop: '1rem',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
    },
    noBooks: {
        textAlign: 'center',
        padding: '2rem',
        color: '#6b7280',
    },
    bookOption: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    selectedBook: {
        backgroundColor: '#f0f9ff',
        borderLeft: '4px solid #1e3a8a',
    },
    optionImage: {
        width: '50px',
        height: '75px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    optionInfo: {
        flex: 1,
    },
    optionAuthor: {
        color: '#6b7280',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
    },
    optionPrice: {
        color: '#1e3a8a',
        fontWeight: '500',
        marginTop: '0.25rem',
    },
    selectedIndicator: {
        color: '#1e3a8a',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    selectionSummary: {
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
    selectedBookInfo: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginTop: '0.5rem',
    },
    summaryImage: {
        width: '60px',
        height: '90px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        padding: '1.5rem',
        borderTop: '1px solid #e5e7eb',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
    },
    confirmButton: {
        padding: '0.75rem 1.5rem',
    },
};

// Add hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .featured-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .book-option:hover {
        background-color: #f9fafb;
    }
    
    .remove-button:hover {
        border-color: #991b1b;
        color: #991b1b;
    }
    
    .drag-handle:hover {
        color: #1e3a8a;
    }
`;
document.head.appendChild(styleSheet);

export default AdminFeatured;