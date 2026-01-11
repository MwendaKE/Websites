/**
 * Utility functions for handling book images
 */

// Default book image path
export const DEFAULT_BOOK_IMAGE = '/book-image.jpg';

/**
 * Get book image URL with fallback to default
 * @param {string|null} imageUrl - The book's image URL
 * @param {string} title - Book title for alt text
 * @returns {string} Image URL
 */
export const getBookImage = (imageUrl, title = 'Book') => {
    if (imageUrl && imageUrl.trim() !== '') {
        return imageUrl;
    }
    
    // Return default image
    return DEFAULT_BOOK_IMAGE;
};

/**
 * Create a fallback SVG image when default image is not found
 * @param {string} title - Book title
 * @returns {string} SVG data URL
 */
export const createFallbackSvg = (title = 'Book Cover') => {
    const encodedTitle = encodeURIComponent(title.substring(0, 30));
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%231e3a8a'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='20' fill='%23fbbf24' text-anchor='middle' dominant-baseline='middle'%3E${encodedTitle}%3C/text%3E%3C/svg%3E`;
};

/**
 * Handle image loading error
 * @param {Event} e - Image error event
 * @param {string} title - Book title for fallback
 */
export const handleImageError = (e, title = 'Book') => {
    e.target.src = createFallbackSvg(title);
    e.target.onerror = null; // Prevent infinite loop
};