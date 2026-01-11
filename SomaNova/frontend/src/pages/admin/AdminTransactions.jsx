import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/theme.css';

/**
 * Admin Transactions Management Page
 */
const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, statusFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getTransactions({
                page: currentPage,
                per_page: 20,
                status: statusFilter
            });
            
            if (response.success) {
                setTransactions(response.data.transactions);
                setPagination(response.data.pagination);
                setError('');
            } else {
                setError('Failed to load transactions');
            }
        } catch (err) {
            setError('Error loading transactions. Please try again.');
            console.error('Transactions fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (transactionId, newStatus) => {
        try {
            await adminAPI.updateTransaction(transactionId, { status: newStatus });
            fetchTransactions(); // Refresh the list
        } catch (error) {
            console.error('Error updating transaction:', error);
            setError('Failed to update transaction');
        }
    };

    const formatCurrency = (amount) => {
        return amount ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount) : '$0.00';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'pending':
                return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'cancelled':
                return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default:
                return { backgroundColor: '#e5e7eb', color: '#374151' };
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setCurrentPage(1);
        fetchTransactions();
    };

    return (
        <div className="container mt-4 page-container">
            <div style={styles.header}>
                <h1>Transaction Management</h1>
                <div style={styles.headerActions}>
                    <button 
                        onClick={() => window.print()}
                        className="btn btn-outline"
                        style={styles.actionButton}
                    >
                        Print Report
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={styles.filtersSection}>
                <div style={styles.filterGrid}>
                    <div className="form-group" style={styles.filterGroup}>
                        <label className="form-label">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="form-input"
                            style={styles.filterSelect}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <div style={styles.filterActions}>
                        <button 
                            onClick={handleResetFilters}
                            className="btn btn-outline"
                            style={styles.filterButton}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={styles.loading}>
                    <div className="spinner"></div>
                    <p>Loading transactions...</p>
                </div>
            ) : error ? (
                <div style={styles.error}>
                    <p>{error}</p>
                    <button onClick={fetchTransactions} className="btn btn-gold">
                        Retry
                    </button>
                </div>
            ) : transactions.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📊</div>
                    <h3>No Transactions Found</h3>
                    <p>No transactions match your current filters.</p>
                    <button 
                        onClick={handleResetFilters}
                        className="btn btn-gold"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats Summary */}
                    <div style={styles.statsSummary}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>Total Amount:</span>
                            <span style={styles.statValue}>
                                {formatCurrency(
                                    transactions.reduce((sum, t) => sum + (t.transaction_amount || 0), 0)
                                )}
                            </span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>Total Transactions:</span>
                            <span style={styles.statValue}>{pagination.total}</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>Completed:</span>
                            <span style={styles.statValue}>
                                {transactions.filter(t => t.status === 'completed').length}
                            </span>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.tableCell}>ID</th>
                                    <th style={styles.tableCell}>Book</th>
                                    <th style={styles.tableCell}>Buyer</th>
                                    <th style={styles.tableCell}>Amount</th>
                                    <th style={styles.tableCell}>Status</th>
                                    <th style={styles.tableCell}>Date</th>
                                    <th style={styles.tableCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(transaction => (
                                    <tr key={transaction.id} style={styles.tableRow}>
                                        <td style={styles.tableCell}>
                                            <code style={styles.transactionId}>#{transaction.id}</code>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.bookInfo}>
                                                <strong>{transaction.book_title}</strong>
                                                <small style={styles.bookMeta}>
                                                    Book ID: {transaction.book_id}
                                                </small>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.buyerInfo}>
                                                <strong>{transaction.buyer_name}</strong>
                                                <small style={styles.buyerMeta}>
                                                    {transaction.buyer_email}
                                                    {transaction.buyer_phone && ` • ${transaction.buyer_phone}`}
                                                </small>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <strong style={styles.amount}>
                                                {formatCurrency(transaction.transaction_amount)}
                                            </strong>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                ...getStatusColor(transaction.status)
                                            }}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            {formatDate(transaction.created_at)}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.actionButtons}>
                                                <select
                                                    value={transaction.status}
                                                    onChange={(e) => handleStatusChange(transaction.id, e.target.value)}
                                                    style={styles.statusSelect}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button 
                                                    onClick={() => {/* View details */}}
                                                    className="btn"
                                                    style={styles.viewButton}
                                                >
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div style={styles.pagination}>
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.has_prev}
                                className="btn"
                                style={styles.pageButton}
                            >
                                Previous
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
                            </div>
                            
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.has_next}
                                className="btn"
                                style={styles.pageButton}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Export Options */}
                    <div style={styles.exportSection}>
                        <h3>Export Data</h3>
                        <div style={styles.exportButtons}>
                            <button className="btn" style={styles.exportButton}>
                                📄 Export as CSV
                            </button>
                            <button className="btn" style={styles.exportButton}>
                                📊 Export as PDF
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    headerActions: {
        display: 'flex',
        gap: '1rem',
    },
    actionButton: {
        padding: '0.75rem 1.5rem',
    },
    filtersSection: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
    },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        alignItems: 'end',
    },
    filterGroup: {
        marginBottom: 0,
    },
    filterSelect: {
        width: '100%',
    },
    filterActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
    },
    filterButton: {
        padding: '0.75rem 1.5rem',
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
    statsSummary: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        padding: '1.5rem',
        borderRadius: '8px',
    },
    statItem: {
        textAlign: 'center',
    },
    statLabel: {
        display: 'block',
        fontSize: '0.9rem',
        opacity: 0.9,
        marginBottom: '0.5rem',
    },
    statValue: {
        display: 'block',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    tableContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '2rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    tableRow: {
        borderBottom: '1px solid #e5e7eb',
        ':hover': {
            backgroundColor: '#f9fafb',
        },
    },
    tableCell: {
        padding: '1rem',
        textAlign: 'left',
        verticalAlign: 'middle',
    },
    transactionId: {
        backgroundColor: '#f3f4f6',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
    },
    bookInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    bookMeta: {
        color: '#6b7280',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
    },
    buyerInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    buyerMeta: {
        color: '#6b7280',
        fontSize: '0.8rem',
        marginTop: '0.25rem',
    },
    amount: {
        color: '#1e3a8a',
        fontWeight: 'bold',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    statusSelect: {
        padding: '0.25rem 0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '0.85rem',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
    },
    viewButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
    },
    pageButton: {
        padding: '0.5rem 1rem',
    },
    pageNumbers: {
        display: 'flex',
        gap: '0.5rem',
    },
    pageNumber: {
        padding: '0.5rem 1rem',
        border: '1px solid #d1d5db',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    activePage: {
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        borderColor: '#1e3a8a',
    },
    exportSection: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginTop: '2rem',
    },
    exportButtons: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    exportButton: {
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
};

// Add hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .table-row:hover {
        background-color: #f9fafb;
    }
    
    .page-number:hover {
        background-color: #f3f4f6;
    }
    
    .export-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(styleSheet);

export default AdminTransactions;