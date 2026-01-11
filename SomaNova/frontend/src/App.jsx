import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/theme.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('Component rendering error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorContent}>
            <h3 style={styles.errorTitle}>⚠️ Component Error</h3>
            <p style={styles.errorMessage}>
              {this.state.error?.toString() || 'An unexpected error occurred'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details style={styles.errorDetails}>
                <summary>Error Details (Development Only)</summary>
                <pre style={styles.errorStack}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div style={styles.errorActions}>
              <button 
                onClick={this.handleReset}
                style={styles.retryButton}
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={styles.homeButton}
              >
                Go to Home
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={styles.reloadButton}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback
const Loading = () => (
  <div style={styles.loadingContainer}>
    <div className="spinner" style={styles.spinner}></div>
    <p style={styles.loadingText}>Loading page...</p>
  </div>
);

// Import error fallback
const ImportError = ({ componentName }) => (
  <div style={styles.importError}>
    <div style={styles.importErrorIcon}>⚠️</div>
    <h3 style={styles.importErrorTitle}>Failed to load {componentName}</h3>
    <p style={styles.importErrorMessage}>The component file may have syntax errors or is missing.</p>
    <div style={styles.importErrorTips}>
      <p style={styles.importErrorTipTitle}>Common issues to check:</p>
      <ul style={styles.importErrorList}>
        <li>Missing React import</li>
        <li>JSX syntax errors</li>
        <li>Undefined variables</li>
        <li>Incorrect file path</li>
        <li>Missing exports</li>
      </ul>
    </div>
    <div style={styles.importErrorActions}>
      <button 
        onClick={() => window.location.reload()}
        style={styles.importErrorButton}
      >
        Refresh Page
      </button>
      <button 
        onClick={() => window.location.href = '/'}
        style={styles.importErrorSecondaryButton}
      >
        Go to Home
      </button>
    </div>
  </div>
);

// Route not found component
const NotFound = () => (
  <div style={styles.notFound}>
    <div style={styles.notFoundIcon}>📚</div>
    <h1 style={styles.notFoundTitle}>404 - Page Not Found</h1>
    <p style={styles.notFoundMessage}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div style={styles.notFoundActions}>
      <a href="/" style={styles.notFoundButton}>
        Go to Homepage
      </a>
      <a href="/books" style={styles.notFoundSecondaryButton}>
        Browse Books
      </a>
    </div>
  </div>
);

// Dynamic imports with error handling
const createLazyComponent = (importFunc, componentName) => {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFunc();
      // Ensure the module has a default export
      if (!module.default) {
        throw new Error(`Component ${componentName} has no default export`);
      }
      return module;
    } catch (importError) {
      console.error(`Import error for ${componentName}:`, importError);
      return {
        default: () => <ImportError componentName={componentName} />
      };
    }
  });
  
  const WrappedComponent = () => (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
  
  return WrappedComponent;
};

// Create lazy components
const HomePage = createLazyComponent(() => import('./pages/HomePage'), 'HomePage');
const BooksPage = createLazyComponent(() => import('./pages/BooksPage'), 'BooksPage');
const BookDetailPage = createLazyComponent(() => import('./pages/BookDetailPage'), 'BookDetailPage');
const CategoriesPage = createLazyComponent(() => import('./pages/CategoriesPage'), 'CategoriesPage');
const CategoryBooksPage = createLazyComponent(() => import('./pages/CategoryBooksPage'), 'CategoryBooksPage');
const AboutPage = createLazyComponent(() => import('./pages/AboutPage'), 'AboutPage');
const ContactPage = createLazyComponent(() => import('./pages/ContactPage'), 'ContactPage');
const CartPage = createLazyComponent(() => import('./pages/CartPage'), 'CartPage');
const WishlistPage = createLazyComponent(() => import('./pages/WishlistPage'), 'WishlistPage');
const SellPage = createLazyComponent(() => import('./pages/SellPage'), 'SellPage');
const SearchPage = createLazyComponent(() => import('./pages/SearchPage'), 'SearchPage');
const CheckoutPage = createLazyComponent(() => import('./pages/CheckoutPage'), 'CheckoutPage');

