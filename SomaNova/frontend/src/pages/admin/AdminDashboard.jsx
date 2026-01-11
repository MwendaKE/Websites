import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import '../../styles/theme.css';

/**
 * Admin Dashboard Page
 */
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, all
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        
        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [timeRange]);

    const fetchDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
                setError('');
            } else {
                setRefreshing(true);
            }
            
            console.log('Fetching dashboard data...');
            const response = await adminAPI.getDashboard();
            console.log('Dashboard API response:', response);
            
            // Check the actual response structure
            if (response && response.success === true) {
                const data = response.data || response;
                
                if (data.stats && data.recent_activity) {
                    setStats(data.stats);
                    setRecentActivity(data.recent_activity);
                    setError('');
                } else {
                    console.error('Unexpected response structure:', response);
                    if (!silent) {
                        setError('Invalid dashboard data format');
                    }
                }
            } else {
                console.error('API returned failure:', response);
                if (!silent) {
                    setError(response?.message || 'Failed to load dashboard data');
                }
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            if (!silent) {
                setError(err.message || 'Error loading dashboard data. Please try again.');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
            setRefreshing(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Just now';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const calculateGrowth = (current, previous) => {
        if (!previous || previous === 0) return current > 0 ? '∞' : '0%';
        const growth = ((current - previous) / previous) * 100;
        return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
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

    if (loading) {
        return (
            <div className="container mt-5">
                <div style={styles.loading}>
                    <div className="spinner" style={styles.spinner}></div>
                    <p style={styles.loadingText}>Loading admin dashboard...</p>
                    <p style={styles.loadingSubtext}>Fetching the latest statistics</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div style={styles.errorContainer}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <h3 style={styles.errorTitle}>Error Loading Dashboard</h3>
                    <p style={styles.errorMessage}>{error}</p>
                    <div style={styles.errorActions}>
                        <button 
                            onClick={() => fetchDashboardData(false)} 
                            className="btn btn-gold"
                            style={styles.retryButton}
                        >
                            Retry
                        </button>
                        <Link 
                            to="/admin/books" 
                            className="btn" 
                            style={styles.secondaryButton}
                        >
                            Go to Books
                        </Link>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="btn btn-outline"
                            style={styles.reloadButton}
                        >
                            Reload Page
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
                    <h1 style={styles.title}>Admin Dashboard</h1>
                    <p style={styles.subtitle}>
                        Welcome back! Here's what's happening with your store today.
                        {refreshing && <span style={styles.refreshingBadge}> 🔄 Updating...</span>}
                    </p>
                </div>
                <div style={styles.headerActions}>
                    <div style={styles.timeRangeSelector}>
                        <span style={styles.timeRangeLabel}>Time Range:</span>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={styles.timeRangeSelect}
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <button 
                        onClick={() => fetchDashboardData(false)}
                        className="btn"
                        style={styles.refreshButton}
                        disabled={refreshing}
                    >
                        {refreshing ? 'Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Overview</h2>
                    <div style={styles.lastUpdated}>
                        Last updated: {formatRelativeTime(new Date().toISOString())}
                    </div>
                </div>
                <div style={styles.statsGrid}>
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>📚</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats?.total_books || 0)}</h3>
                            <p style={styles.statLabel}>Total Books</p>
                            <div style={styles.statGrowth}>
                                <span style={styles.growthIndicator}>
                                    {calculateGrowth(stats?.recent_books || 0, 0)}
                                </span>
                                <span style={styles.growthLabel}>this week</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>👥</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats?.total_users || 0)}</h3>
                            <p style={styles.statLabel}>Total Users</p>
                            <div style={styles.statGrowth}>
                                <span style={styles.growthIndicator}>
                                    {calculateGrowth(stats?.recent_users || 0, 0)}
                                </span>
                                <span style={styles.growthLabel}>active users</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>💰</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatCurrency(stats?.total_revenue || 0)}</h3>
                            <p style={styles.statLabel}>Total Revenue</p>
                            <div style={styles.statGrowth}>
                                <span style={styles.growthIndicator}>
                                    {formatCurrency(stats?.recent_revenue || 0)}
                                </span>
                                <span style={styles.growthLabel}>this week</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>📦</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats?.total_transactions || 0)}</h3>
                            <p style={styles.statLabel}>Transactions</p>
                            <div style={styles.statGrowth}>
                                <span style={styles.growthIndicator}>
                                    {calculateGrowth(stats?.recent_transactions || 0, 0)}
                                </span>
                                <span style={styles.growthLabel}>this week</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>⭐</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats?.recent_books || 0)}</h3>
                            <p style={styles.statLabel}>New Books</p>
                            <div style={styles.statSubLabel}>Last 7 days</div>
                        </div>
                    </div>
                    
                    <div className="stat-card" style={styles.statCard}>
                        <div style={styles.statIcon}>🛒</div>
                        <div style={styles.statContent}>
                            <h3 style={styles.statNumber}>{formatNumber(stats?.recent_transactions || 0)}</h3>
                            <p style={styles.statLabel}>New Orders</p>
                            <div style={styles.statSubLabel}>Last 7 days</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Quick Actions</h2>
                    <p style={styles.sectionDescription}>Manage your store efficiently</p>
                </div>
                <div style={styles.actionsGrid}>
                    <Link to="/admin/books" className="action-card" style={styles.actionCard}>
                        <div style={styles.actionIcon}>📚</div>
                        <div style={styles.actionContent}>
                            <h4 style={styles.actionTitle}>Manage Books</h4>
                            <p style={styles.actionDescription}>View, edit, and manage all books</p>
                        </div>
                        <div style={styles.actionArrow}>→</div>
                    </Link>
                    
                    <Link to="/admin/transactions" className="action-card" style={styles.actionCard}>
                        <div style={styles.actionIcon}>💰</div>
                        <div style={styles.actionContent}>
                            <h4 style={styles.actionTitle}>Transactions</h4>
                            <p style={styles.actionDescription}>View and manage all orders</p>
                        </div>
                        <div style={styles.actionArrow}>→</div>
                    </Link>
                    
                    <Link to="/admin/contacts" className="action-card" style={styles.actionCard}>
                        <div style={styles.actionIcon}>📧</div>
                        <div style={styles.actionContent}>
                            <h4 style={styles.actionTitle}>Messages</h4>
                            <p style={styles.actionDescription}>View customer inquiries</p>
                        </div>
                        <div style={styles.actionArrow}>→</div>
                    </Link>
                    
                    <Link to="/admin/add-book" className="action-card" style={styles.actionCard}>
                        <div style={styles.actionIcon}>➕</div>
                        <div style={styles.actionContent}>
                            <h4 style={styles.actionTitle}>Add Book</h4>
                            <p style={styles.actionDescription}>Add a new book listing</p>
                        </div>
                        <div style={styles.actionArrow}>→</div>
                    </Link>
                    
                    <Link to="/admin/users" className="action-card" style={styles.actionCard}>
                        <div style={styles.actionIcon}>👥</div>
                        <div style={styles.actionContent}>
                            <h4 style={styles.actionTitle}>Users</h4>
                            <p style={styles.actionDescription}>Manage user accounts</p>
                        </div>
                        <div style={styles.actionArrow}>→</div>
                    </Link>
                    
                    <Link to="/admin/featured" className="action-card" style={styles.actionCard}>
                        <div style={styles.actionIcon}>⭐</div>
                        <div style={styles.actionContent}>
                            <h4 style={styles.actionTitle}>Featured</h4>
                            <p style={styles.actionDescription}>Manage featured books</p>
                        </div>
                        <div style={styles.actionArrow}>→</div>
                    </Link>
                </div>
            </section>

            {/* Recent Activity */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Recent Activity</h2>
                    <div style={styles.activityFilters}>
                        <button 
                            className="btn btn-outline"
                            style={styles.filterButton}
                            onClick={() => fetchDashboardData(false)}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
                
                <div style={styles.activityGrid}>
                    {/* Recent Books */}
                    <div className="activity-card" style={styles.activityCard}>
                        <div style={styles.activityCardHeader}>
                            <h3 style={styles.activityCardTitle}>Recent Books</h3>
                            <Link to="/admin/books" style={styles.viewAllLink}>
                                View All →
                            </Link>
                        </div>
                        <div style={styles.activityList}>
                            {recentActivity?.books?.length > 0 ? (
                                recentActivity.books.slice(0, 5).map((book, index) => (
                                    <div key={book.id || index} style={styles.activityItem}>
                                        <div style={styles.activityItemContent}>
                                            <strong style={styles.activityItemTitle}>
                                                {book.title || 'Untitled Book'}
                                            </strong>
                                            <p style={styles.activityItemMeta}>
                                                by {book.author || 'Unknown Author'} • {formatCurrency(book.price)} • {formatDate(book.created_at)}
                                            </p>
                                        </div>
                                        {book.id && (
                                            <Link 
                                                to={`/admin/books/edit/${book.id}`}
                                                style={styles.editLink}
                                            >
                                                Edit
                                            </Link>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyActivity}>
                                    <p style={styles.emptyActivityText}>No recent books</p>
                                    <Link to="/admin/add-book" className="btn" style={styles.emptyActivityButton}>
                                        Add First Book
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="activity-card" style={styles.activityCard}>
                        <div style={styles.activityCardHeader}>
                            <h3 style={styles.activityCardTitle}>Recent Orders</h3>
                            <Link to="/admin/transactions" style={styles.viewAllLink}>
                                View All →
                            </Link>
                        </div>
                        <div style={styles.activityList}>
                            {recentActivity?.transactions?.length > 0 ? (
                                recentActivity.transactions.slice(0, 5).map((transaction, index) => (
                                    <div key={transaction.id || index} style={styles.activityItem}>
                                        <div style={styles.activityItemContent}>
                                            <strong style={styles.activityItemTitle}>
                                                {transaction.book_title || 'Unknown Book'}
                                            </strong>
                                            <p style={styles.activityItemMeta}>
                                                {transaction.buyer_name || 'Unknown Buyer'} • {formatCurrency(transaction.transaction_amount)} • 
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    ...getStatusColor(transaction.status)
                                                }}>
                                                    {transaction.status || 'unknown'}
                                                </span>
                                            </p>
                                        </div>
                                        <span style={styles.activityItemDate}>
                                            {formatDate(transaction.created_at)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyActivity}>
                                    <p style={styles.emptyActivityText}>No recent transactions</p>
                                    <p style={styles.emptyActivitySubtext}>Orders will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Contacts */}
                    <div className="activity-card" style={styles.activityCard}>
                        <div style={styles.activityCardHeader}>
                            <h3 style={styles.activityCardTitle}>Recent Messages</h3>
                            <Link to="/admin/contacts" style={styles.viewAllLink}>
                                View All →
                            </Link>
                        </div>
                        <div style={styles.activityList}>
                            {recentActivity?.contacts?.length > 0 ? (
                                recentActivity.contacts.slice(0, 5).map((contact, index) => (
                                    <div key={contact.id || index} style={styles.activityItem}>
                                        <div style={styles.activityItemContent}>
                                            <strong style={styles.activityItemTitle}>
                                                {contact.subject || 'No Subject'}
                                            </strong>
                                            <p style={styles.activityItemMeta}>
                                                {contact.name || 'Anonymous'} • {contact.email || 'No email'}
                                            </p>
                                            {contact.message && (
                                                <p style={styles.messagePreview}>
                                                    {contact.message.substring(0, 80)}...
                                                </p>
                                            )}
                                        </div>
                                        <span style={styles.activityItemDate}>
                                            {formatDate(contact.created_at)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.emptyActivity}>
                                    <p style={styles.emptyActivityText}>No recent messages</p>
                                    <p style={styles.emptyActivitySubtext}>Customer inquiries will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* System Status */}
            <div style={styles.systemStatus}>
                <div style={styles.systemStatusItem}>
                    <span style={styles.systemStatusLabel}>Last Update:</span>
                    <span style={styles.systemStatusValue}>
                        {new Date().toLocaleTimeString()}
                    </span>
                </div>
                <div style={styles.systemStatusItem}>
                    <span style={styles.systemStatusLabel}>Auto-refresh:</span>
                    <span style={styles.systemStatusValue}>Every 5 minutes</span>
                </div>
                <div style={styles.systemStatusItem}>
                    <span style={styles.systemStatusLabel}>Data Range:</span>
                    <span style={styles.systemStatusValue}>
                        {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'All time'}
                    </span>
                </div>
            </div>
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
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
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
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },
    reloadButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'transparent',
        color: '#991b1b',
        border: '2px solid #991b1b',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },

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
    },
    refreshingBadge: {
        color: '#1e3a8a',
        fontWeight: '500',
        animation: 'pulse 2s infinite',
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    timeRangeSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    timeRangeLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    timeRangeSelect: {
        padding: '0.5rem 1rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    refreshButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },

    // Sections
    section: {
        marginBottom: '3rem',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    sectionTitle: {
        fontSize: '1.8rem',
        color: '#1e3a8a',
        marginBottom: '0.5rem',
    },
    sectionDescription: {
        color: '#6b7280',
        fontSize: '0.95rem',
    },
    lastUpdated: {
        color: '#9ca3af',
        fontSize: '0.85rem',
        backgroundColor: '#f3f4f6',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
    },

    // Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
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
        fontSize: '2.2rem',
        color: '#1e3a8a',
        marginBottom: '0.25rem',
        fontWeight: '700',
    },
    statLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
    },
    statSubLabel: {
        color: '#9ca3af',
        fontSize: '0.8rem',
    },
    statGrowth: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '0.5rem',
    },
    growthIndicator: {
        color: '#10b981',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
    growthLabel: {
        color: '#9ca3af',
        fontSize: '0.8rem',
    },

    // Actions Grid
    actionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    actionCard: {
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
    },
    actionIcon: {
        fontSize: '2rem',
        width: '60px',
        height: '60px',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: '1.1rem',
        color: '#1e3a8a',
        marginBottom: '0.25rem',
        fontWeight: '600',
    },
    actionDescription: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    actionArrow: {
        color: '#9ca3af',
        fontSize: '1.2rem',
        transition: 'all 0.3s ease',
    },

    // Activity Grid
    activityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
    },
    activityCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
    },
    activityCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    },
    activityCardTitle: {
        fontSize: '1.2rem',
        color: '#1e3a8a',
        margin: 0,
        fontWeight: '600',
    },
    viewAllLink: {
        color: '#1e3a8a',
        fontSize: '0.9rem',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
    },
    activityList: {
        padding: '1rem',
    },
    activityItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '0.75rem',
        backgroundColor: '#f9fafb',
        transition: 'all 0.3s ease',
        border: '1px solid #e5e7eb',
    },
    activityItemContent: {
        flex: 1,
    },
    activityItemTitle: {
        display: 'block',
        color: '#1f2937',
        fontSize: '0.95rem',
        marginBottom: '0.25rem',
    },
    activityItemMeta: {
        color: '#6b7280',
        fontSize: '0.85rem',
        margin: 0,
        lineHeight: '1.4',
    },
    activityItemDate: {
        color: '#9ca3af',
        fontSize: '0.8rem',
        flexShrink: 0,
        marginLeft: '1rem',
        minWidth: '100px',
        textAlign: 'right',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '500',
        marginLeft: '0.5rem',
        textTransform: 'capitalize',
    },
    messagePreview: {
        color: '#6b7280',
        fontSize: '0.85rem',
        marginTop: '0.5rem',
        fontStyle: 'italic',
        lineHeight: '1.4',
    },
    editLink: {
        color: '#1e3a8a',
        fontSize: '0.85rem',
        fontWeight: '500',
        textDecoration: 'none',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '4px',
        transition: 'all 0.3s ease',
        flexShrink: 0,
        marginLeft: '1rem',
    },

    // Empty states
    emptyActivity: {
        textAlign: 'center',
        padding: '3rem 1rem',
    },
    emptyActivityText: {
        color: '#6b7280',
        fontSize: '0.95rem',
        marginBottom: '0.5rem',
    },
    emptyActivitySubtext: {
        color: '#9ca3af',
        fontSize: '0.85rem',
        marginBottom: '1rem',
    },
    emptyActivityButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        textDecoration: 'none',
        borderRadius: '4px',
    },

    // Activity filters
    activityFilters: {
        display: 'flex',
        gap: '0.5rem',
    },
    filterButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
    },

    // System status
    systemStatus: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        marginTop: '2rem',
    },
    systemStatusItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    systemStatusLabel: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    systemStatusValue: {
        color: '#1f2937',
        fontSize: '0.9rem',
        fontWeight: '500',
    },
};

// Add CSS animations and hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #1e3a8a;
    }
    
    .action-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #fbbf24;
        background-color: #fefce8;
    }
    
    .action-card:hover .action-arrow {
        transform: translateX(4px);
        color: #1e3a8a;
    }
    
    .activity-item:hover {
        background-color: #f3f4f6;
        border-color: #d1d5db;
    }
    
    .view-all-link:hover {
        color: #fbbf24;
    }
    
    .edit-link:hover {
        background-color: #1e3a8a;
        color: #ffffff;
    }
    
    .refresh-button:hover {
        background-color: #1d4ed8;
        transform: translateY(-2px);
    }
    
    .retry-button:hover {
        background-color: #f59e0b;
        transform: translateY(-2px);
    }
    
    .secondary-button:hover {
        background-color: #1d4ed8;
        transform: translateY(-2px);
    }
    
    .reload-button:hover {
        background-color: #991b1b;
        color: #ffffff;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;