import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { getBookImage, handleImageError } from '../../utils/imageUtils';
import '../../styles/theme.css';

/**
 * Admin Books Management Page
 */
const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        averagePrice: 0,
        byCategory: {},
        recentCount: 0
    });

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchStats();
    }, [currentPage, categoryFilter, sortBy]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: 20,
                search: search
            };
            
            if (categoryFilter) {
                params.category = categoryFilter;
            }
            
            const response = await adminAPI.getBooks(params);
            
            if (response.success) {
                // Apply sorting
                let sortedBooks = response.data.books;
                if (sortBy === 'price_low') {
                    sortedBooks.sort((a, b) => a.price - b.price);
                } else if (sortBy === 'price_high') {
                    sortedBooks.sort((a, b) => b.price - a.price);
                } else if (sortBy === 'title_asc') {
                    sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
                } else if (sortBy === 'newest') {
                    // Already sorted by newest from API
                }
                
                setBooks(sortedBooks);
                setPagination(response.data.pagination);
                setError('');
            } else {
                setError('Failed to load books');
            }
        } catch (err) {
            setError('Error loading books. Please try again.');
            console.error('Books fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            // This would typically come from an API
            const uniqueCategories = [...new Set(books.map(book => book.category))];
            setCategories(uniqueCategories.sort());
        } catch (err) {
            console.error('Categories fetch error:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const total = pagination.total || books.length;
            const averagePrice = books.length > 0 
                ? books.reduce((sum, book) => sum + (book.price || 0), 0) / books.length 
                : 0;
            
            // Count by category
            const byCategory = {};
            books.forEach(book => {
                byCategory[book.category] = (byCategory[book.category] || 0) + 1;
            });
            
            // Count recent books (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recentCount = books.filter(book => 
                new Date(book.created_at) > weekAgo
            ).length;
            
            setStats({
                total,
                averagePrice,
                byCategory,
                recentCount
            });
        } catch (err) {
            console.error('Stats calculation error:', err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBooks();
    };

    const handleResetFilters = () => {
        setSearch('');
        setCategoryFilter('');
        setSortBy('newest');
        setCurrentPage(1);
        fetchBooks();
    };

    const handleDeleteBook = async (bookId) => {
        try {
            await adminAPI.deleteBook(bookId);
            fetchBooks(); // Refresh the list
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting book:', error);
            setError('Failed to delete book');
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedBooks.length === 0) return;
        
        try {
            // In a real app, you would implement bulk actions
            console.log(`Performing ${bulkAction} on ${selectedBooks.length} books`);
            
            // Reset selection
            setSelectedBooks([]);
            setBulkAction('');
            
            // Refresh data
            fetchBooks();
        } catch (error) {
            console.error('Bulk action error:', error);
            setError('Failed to perform bulk action');
        }
    };

    const toggleBookSelection = (bookId) => {
        setSelectedBooks(prev => 
            prev.includes(bookId) 
                ? prev.filter(id => id !== bookId)
                : [...prev, bookId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedBooks.length === books.length) {
            setSelectedBooks([]);
        } else {
            setSelectedBooks(books.map(book => book.id));
        }
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading books...</p>
                    <p style={styles.loadingSubtext}>Fetching book data from database</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h3 style={styles.errorTitle}>Error Loading Books</h3>
                    <p style={styles.errorMessage}>{error}</p>
                    <div style={styles.errorActions}>
                        <button 
                            onClick={fetchBooks} 
                            className="btn btn-gold"
                            style={styles.retryButton}
                        >
                            Retry
                        </button>
                        <button 
                            onClick={handleResetFilters}
                            className="btn"
                            style={styles.secondaryButton}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 page-container">
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Book Management</h1>
                    <p style={styles.subtitle}>
                        Manage your book inventory and listings
                    </p>
                </div>
                <Link to="/admin/add-book" className="btn btn-gold" style={styles.addButton}>
                    <span style={styles.addIcon}>+</span> Add New Book
                </Link>
            </div>

            {/* Stats Overview */}
            <div style={styles.statsGrid}>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>📚</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{formatNumber(stats.total)}</h3>
                        <p style={styles.statLabel}>Total Books</p>
                    </div>
                </div>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>💰</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{formatPrice(stats.averagePrice)}</h3>
                        <p style={styles.statLabel}>Average Price</p>
                    </div>
                </div>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>🆕</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{formatNumber(stats.recentCount)}</h3>
                        <p style={styles.statLabel}>New (7 days)</p>
                    </div>
                </div>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>📊</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{Object.keys(stats.byCategory).length}</h3>
                        <p style={styles.statLabel}>Categories</p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div style={styles.filtersSection}>
                <form onSubmit={handleSearch} style={styles.filtersForm}>
                    <div style={styles.searchRow}>
                        <input
                            type="text"
                            placeholder="Search books by title, author, or ISBN..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                        <button type="submit" className="btn" style={styles.searchButton}>
                            🔍 Search
                        </button>
                    </div>
                    
                    <div style={styles.filterRow}>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={styles.filterSelect}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category} ({stats.byCategory[category] || 0})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={styles.filterSelect}
                            >
                                <option value="newest">Newest First</option>
                                <option value="title_asc">Title (A-Z)</option>
                                <option value="price_low">Price (Low to High)</option>
                                <option value="price_high">Price (High to Low)</option>
                            </select>
                        </div>
                        
                        <div style={styles.filterActions}>
                            <button 
                                type="button" 
                                onClick={handleResetFilters}
                                className="btn btn-outline"
                                style={styles.resetButton}
                            >
                                Reset Filters
                            </button>
                            <button 
                                type="button" 
                                onClick={fetchBooks}
                                className="btn"
                                style={styles.applyButton}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Bulk Actions */}
            {selectedBooks.length > 0 && (
                <div style={styles.bulkActionsBar}>
                    <div style={styles.bulkActionsInfo}>
                        <span style={styles.selectedCount}>
                            {selectedBooks.length} books selected
                        </span>
                        <button 
                            onClick={toggleSelectAll}
                            style={styles.clearSelectionButton}
                        >
                            Clear selection
                        </button>
                    </div>
                    <div style={styles.bulkActionsControls}>
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            style={styles.bulkActionSelect}
                        >
                            <option value="">Choose action...</option>
                            <option value="delete">Delete selected</option>
                            <option value="feature">Add to featured</option>
                            <option value="unfeature">Remove from featured</option>
                            <option value="update_category">Update category</option>
                        </select>
                        <button 
                            onClick={handleBulkAction}
                            className="btn btn-gold"
                            style={styles.bulkActionButton}
                            disabled={!bulkAction}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}

            {books.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📚</div>
                    <h3 style={styles.emptyTitle}>No Books Found</h3>
                    <p style={styles.emptyMessage}>
                        {search || categoryFilter 
                            ? 'No books match your current filters. Try adjusting your search criteria.'
                            : 'Your book inventory is empty. Start by adding your first book!'}
                    </p>
                    <div style={styles.emptyActions}>
                        {search || categoryFilter ? (
                            <button 
                                onClick={handleResetFilters}
                                className="btn btn-gold"
                                style={styles.emptyButton}
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <Link to="/admin/add-book" className="btn btn-gold" style={styles.emptyButton}>
                                Add Your First Book
                            </Link>
                        )}
                        <Link to="/" className="btn" style={styles.emptySecondaryButton}>
                            Browse Store
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Books Grid */}
                    <div style={styles.booksGrid}>
                        {books.map(book => (
                            <div key={book.id} className="book-card" style={styles.bookCard}>
                                <div style={styles.cardHeader}>
                                    <input
                                        type="checkbox"
                                        checked={selectedBooks.includes(book.id)}
                                        onChange={() => toggleBookSelection(book.id)}
                                        style={styles.selectionCheckbox}
                                    />
                                    <span style={styles.bookId}>#{book.id}</span>
                                    <span style={{
                                        ...styles.statusBadge,
                                        ...(book.is_featured ? styles.featuredBadge : {})
                                    }}>
                                        {book.is_featured ? '⭐ Featured' : '📚 Standard'}
                                    </span>
                                </div>
                                
                                <div style={styles.bookContent}>
                                    <div style={styles.bookImageContainer}>
                                        <img
                                            src={getBookImage(book.image_url, book.title)}
                                            alt={book.title}
                                            style={styles.bookImage}
                                            onError={(e) => handleImageError(e, book.title)}
                                        />
                                    </div>
                                    
                                    <div style={styles.bookInfo}>
                                        <h4 style={styles.bookTitle}>{book.title}</h4>
                                        <p style={styles.bookAuthor}>by {book.author}</p>
                                        
                                        <div style={styles.bookDetails}>
                                            <div style={styles.bookDetailItem}>
                                                <span style={styles.detailLabel}>Price:</span>
                                                <span style={styles.detailValue}>{formatPrice(book.price)}</span>
                                            </div>
                                            <div style={styles.bookDetailItem}>
                                                <span style={styles.detailLabel}>Category:</span>
                                                <span style={styles.categoryBadge}>{book.category}</span>
                                            </div>
                                            <div style={styles.bookDetailItem}>
                                                <span style={styles.detailLabel}>Condition:</span>
                                                <span style={styles.conditionBadge}>{book.condition || 'Good'}</span>
                                            </div>
                                            <div style={styles.bookDetailItem}>
                                                <span style={styles.detailLabel}>ISBN:</span>
                                                <span style={styles.detailValue}>{book.isbn || 'N/A'}</span>
                                            </div>
                                        </div>
                                        
                                        <div style={styles.bookMeta}>
                                            <span style={styles.bookDate}>
                                                Added: {formatDate(book.created_at)}
                                            </span>
                                            {book.stock !== undefined && (
                                                <span style={styles.stockBadge}>
                                                    Stock: {book.stock > 0 ? book.stock : 'Out of stock'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.cardActions}>
                                    <Link 
                                        to={`/admin/books/edit/${book.id}`}
                                        className="btn"
                                        style={styles.editButton}
                                    >
                                        ✏️ Edit
                                    </Link>
                                    <Link 
                                        to={`/book/${book.id}`}
                                        className="btn"
                                        style={styles.viewButton}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        👁️ View
                                    </Link>
                                    <button 
                                        onClick={() => setDeleteConfirm(book)}
                                        className="btn btn-outline"
                                        style={styles.deleteButton}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div style={styles.pagination}>
                            <div style={styles.paginationInfo}>
                                Showing {books.length} of {formatNumber(pagination.total)} books
                            </div>
                            
                            <div style={styles.paginationControls}>
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!pagination.has_prev}
                                    className="btn"
                                    style={styles.pageButton}
                                >
                                    ← Previous
                                </button>
                                
                                <div style={styles.pageNumbers}>
                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                        let pageNum;
                                        if (pagination.pages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= pagination.pages - 2) {
                                            pageNum = pagination.pages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                style={{
                                                    ...styles.pageNumber,
                                                    ...(currentPage === pageNum ? styles.activePage : {})
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    {pagination.pages > 5 && currentPage < pagination.pages - 2 && (
                                        <>
                                            <span style={styles.pageEllipsis}>...</span>
                                            <button
                                                onClick={() => handlePageChange(pagination.pages)}
                                                style={styles.pageNumber}
                                            >
                                                {pagination.pages}
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!pagination.has_next}
                                    className="btn"
                                    style={styles.pageButton}
                                >
                                    Next →
                                </button>
                            </div>
                            
                            <div style={styles.pageSizeSelector}>
                                <span style={styles.pageSizeLabel}>Show:</span>
                                <select 
                                    style={styles.pageSizeSelect}
                                    value={pagination.per_page}
                                    onChange={(e) => {
                                        // In a real app, update per_page
                                        console.log('Per page changed to:', e.target.value);
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Export Options */}
                    <div style={styles.exportSection}>
                        <h4 style={styles.exportTitle}>Export Data</h4>
                        <div style={styles.exportButtons}>
                            <button className="btn" style={styles.exportButton}>
                                📄 Export as CSV
                            </button>
                            <button className="btn" style={styles.exportButton}>
                                📊 Export as PDF Report
                            </button>
                            <button className="btn btn-outline" style={styles.exportButton}>
                                🖨️ Print List
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Delete Book</h3>
                            <button 
                                onClick={() => setDeleteConfirm(null)}
                                style={styles.modalClose}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={styles.modalContent}>
                            <div style={styles.modalBookInfo}>
                                <img
                                    src={getBookImage(deleteConfirm.image_url, deleteConfirm.title)}
                                    alt={deleteConfirm.title}
                                    style={styles.modalBookImage}
                                    onError={(e) => handleImageError(e, deleteConfirm.title)}
                                />
                                <div>
                                    <h4 style={styles.modalBookTitle}>{deleteConfirm.title}</h4>
                                    <p style={styles.modalBookMeta}>
                                        by {deleteConfirm.author} • {formatPrice(deleteConfirm.price)}
                                    </p>
                                    <p style={styles.modalBookCategory}>
                                        Category: {deleteConfirm.category}
                                    </p>
                                </div>
                            </div>
                            
                            <div style={styles.modalWarning}>
                                <div style={styles.warningIcon}>⚠️</div>
                                <div>
                                    <p style={styles.warningText}>
                                        <strong>Warning:</strong> This action cannot be undone.
                                    </p>
                                    <p style={styles.warningSubtext}>
                                        Deleting this book will remove it from the store, featured listings,
                                        and any user carts or wishlists.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="btn"
                                style={styles.modalCancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleDeleteBook(deleteConfirm.id)}
                                className="btn btn-outline"
                                style={styles.modalConfirmButton}
                            >
                                🗑️ Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
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

    // Error state
    errorContainer: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#fee2e2',
        borderRadius: '12px',
        color: '#991b1b',
        margin: '2rem 0',
    },
    errorIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    errorTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#991b1b',
    },
    errorMessage: {
        fontSize: '1rem',
        marginBottom: '2rem',
        lineHeight: '1.5',
    },
    errorActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    retryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#fbbf24',
        color: '#000',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },
    secondaryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },

    // Header
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    addButton: {
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
    },
    addIcon: {
        fontSize: '1.2rem',
    },

    // Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
    },
    statIcon: {
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
    statContent: {
        flex: 1,
    },
    statNumber: {
        fontSize: '2rem',
        color: '#1e3a8a',
        marginBottom: '0.25rem',
        fontWeight: '700',
    },
    statLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
    },

    // Filters Section
    filtersSection: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb',
    },
    filtersForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    searchRow: {
        display: 'flex',
        gap: '1rem',
    },
    searchInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'all 0.3s ease',
    },
    searchButton: {
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },
    filterRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        alignItems: 'end',
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    filterLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    filterSelect: {
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
    },
    filterActions: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    resetButton: {
        padding: '0.75rem 1.5rem',
    },
    applyButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },

    // Bulk Actions
    bulkActionsBar: {
        backgroundColor: '#f0f9ff',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        border: '2px solid #1e3a8a',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    bulkActionsInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    selectedCount: {
        color: '#1e3a8a',
        fontWeight: '600',
        fontSize: '0.95rem',
    },
    clearSelectionButton: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        fontSize: '0.85rem',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
    bulkActionsControls: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    bulkActionSelect: {
        padding: '0.5rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        cursor: 'pointer',
        minWidth: '200px',
    },
    bulkActionButton: {
        padding: '0.5rem 1.5rem',
    },

    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        color: '#1e3a8a',
    },
    emptyTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    emptyMessage: {
        color: '#6b7280',
        fontSize: '1rem',
        marginBottom: '2rem',
        maxWidth: '500px',
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: '1.6',
    },
    emptyActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    emptyButton: {
        padding: '0.75rem 1.5rem',
    },
    emptySecondaryButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textDecoration: 'none',
    },

    // Books Grid
    booksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    bookCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
    },
    cardHeader: {
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectionCheckbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    bookId: {
        color: '#6b7280',
        fontSize: '0.85rem',
        fontFamily: 'monospace',
    },
    statusBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
    },
    featuredBadge: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
    },
    bookContent: {
        padding: '1.5rem',
        display: 'flex',
        gap: '1.5rem',
    },
    bookImageContainer: {
        flexShrink: 0,
    },
    bookImage: {
        width: '120px',
        height: '180px',
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: '1.2rem',
        color: '#1f2937',
        marginBottom: '0.5rem',
        fontWeight: '600',
        lineHeight: '1.3',
    },
    bookAuthor: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginBottom: '1rem',
    },
    bookDetails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    bookDetailItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    detailLabel: {
        color: '#6b7280',
        fontSize: '0.8rem',
    },
    detailValue: {
        color: '#1f2937',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    categoryBadge: {
        backgroundColor: '#fbbf24',
        color: '#000000',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-block',
    },
    conditionBadge: {
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-block',
    },
    bookMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
    },
    bookDate: {
        color: '#9ca3af',
        fontSize: '0.85rem',
    },
    stockBadge: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    cardActions: {
        padding: '1rem 1.5rem',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '0.75rem',
    },
    editButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
    },
    viewButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#fbbf24',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
    },
    deleteButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },

    // Pagination
    pagination: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem',
    },
    paginationInfo: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    paginationControls: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    pageButton: {
        padding: '0.5rem 1rem',
        minWidth: '100px',
    },
    pageNumbers: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    pageNumber: {
        padding: '0.5rem 1rem',
        border: '1px solid #d1d5db',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: '40px',
        textAlign: 'center',
    },
    activePage: {
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        borderColor: '#1e3a8a',
    },
    pageEllipsis: {
        color: '#6b7280',
        padding: '0.5rem',
    },
    pageSizeSelector: {
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    pageSizeLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    pageSizeSelect: {
        padding: '0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
    },

    // Export Section
    exportSection: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
    },
    exportTitle: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '1rem',
    },
    exportButtons: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    exportButton: {
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },

    // Delete Modal
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 1.5rem 0',
    },
    modalTitle: {
        fontSize: '1.5rem',
        color: '#1e3a8a',
        margin: 0,
    },
    modalClose: {
        background: 'none',
        border: 'none',
        fontSize: '2rem',
        cursor: 'pointer',
        color: '#6b7280',
        padding: '0.25rem',
        borderRadius: '4px',
        lineHeight: '1',
    },
    modalContent: {
        padding: '1.5rem',
    },
    modalBookInfo: {
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        marginBottom: '1.5rem',
    },
    modalBookImage: {
        width: '80px',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
    },
    modalBookTitle: {
        fontSize: '1.2rem',
        color: '#1f2937',
        marginBottom: '0.5rem',
        fontWeight: '600',
    },
    modalBookMeta: {
        color: '#6b7280',
        fontSize: '0.9rem',
        marginBottom: '0.5rem',
    },
    modalBookCategory: {
        color: '#6b7280',
        fontSize: '0.85rem',
    },
    modalWarning: {
        display: 'flex',
        gap: '1rem',
        padding: '1.5rem',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        border: '1px solid #fbbf24',
    },
    warningIcon: {
        fontSize: '2rem',
        color: '#92400e',
        flexShrink: 0,
    },
    warningText: {
        color: '#92400e',
        fontSize: '1rem',
        marginBottom: '0.5rem',
        fontWeight: '500',
    },
    warningSubtext: {
        color: '#92400e',
        fontSize: '0.9rem',
        opacity: 0.9,
        lineHeight: '1.4',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        padding: '1.5rem',
        borderTop: '1px solid #e5e7eb',
    },
    modalCancelButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#6b7280',
        color: '#ffffff',
    },
    modalConfirmButton: {
        padding: '0.75rem 1.5rem',
        borderColor: '#991b1b',
        color: '#991b1b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '500',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .book-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .search-input:focus {
        border-color: #1e3a8a;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        outline: none;
    }
    
    .filter-select:focus {
        border-color: #1e3a8a;
        box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        outline: none;
    }
    
    .search-button:hover {
        background-color: #1d4ed8 !important;
        transform: translateY(-2px);
    }
    
    .add-button:hover {
        background-color: #f59e0b !important;
        transform: translateY(-2px);
    }
    
    .edit-button:hover {
        background-color: #1d4ed8 !important;
    }
    
    .view-button:hover {
        background-color: #f59e0b !important;
    }
    
    .delete-button:hover {
        border-color: #991b1b !important;
        color: #991b1b !important;
        background-color: #fee2e2 !important;
    }
    
    .page-number:hover:not(.active-page) {
        background-color: #f3f4f6;
        border-color: #9ca3af;
    }
    
    .export-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .modal-close:hover {
        background-color: #f3f4f6;
        color: #1f2937;
    }
    
    .modal-confirm-button:hover {
        background-color: #991b1b !important;
        color: #ffffff !important;
    }
`;
document.head.appendChild(styleSheet);

export default AdminBooks;