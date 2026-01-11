import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/theme.css';

/**
 * Admin Users Management Page
 */
const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [userDetails, setUserDetails] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        avgCartItems: 0,
        avgWishlistItems: 0
    });

    useEffect(() => {
        fetchUsers();
        calculateStats();
    }, [currentPage]);

    useEffect(() => {
        calculateStats();
    }, [users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getUsers({
                page: currentPage,
                per_page: 20
            });
            
            if (response.success) {
                setUsers(response.data.users);
                setPagination(response.data.pagination);
                setError('');
            } else {
                setError('Failed to load users');
            }
        } catch (err) {
            setError('Error loading users. Please try again.');
            console.error('Users fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        if (users.length === 0) return;
        
        const today = new Date().toISOString().split('T')[0];
        const activeToday = users.filter(user => {
            const userDate = new Date(user.created_at).toISOString().split('T')[0];
            return userDate === today;
        }).length;

        const totalCartItems = users.reduce((sum, user) => sum + (user.cart_count || 0), 0);
        const totalWishlistItems = users.reduce((sum, user) => sum + (user.wishlist_count || 0), 0);
        
        setStats({
            totalUsers: pagination.total || users.length,
            activeToday,
            avgCartItems: Math.round(totalCartItems / users.length),
            avgWishlistItems: Math.round(totalWishlistItems / users.length)
        });
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

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Never';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDate(dateString);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        // Implement search logic here
    };

    return (
        <div className="container mt-4 page-container">
            <div style={styles.header}>
                <h1>User Management</h1>
                <div style={styles.headerActions}>
                    <button 
                        onClick={() => window.print()}
                        className="btn btn-outline"
                        style={styles.actionButton}
                    >
                        Export Users
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={styles.statsGrid}>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>👥</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{stats.totalUsers}</h3>
                        <p style={styles.statLabel}>Total Users</p>
                    </div>
                </div>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>🔥</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{stats.activeToday}</h3>
                        <p style={styles.statLabel}>New Today</p>
                    </div>
                </div>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>🛒</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{stats.avgCartItems}</h3>
                        <p style={styles.statLabel}>Avg Cart Items</p>
                    </div>
                </div>
                <div className="stat-card" style={styles.statCard}>
                    <div style={styles.statIcon}>❤️</div>
                    <div style={styles.statContent}>
                        <h3 style={styles.statNumber}>{stats.avgWishlistItems}</h3>
                        <p style={styles.statLabel}>Avg Wishlist Items</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={styles.searchSection}>
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Search users by session ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.searchInput}
                    />
                    <button type="submit" className="btn" style={styles.searchButton}>
                        Search
                    </button>
                    <button 
                        type="button" 
                        onClick={() => {
                            setSearch('');
                            setCurrentPage(1);
                            fetchUsers();
                        }}
                        className="btn btn-outline"
                        style={styles.resetButton}
                    >
                        Reset
                    </button>
                </form>
            </div>

            {loading ? (
                <div style={styles.loading}>
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            ) : error ? (
                <div style={styles.error}>
                    <p>{error}</p>
                    <button onClick={fetchUsers} className="btn btn-gold">
                        Retry
                    </button>
                </div>
            ) : users.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>👤</div>
                    <h3>No Users Found</h3>
                    <p>No users match your current filters.</p>
                    <button 
                        onClick={() => {
                            setSearch('');
                            setCurrentPage(1);
                            fetchUsers();
                        }}
                        className="btn btn-gold"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div style={styles.layout}>
                    {/* Users Table */}
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.tableCell}>User ID</th>
                                    <th style={styles.tableCell}>Session ID</th>
                                    <th style={styles.tableCell}>Cart</th>
                                    <th style={styles.tableCell}>Wishlist</th>
                                    <th style={styles.tableCell}>Joined</th>
                                    <th style={styles.tableCell}>Last Active</th>
                                    <th style={styles.tableCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr 
                                        key={user.id} 
                                        style={styles.tableRow}
                                        onClick={() => setUserDetails(user)}
                                    >
                                        <td style={styles.tableCell}>
                                            <code style={styles.userId}>#{user.id}</code>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.sessionId}>
                                                {user.session_id ? (
                                                    <>
                                                        <code style={styles.sessionCode}>
                                                            {user.session_id.substring(0, 8)}...
                                                        </code>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(user.session_id);
                                                            }}
                                                            style={styles.copyButton}
                                                            title="Copy session ID"
                                                        >
                                                            📋
                                                        </button>
                                                    </>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.counterBadge}>
                                                <span style={styles.counterNumber}>{user.cart_count || 0}</span>
                                                <span style={styles.counterLabel}>items</span>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.counterBadge}>
                                                <span style={styles.counterNumber}>{user.wishlist_count || 0}</span>
                                                <span style={styles.counterLabel}>items</span>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={styles.timeAgo}>
                                                {formatTimeAgo(user.updated_at)}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.actionButtons}>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUserDetails(user);
                                                    }}
                                                    className="btn"
                                                    style={styles.viewButton}
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Implement user actions
                                                    }}
                                                    className="btn btn-outline"
                                                    style={styles.moreButton}
                                                >
                                                    ⋮
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                    </div>

                    {/* User Details Panel */}
                    <div style={styles.detailPanel}>
                        {userDetails ? (
                            <div style={styles.userDetailCard}>
                                <div style={styles.userDetailHeader}>
                                    <h3>User Details</h3>
                                    <button 
                                        onClick={() => setUserDetails(null)}
                                        style={styles.closeButton}
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                <div style={styles.userInfo}>
                                    <div style={styles.userAvatar}>
                                        {`U${userDetails.id}`.charAt(0)}
                                    </div>
                                    <div style={styles.userMainInfo}>
                                        <h4>User #{userDetails.id}</h4>
                                        <p style={styles.userSessionId}>
                                            Session: <code>{userDetails.session_id}</code>
                                        </p>
                                    </div>
                                </div>
                                
                                <div style={styles.userStats}>
                                    <div style={styles.userStatItem}>
                                        <div style={styles.userStatIcon}>📅</div>
                                        <div>
                                            <p style={styles.userStatLabel}>Joined</p>
                                            <p style={styles.userStatValue}>
                                                {formatDate(userDetails.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={styles.userStatItem}>
                                        <div style={styles.userStatIcon}>🔄</div>
                                        <div>
                                            <p style={styles.userStatLabel}>Last Active</p>
                                            <p style={styles.userStatValue}>
                                                {formatTimeAgo(userDetails.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.userActivity}>
                                    <h4 style={styles.sectionTitle}>Activity Summary</h4>
                                    <div style={styles.activityGrid}>
                                        <div style={styles.activityItem}>
                                            <span style={styles.activityIcon}>🛒</span>
                                            <div>
                                                <p style={styles.activityLabel}>Cart Items</p>
                                                <p style={styles.activityValue}>
                                                    {userDetails.cart_count || 0} items
                                                </p>
                                            </div>
                                        </div>
                                        <div style={styles.activityItem}>
                                            <span style={styles.activityIcon}>❤️</span>
                                            <div>
                                                <p style={styles.activityLabel}>Wishlist Items</p>
                                                <p style={styles.activityValue}>
                                                    {userDetails.wishlist_count || 0} items
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={styles.userActions}>
                                    <h4 style={styles.sectionTitle}>User Actions</h4>
                                    <div style={styles.actionGrid}>
                                        <button className="btn" style={styles.userActionButton}>
                                            View Cart
                                        </button>
                                        <button className="btn" style={styles.userActionButton}>
                                            View Wishlist
                                        </button>
                                        <button className="btn btn-outline" style={styles.userActionButton}>
                                            Reset Session
                                        </button>
                                        <button className="btn btn-outline" style={styles.dangerActionButton}>
                                            Delete User
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={styles.noSelection}>
                                <div style={styles.noSelectionIcon}>👤</div>
                                <h3>Select a User</h3>
                                <p>Click on a user from the list to view detailed information here.</p>
                            </div>
                        )}
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
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    statIcon: {
        fontSize: '2rem',
        width: '60px',
        height: '60px',
        backgroundColor: '#fbbf24',
        color: '#000000',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statContent: {
        flex: 1,
    },
    statNumber: {
        fontSize: '2rem',
        color: '#1e3a8a',
        marginBottom: '0.25rem',
    },
    statLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    searchSection: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
    },
    searchForm: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        padding: '0.75rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    searchButton: {
        padding: '0.75rem 1.5rem',
    },
    resetButton: {
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
    layout: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        minHeight: '600px',
    },
    tableContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
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
        cursor: 'pointer',
        ':hover': {
            backgroundColor: '#f9fafb',
        },
    },
    tableCell: {
        padding: '1rem',
        textAlign: 'left',
        verticalAlign: 'middle',
    },
    userId: {
        backgroundColor: '#f3f4f6',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
    },
    sessionId: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    sessionCode: {
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: '#6b7280',
    },
    copyButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#6b7280',
        padding: '0.25rem',
        borderRadius: '4px',
        ':hover': {
            backgroundColor: '#f3f4f6',
        },
    },
    counterBadge: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.5rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '6px',
        minWidth: '60px',
    },
    counterNumber: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    counterLabel: {
        fontSize: '0.75rem',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    timeAgo: {
        color: '#6b7280',
        fontSize: '0.85rem',
        fontStyle: 'italic',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    viewButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    moreButton: {
        padding: '0.5rem',
        fontSize: '1rem',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailPanel: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    },
    userDetailCard: {
        padding: '2rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    userDetailHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '2px solid #e5e7eb',
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
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
    },
    userAvatar: {
        width: '60px',
        height: '60px',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    userMainInfo: {
        flex: 1,
    },
    userSessionId: {
        color: '#6b7280',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
    },
    userStats: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '2rem',
    },
    userStatItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
    userStatIcon: {
        fontSize: '1.5rem',
        width: '40px',
        height: '40px',
        backgroundColor: '#fbbf24',
        color: '#000000',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userStatLabel: {
        color: '#6b7280',
        fontSize: '0.85rem',
        marginBottom: '0.25rem',
    },
    userStatValue: {
        color: '#1f2937',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    userActivity: {
        marginBottom: '2rem',
    },
    sectionTitle: {
        color: '#1e3a8a',
        marginBottom: '1rem',
        fontSize: '1.1rem',
    },
    activityGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    activityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
    activityIcon: {
        fontSize: '1.5rem',
        width: '40px',
        height: '40px',
        backgroundColor: '#fbbf24',
        color: '#000000',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityLabel: {
        color: '#6b7280',
        fontSize: '0.85rem',
        marginBottom: '0.25rem',
    },
    activityValue: {
        color: '#1f2937',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    userActions: {
        marginTop: 'auto',
    },
    actionGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
    },
    userActionButton: {
        padding: '0.75rem',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    dangerActionButton: {
        padding: '0.75rem',
        fontSize: '0.85rem',
        textAlign: 'center',
        borderColor: '#991b1b',
        color: '#991b1b',
        ':hover': {
            backgroundColor: '#991b1b',
            color: '#ffffff',
        },
    },
    noSelection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '4rem',
        textAlign: 'center',
        color: '#6b7280',
    },
    noSelectionIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        opacity: 0.5,
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem',
        borderTop: '1px solid #e5e7eb',
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
};

// Add hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .table-row:hover {
        background-color: #f9fafb;
    }
    
    .page-number:hover {
        background-color: #f3f4f6;
    }
    
    .copy-button:hover {
        background-color: #f3f4f6;
        color: #1e3a8a;
    }
    
    .user-action-button:hover {
        background-color: #1d4ed8 !important;
        color: #ffffff;
    }
`;
document.head.appendChild(styleSheet);

export default AdminUsers;