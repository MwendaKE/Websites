/**
 * API service for SomaNova
 * Handles all communication with the backend
 */
import axios from 'axios';

// API base URL - Try to detect if we're on localhost
const getBaseURL = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000'; // Fixed: removed '/api'
    }
    return ''; // For production - Fixed: changed from '/api' to ''
};

const API_BASE_URL = getBaseURL();

// Create axios instance with credentials for cookies
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
    timeout: 10000, // 10 second timeout
});

/**
 * Generic API request handler
 */
const makeRequest = async (method, endpoint, data = null) => {
    try {
        console.log(`API Request: ${method} ${endpoint}`, data || '');
        
        const config = {
            method,
            url: endpoint,
            withCredentials: true
        };
        
        if (method !== 'GET' && data !== null) {
            config.data = data;
        } else if (method === 'GET' && data !== null) {
            config.params = data;
        }
        
        const response = await api(config);
        
        console.log(`API Response ${endpoint}:`, response.data);
        
        // Check if response has the expected structure
        if (response.data && typeof response.data === 'object') {
            return response.data;
        }
        
        // If response doesn't have expected structure, wrap it
        return {
            success: true,
            message: 'Request successful',
            data: response.data
        };
        
    } catch (error) {
        console.error(`API Error (${method} ${endpoint}):`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        
        // Provide a more helpful error message
        if (error.code === 'ECONNREFUSED') {
            throw new Error(`Cannot connect to backend server. Make sure it's running on http://localhost:5000`);
        }
        
        if (error.response) {
            // The request was made and the server responded with a status code
            const errorData = error.response.data;
            throw new Error(errorData.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('No response from server. Check your network connection and make sure the backend is running.');
        } else {
            // Something happened in setting up the request
            throw new Error(`Request error: ${error.message}`);
        }
    }
};

// Book-related API calls
export const bookAPI = {
    /**
     * Get all books
     * @param {string} category - Optional category filter
     * @param {string} search - Optional search term
     * @returns {Promise} List of books
     */
    getAll: (category = '', search = '') => 
        makeRequest('GET', '/api/books', { category, search }),

    /**
     * Get single book by ID
     * @param {number} id - Book ID
     * @returns {Promise} Book details
     */
    getById: (id) => makeRequest('GET', `/api/books/${id}`),

    /**
     * Create new book listing
     * @param {object} bookData - Book information
     * @returns {Promise} Created book
     */
    create: (bookData) => makeRequest('POST', '/api/books', bookData),
};

// Featured books API
export const featuredAPI = {
    /**
     * Get featured books
     * @returns {Promise} List of featured books
     */
    getAll: () => makeRequest('GET', '/api/featured'),
};

// Categories API
export const categoryAPI = {
    /**
     * Get all categories
     * @returns {Promise} List of categories
     */
    getAll: () => makeRequest('GET', '/api/categories'),

    /**
     * Get books by category
     * @param {string} category - Category name
     * @returns {Promise} Books in category
     */
    getBooks: (category) => makeRequest('GET', `/api/categories/${encodeURIComponent(category)}/books`),
};

// Collections API
export const collectionAPI = {
    /**
     * Get all collections
     * @returns {Promise} List of collections
     */
    getAll: () => makeRequest('GET', '/api/collections'),

    /**
     * Get collection by slug
     * @param {string} slug - Collection slug
     * @returns {Promise} Collection details with books
     */
    getBySlug: (slug) => makeRequest('GET', `/api/collections/${encodeURIComponent(slug)}`),

    /**
     * Get books by collection ID
     * @param {number} collectionId - Collection ID
     * @returns {Promise} Books in collection
     */
    getBooks: (collectionId) => makeRequest('GET', `/api/collections/${collectionId}/books`),
};

// Search API
export const searchAPI = {
    /**
     * Search books with filters
     * @param {object} filters - Search filters
     * @returns {Promise} Search results
     */
    search: (filters) => makeRequest('GET', '/api/search', filters),
};

// Contact API
export const contactAPI = {
    /**
     * Submit contact form
     * @param {object} contactData - Contact information
     * @returns {Promise} Submission result
     */
    submit: (contactData) => makeRequest('POST', '/api/contact', contactData),
    
    /**
     * Get contact message
     * @param {number} contactId - Contact ID
     * @returns {Promise} Contact details
     */
    getContact: (contactId) => makeRequest('GET', `/api/contact/${contactId}`),
};

// Transaction API
export const transactionAPI = {
    /**
     * Create new transaction
     * @param {object} transactionData - Transaction details
     * @returns {Promise} Created transaction
     */
    create: (transactionData) => makeRequest('POST', '/api/transactions', transactionData),
};

// User API
export const userAPI = {
    /**
     * Get user information
     * @returns {Promise} User info with cart/wishlist counts
     */
    getInfo: () => makeRequest('GET', '/api/user/info'),
};

// Cart API
export const cartAPI = {
    /**
     * Get cart items
     * @returns {Promise} List of cart items
     */
    getAll: () => makeRequest('GET', '/api/cart'),

    /**
     * Add book to cart
     * @param {number} bookId - Book ID
     * @param {number} quantity - Quantity (default: 1)
     * @returns {Promise} Operation result
     */
    add: (bookId, quantity = 1) => makeRequest('POST', '/api/cart', { book_id: bookId, quantity }),

    /**
     * Remove item from cart
     * @param {number} itemId - Cart item ID
     * @returns {Promise} Operation result
     */
    remove: (itemId) => makeRequest('DELETE', `/api/cart/${itemId}`),

    /**
     * Clear cart
     * @returns {Promise} Operation result
     */
    clear: () => makeRequest('DELETE', '/api/cart/clear'),
};

// Wishlist API
export const wishlistAPI = {
    /**
     * Get wishlist items
     * @returns {Promise} List of wishlist items
     */
    getAll: () => makeRequest('GET', '/api/wishlist'),

    /**
     * Add book to wishlist
     * @param {number} bookId - Book ID
     * @returns {Promise} Operation result
     */
    add: (bookId) => makeRequest('POST', '/api/wishlist', { book_id: bookId }),

    /**
     * Remove item from wishlist
     * @param {number} itemId - Wishlist item ID
     * @returns {Promise} Operation result
     */
    remove: (itemId) => makeRequest('DELETE', `/api/wishlist/${itemId}`),

    /**
     * Clear wishlist
     * @returns {Promise} Operation result
     */
    clear: () => makeRequest('DELETE', '/api/wishlist/clear'),
};

// Checkout API
export const checkoutAPI = {
    /**
     * Create checkout transaction
     * @param {object} checkoutData - Checkout information
     * @returns {Promise} Created transaction
     */
    create: (checkoutData) => makeRequest('POST', '/api/checkout', checkoutData),

    /**
     * Complete checkout (payment)
     * @param {number} transactionId - Transaction ID
     * @returns {Promise} Updated transaction
     */
    complete: (transactionId) => makeRequest('POST', `/api/checkout/${transactionId}/complete`),

    /**
     * Get transaction details
     * @param {number} transactionId - Transaction ID
     * @returns {Promise} Transaction details
     */
    getTransaction: (transactionId) => makeRequest('GET', `/api/checkout/${transactionId}`),

    /**
     * Get user's transactions
     * @returns {Promise} List of user transactions
     */
    getUserTransactions: () => makeRequest('GET', '/api/user/transactions'),
};

// Admin API
export const adminAPI = {
    /**
     * Get admin dashboard stats
     * @returns {Promise} Dashboard statistics
     */
    getDashboard: () => makeRequest('GET', '/api/admin/dashboard'),

    /**
     * Get all books (admin with pagination)
     * @param {object} params - Pagination and filter params
     * @returns {Promise} Books with pagination
     */
    getBooks: (params) => makeRequest('GET', '/api/admin/books', params),

    /**
     * Delete a book
     * @param {number} bookId - Book ID
     * @returns {Promise} Operation result
     */
    deleteBook: (bookId) => makeRequest('DELETE', `/api/admin/books/${bookId}`),

    /**
     * Get all transactions (admin)
     * @param {object} params - Pagination and filter params
     * @returns {Promise} Transactions with pagination
     */
    getTransactions: (params) => makeRequest('GET', '/api/admin/transactions', params),

    /**
     * Update transaction status
     * @param {number} transactionId - Transaction ID
     * @param {object} updateData - Update data
     * @returns {Promise} Updated transaction
     */
    updateTransaction: (transactionId, updateData) => 
        makeRequest('PUT', `/api/admin/transactions/${transactionId}`, updateData),

    /**
     * Get all contacts (admin)
     * @param {object} params - Pagination and filter params
     * @returns {Promise} Contacts with pagination
     */
    getContacts: (params) => makeRequest('GET', '/api/admin/contacts', params),

    /**
     * Update contact status
     * @param {number} contactId - Contact ID
     * @param {object} updateData - Update data
     * @returns {Promise} Updated contact
     */
    updateContact: (contactId, updateData) => 
        makeRequest('PUT', `/api/admin/contacts/${contactId}`, updateData),

    /**
     * Delete a contact
     * @param {number} contactId - Contact ID
     * @returns {Promise} Operation result
     */
    deleteContact: (contactId) => makeRequest('DELETE', `/api/admin/contacts/${contactId}`),

    /**
     * Get all users (admin)
     * @param {object} params - Pagination params
     * @returns {Promise} Users with pagination
     */
    getUsers: (params) => makeRequest('GET', '/api/admin/users', params),

    /**
     * Add book to featured
     * @param {object} featuredData - Featured book data
     * @returns {Promise} Created featured book
     */
    addFeatured: (featuredData) => makeRequest('POST', '/api/admin/featured', featuredData),

    /**
     * Remove book from featured
     * @param {number} featuredId - Featured book ID
     * @returns {Promise} Operation result
     */
    removeFeatured: (featuredId) => makeRequest('DELETE', `/api/admin/featured/${featuredId}`),
};

// API Info
export const infoAPI = {
    /**
     * Get API information
     * @returns {Promise} API stats
     */
    getInfo: () => makeRequest('GET', '/api/info'),
    
    /**
     * Test API connection
     * @returns {Promise} Test result
     */
    test: () => makeRequest('GET', '/api/test'),
};

// Default export with all APIs
export default {
    bookAPI,
    featuredAPI,
    categoryAPI,
    collectionAPI,
    contactAPI,
    transactionAPI,
    userAPI,
    cartAPI,
    wishlistAPI,
    searchAPI,
    infoAPI,
    checkoutAPI,
    adminAPI,  
};

/**
 * Initialize API - test connection on startup
 */
export const initAPI = async () => {
    try {
        const result = await infoAPI.test();
        console.log('API connection successful:', result);
        return true;
    } catch (error) {
        console.error('API connection failed:', error.message);
        return false;
    }
};