import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import '../../styles/theme.css';

/**
 * Admin Contacts Management Page
 */
const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [readFilter, setReadFilter] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, [currentPage, readFilter]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getContacts({
                page: currentPage,
                per_page: 20,
                is_read: readFilter
            });
            
            if (response.success) {
                setContacts(response.data.contacts);
                setPagination(response.data.pagination);
                setError('');
            } else {
                setError('Failed to load messages');
            }
        } catch (err) {
            setError('Error loading messages. Please try again.');
            console.error('Contacts fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (contactId, isRead) => {
        try {
            await adminAPI.updateContact(contactId, { is_read: isRead });
            fetchContacts(); // Refresh the list
            
            // Update selected contact if it's open
            if (selectedContact?.id === contactId) {
                setSelectedContact(prev => ({
                    ...prev,
                    is_read: isRead
                }));
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            setError('Failed to update message');
        }
    };

    const handleDeleteContact = async (contactId) => {
        try {
            await adminAPI.deleteContact(contactId);
            fetchContacts(); // Refresh the list
            setDeleteConfirm(null);
            if (selectedContact?.id === contactId) {
                setSelectedContact(null);
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            setError('Failed to delete message');
        }
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleResetFilters = () => {
        setSearch('');
        setReadFilter('');
        setCurrentPage(1);
        fetchContacts();
    };

    return (
        <div className="container mt-4 page-container">
            <div style={styles.header}>
                <h1>Contact Messages</h1>
                <div style={styles.headerStats}>
                    <div style={styles.statBadge}>
                        <span style={styles.statCount}>{pagination.total || 0}</span>
                        <span style={styles.statLabel}>Total Messages</span>
                    </div>
                    <div style={styles.statBadge}>
                        <span style={styles.statCount}>
                            {contacts.filter(c => !c.is_read).length}
                        </span>
                        <span style={styles.statLabel}>Unread</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={styles.filtersSection}>
                <div style={styles.filterGrid}>
                    <div className="form-group" style={styles.filterGroup}>
                        <label className="form-label">Status</label>
                        <select
                            value={readFilter}
                            onChange={(e) => {
                                setReadFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="form-input"
                            style={styles.filterSelect}
                        >
                            <option value="">All Messages</option>
                            <option value="false">Unread Only</option>
                            <option value="true">Read Only</option>
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
                        <button 
                            onClick={() => {
                                // Mark all as read
                                contacts.forEach(contact => {
                                    if (!contact.is_read) {
                                        handleMarkAsRead(contact.id, true);
                                    }
                                });
                            }}
                            className="btn btn-gold"
                            style={styles.filterButton}
                        >
                            Mark All as Read
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={styles.loading}>
                    <div className="spinner"></div>
                    <p>Loading messages...</p>
                </div>
            ) : error ? (
                <div style={styles.error}>
                    <p>{error}</p>
                    <button onClick={fetchContacts} className="btn btn-gold">
                        Retry
                    </button>
                </div>
            ) : contacts.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📨</div>
                    <h3>No Messages Found</h3>
                    <p>No contact messages match your current filters.</p>
                    <button 
                        onClick={handleResetFilters}
                        className="btn btn-gold"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <>
                    <div style={styles.layout}>
                        {/* Messages List */}
                        <div style={styles.listContainer}>
                            <div style={styles.messagesList}>
                                {contacts.map(contact => (
                                    <div
                                        key={contact.id}
                                        onClick={() => setSelectedContact(contact)}
                                        style={{
                                            ...styles.messageCard,
                                            ...(!contact.is_read ? styles.unreadCard : {}),
                                            ...(selectedContact?.id === contact.id ? styles.selectedCard : {})
                                        }}
                                    >
                                        <div style={styles.messageHeader}>
                                            <div style={styles.messageTitle}>
                                                <strong>{contact.subject}</strong>
                                                {!contact.is_read && (
                                                    <span style={styles.unreadBadge}>NEW</span>
                                                )}
                                            </div>
                                            <small style={styles.messageDate}>
                                                {formatDate(contact.created_at)}
                                            </small>
                                        </div>
                                        <div style={styles.messageSender}>
                                            <strong>{contact.name}</strong>
                                            <small style={styles.senderEmail}>{contact.email}</small>
                                        </div>
                                        <p style={styles.messagePreview}>
                                            {contact.message.substring(0, 100)}...
                                        </p>
                                        <div style={styles.messageActions}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(contact.id, !contact.is_read);
                                                }}
                                                className="btn"
                                                style={styles.actionButton}
                                            >
                                                {contact.is_read ? 'Mark as Unread' : 'Mark as Read'}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteConfirm(contact.id);
                                                }}
                                                className="btn btn-outline"
                                                style={styles.deleteButton}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                        </div>

                        {/* Message Detail View */}
                        <div style={styles.detailContainer}>
                            {selectedContact ? (
                                <div style={styles.detailCard}>
                                    <div style={styles.detailHeader}>
                                        <h3>{selectedContact.subject}</h3>
                                        <div style={styles.detailMeta}>
                                            <span style={styles.detailDate}>
                                                {formatDate(selectedContact.created_at)}
                                            </span>
                                            {!selectedContact.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(selectedContact.id, true)}
                                                    className="btn btn-gold"
                                                    style={styles.markReadButton}
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={styles.senderInfo}>
                                        <div style={styles.senderAvatar}>
                                            {selectedContact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <strong>{selectedContact.name}</strong>
                                            <p style={styles.senderContact}>
                                                📧 {selectedContact.email}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.messageContent}>
                                        <p>{selectedContact.message}</p>
                                    </div>
                                    
                                    <div style={styles.detailActions}>
                                        <a
                                            href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                                            className="btn btn-gold"
                                            style={styles.replyButton}
                                        >
                                            📧 Reply via Email
                                        </a>
                                        <button
                                            onClick={() => setDeleteConfirm(selectedContact.id)}
                                            className="btn btn-outline"
                                            style={styles.deleteDetailButton}
                                        >
                                            Delete Message
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.noSelection}>
                                    <div style={styles.noSelectionIcon}>📄</div>
                                    <h3>Select a Message</h3>
                                    <p>Click on a message from the list to view its details here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>Delete Message</h3>
                        <p>Are you sure you want to delete this message? This action cannot be undone.</p>
                        <div style={styles.modalActions}>
                            <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="btn"
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleDeleteContact(deleteConfirm)}
                                className="btn btn-outline"
                                style={styles.confirmDeleteButton}
                            >
                                Delete
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
        alignItems: 'center',
        marginBottom: '2rem',
    },
    headerStats: {
        display: 'flex',
        gap: '1rem',
    },
    statBadge: {
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        minWidth: '120px',
    },
    statCount: {
        display: 'block',
        fontSize: '2rem',
        fontWeight: 'bold',
    },
    statLabel: {
        display: 'block',
        fontSize: '0.9rem',
        opacity: 0.9,
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
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        minHeight: '600px',
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    messagesList: {
        flex: 1,
        overflowY: 'auto',
        marginBottom: '2rem',
        paddingRight: '1rem',
    },
    messageCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    unreadCard: {
        borderLeft: '4px solid #1e3a8a',
        backgroundColor: '#f0f9ff',
    },
    selectedCard: {
        borderColor: '#1e3a8a',
        boxShadow: '0 0 0 2px rgba(30, 58, 138, 0.2)',
    },
    messageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
    },
    messageTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    unreadBadge: {
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        fontSize: '0.7rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontWeight: 'bold',
    },
    messageDate: {
        color: '#6b7280',
        fontSize: '0.85rem',
    },
    messageSender: {
        marginBottom: '1rem',
    },
    senderEmail: {
        display: 'block',
        color: '#6b7280',
        fontSize: '0.85rem',
        marginTop: '0.25rem',
    },
    messagePreview: {
        color: '#4b5563',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        lineHeight: '1.5',
    },
    messageActions: {
        display: 'flex',
        gap: '0.5rem',
    },
    actionButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
    },
    deleteButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
    },
    detailContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    },
    detailCard: {
        padding: '2rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    detailHeader: {
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '2px solid #e5e7eb',
    },
    detailMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.5rem',
    },
    detailDate: {
        color: '#6b7280',
        fontSize: '0.9rem',
    },
    markReadButton: {
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
    },
    senderInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
    },
    senderAvatar: {
        width: '50px',
        height: '50px',
        backgroundColor: '#1e3a8a',
        color: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    senderContact: {
        color: '#6b7280',
        fontSize: '0.9rem',
        marginTop: '0.25rem',
    },
    messageContent: {
        flex: 1,
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        lineHeight: '1.6',
        color: '#374151',
        whiteSpace: 'pre-wrap',
        overflowY: 'auto',
        maxHeight: '300px',
    },
    detailActions: {
        display: 'flex',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '2px solid #e5e7eb',
    },
    replyButton: {
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    deleteDetailButton: {
        padding: '0.75rem 1.5rem',
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
        marginTop: '2rem',
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
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        marginTop: '1.5rem',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
    },
    confirmDeleteButton: {
        padding: '0.75rem 1.5rem',
        borderColor: '#991b1b',
        color: '#991b1b',
        ':hover': {
            backgroundColor: '#991b1b',
            color: '#ffffff',
        },
    },
};

// Add hover styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .message-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .page-number:hover {
        background-color: #f3f4f6;
    }
    
    .action-button:hover {
        background-color: #1d4ed8 !important;
    }
    
    .reply-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(styleSheet);

export default AdminContacts;