// Admin components
const AdminDashboard = createLazyComponent(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminBooks = createLazyComponent(() => import('./pages/admin/AdminBooks'), 'AdminBooks');
const AddEditBook = createLazyComponent(() => import('./pages/admin/AddEditBook'), 'AddEditBook');
const AdminTransactions = createLazyComponent(() => import('./pages/admin/AdminTransactions'), 'AdminTransactions');
const AdminContacts = createLazyComponent(() => import('./pages/admin/AdminContacts'), 'AdminContacts');
const AdminUsers = createLazyComponent(() => import('./pages/admin/AdminUsers'), 'AdminUsers');
const AdminFeatured = createLazyComponent(() => import('./pages/admin/AdminFeatured'), 'AdminFeatured');

// Admin layout wrapper
const AdminLayout = ({ children }) => (
  <div style={styles.adminLayout}>
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/collection/:category" element={<CategoryBooksPage />} />
            <Route path="/category/:category" element={<CategoryBooksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            } />
            <Route path="/admin/books" element={
              <AdminLayout>
                <AdminBooks />
              </AdminLayout>
            } />
            <Route path="/admin/add-book" element={
              <AdminLayout>
                <AddEditBook />
              </AdminLayout>
            } />
            <Route path="/admin/books/edit/:id" element={
              <AdminLayout>
                <AddEditBook />
              </AdminLayout>
            } />
            <Route path="/admin/transactions" element={
              <AdminLayout>
                <AdminTransactions />
              </AdminLayout>
            } />
            <Route path="/admin/contacts" element={
              <AdminLayout>
                <AdminContacts />
              </AdminLayout>
            } />
            <Route path="/admin/users" element={
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            } />
            <Route path="/admin/featured" element={
              <AdminLayout>
                <AdminFeatured />
              </AdminLayout>
            } />
            
            {/* 404 Route - Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Styles
const styles = {
  // Error Container
  errorContainer: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  errorContent: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  errorTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#991b1b',
  },
  errorMessage: {
    fontSize: '1rem',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  errorDetails: {
    backgroundColor: 'rgba(153, 27, 27, 0.1)',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  errorStack: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    fontFamily: 'monospace',
  },
  errorActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  homeButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    color: '#1e3a8a',
    border: '2px solid #1e3a8a',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  reloadButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fbbf24',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  
  // Loading
  loadingContainer: {
    padding: '3rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    borderWidth: '4px',
    marginBottom: '1rem',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1rem',
  },
  
  // Import Error
  importError: {
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '12px',
    margin: '2rem auto',
    maxWidth: '600px',
  },
  importErrorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  importErrorTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#92400e',
  },
  importErrorMessage: {
    fontSize: '1rem',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  importErrorTips: {
    textAlign: 'left',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  importErrorTipTitle: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  importErrorList: {
    margin: '0',
    paddingLeft: '1.5rem',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  importErrorActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  importErrorButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#92400e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  importErrorSecondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#92400e',
    border: '2px solid #92400e',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  
  // 404 Not Found
  notFound: {
    padding: '4rem 2rem',
    textAlign: 'center',
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundIcon: {
    fontSize: '5rem',
    marginBottom: '1.5rem',
    color: '#1e3a8a',
  },
  notFoundTitle: {
    fontSize: '2.5rem',
    color: '#1e3a8a',
    marginBottom: '1rem',
  },
  notFoundMessage: {
    fontSize: '1.1rem',
    color: '#6b7280',
    marginBottom: '2rem',
    maxWidth: '500px',
    lineHeight: '1.6',
  },
  notFoundActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  notFoundButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1e3a8a',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'inline-block',
  },
  notFoundSecondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fbbf24',
    color: '#000',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'inline-block',
  },
  
  // Admin Layout
  adminLayout: {
    minHeight: 'calc(100vh - 300px)',
  },
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .retry-button:hover, .import-error-button:hover, .not-found-button:hover {
    background-color: #1d4ed8 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
  }
  
  .home-button:hover, .import-error-secondary-button:hover {
    background-color: #1e3a8a !important;
    color: #ffffff !important;
    transform: translateY(-2px);
  }
  
  .reload-button:hover, .not-found-secondary-button:hover {
    background-color: #f59e0b !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
  }
`;
document.head.appendChild(styleSheet);

export default App;
/*

=============
How This Error Handler Works:

For Developers (You):

1. Saves Debugging Time: Instead of a blank screen, you'll see exactly which component failed
2. Isolates Problems: One broken component won't break your entire app
3. Clear Indicators: Orange message = import failed, Red message = runtime error

For Users:

1. Better Experience: They see "Component Error" instead of blank page
2. Recovery Options: Can reload the page with a button
3. Can Continue: Can navigate to other working pages

What You Need to Do:

1. Test Each Page: Click through all navigation links
2. Look for Error Messages: Any page showing "⚠️ Failed to load" or "⚠️ Component Error"
3. Report Back: Tell me which specific page shows an error

Example:

· You visit /books → Sees "⚠️ Failed to load BooksPage" → BooksPage.jsx needs fixing
· You visit /cart → Sees "⚠️ Component Error: Cannot read property..." → CartPage.jsx needs fixing

Bottom Line: This turns "blank page mysteries" into "clear error messages that tell you exactly what to fix."

==========

*/