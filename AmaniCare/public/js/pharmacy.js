class Pharmacy {
    constructor() {
        this.currentCategory = '';
        this.currentSort = 'name';
        this.allDrugs = [];
        this.categories = [];
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('Pharmacy initializing...');
        await this.loadCategories();
        await this.loadAllDrugs();
        this.setupEventListeners();
        this.setupSearch();
        this.initialized = true;
        console.log('Pharmacy initialized successfully');
    }

    async loadCategories() {
        try {
            console.log('Loading categories from /api/categories/1');
            const response = await fetch('/api/categories/1');
            
            if (!response.ok) {
                console.error('Failed to load categories, status:', response.status);
                throw new Error(`HTTP ${response.status}: Failed to load categories`);
            }
            
            this.categories = await response.json();
            console.log('Categories loaded:', this.categories.length);
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            // No fallback - just show error
            this.showMessage('Failed to load categories. Please refresh the page.', 'error');
        }
    }

    async loadAllDrugs() {
        console.log('Loading drugs from /api/drugs');
        this.showLoading();
        
        try {
            const response = await fetch('/api/drugs');
            
            if (!response.ok) {
                console.error('Failed to load drugs, status:', response.status);
                throw new Error(`HTTP ${response.status}: Failed to load drugs`);
            }
            
            this.allDrugs = await response.json();
            console.log('Drugs loaded from API:', this.allDrugs.length);
            
            if (this.allDrugs.length === 0) {
                console.log('No drugs found in API, showing message');
                this.showMessage('No medicines available at the moment', 'info');
            }
            
            this.renderDrugs();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading drugs from API:', error);
            // No fallback - just show error
            this.hideLoading();
            this.showMessage('Failed to load medicines. Please try again later.', 'error');
        }
    }

    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (!grid) {
            console.error('categoriesGrid element not found');
            return;
        }
        
        grid.innerHTML = this.categories.map(category => `
            <div class="category-card" data-category-id="${category.id}">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            </div>
        `).join('');

        // Add click event listeners to category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const categoryId = card.getAttribute('data-category-id');
                this.filterByCategory(categoryId);
            });
        });

        // Populate category filter
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        }
    }

    renderDrugs() {
        const grid = document.getElementById('medicinesGrid');
        const noResults = document.getElementById('noResults');
        const loadingSpinner = document.getElementById('loadingSpinner');

        if (!grid) {
            console.error('medicinesGrid element not found');
            return;
        }

        // Always hide loading spinner when rendering
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }

        if (!this.allDrugs || this.allDrugs.length === 0) {
            grid.innerHTML = '';
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = `
                    <h3>No medicines found</h3>
                    <p>Try adjusting your search or filter criteria to find what you're looking for.</p>
                `;
            }
            return;
        }

        if (noResults) noResults.style.display = 'none';

        const filteredDrugs = this.getFilteredDrugs();
        
        if (filteredDrugs.length === 0) {
            grid.innerHTML = '';
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = `
                    <h3>No medicines match your filter</h3>
                    <p>Try adjusting your search or filter criteria to find what you're looking for.</p>
                `;
            }
            return;
        }

        grid.innerHTML = filteredDrugs.map(drug => {
            const category = this.categories.find(cat => cat.id === drug.category_id);
            const inCart = window.cart ? window.cart.items.find(item => item.drug_id === drug.id) : false;
            const prescriptionRequired = drug.prescription_required === 1 || drug.prescription_required === true;
            
            return `
            <div class="medicine-card">
                <h3>${drug.name}</h3>
                <div class="medicine-generic">${drug.generic_name}</div>
                <p class="medicine-description">${drug.description ? drug.description.substring(0, 100) + (drug.description.length > 100 ? '...' : '') : 'No description available'}</p>
                
                <div class="medicine-details">
                    <div class="medicine-detail">
                        <strong>Form</strong>
                        ${drug.dosage_form || 'Not specified'}
                    </div>
                    <div class="medicine-detail">
                        <strong>Strength</strong>
                        ${drug.strength || 'Not specified'}
                    </div>
                    <div class="medicine-detail">
                        <strong>Manufacturer</strong>
                        ${drug.manufacturer ? drug.manufacturer.substring(0, 20) + (drug.manufacturer.length > 20 ? '...' : '') : 'Not specified'}
                    </div>
                    <div class="medicine-detail">
                        <strong>Category</strong>
                        ${category ? category.name : 'Unknown'}
                    </div>
                </div>
                
                <div class="medicine-price">$${drug.price ? drug.price.toFixed(2) : '0.00'}</div>
                
                <div class="medicine-actions">
                    <button class="btn btn--primary btn--small view-details-btn" data-drug-id="${drug.id}">
                        View Details
                    </button>
                    ${prescriptionRequired ? 
                        '<span class="prescription-required">Prescription Required</span>' :
                        `<button class="btn ${inCart ? 'btn--secondary' : 'btn--outline'} btn--small add-to-cart-btn" 
                                data-drug-id="${drug.id}" ${drug.stock === 0 ? 'disabled' : ''}>
                            ${inCart ? '✓ Added' : drug.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>`
                    }
                </div>
            </div>
        `}).join('');

        // Add event listeners to buttons
        this.setupMedicineCardListeners();
    }

    getFilteredDrugs() {
        let filtered = [...this.allDrugs];

        // Filter by category
        if (this.currentCategory) {
            filtered = filtered.filter(drug => drug.category_id == this.currentCategory);
        }

        // Sort
        if (this.currentSort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.currentSort === 'price') {
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        }

        return filtered;
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) categoryFilter.value = categoryId;
        this.applyFilters();
    }

    searchDrugs(query) {
        if (!query.trim()) {
            this.renderDrugs();
            return;
        }

        const searchLower = query.toLowerCase();
        const filtered = this.allDrugs.filter(drug =>
            (drug.name && drug.name.toLowerCase().includes(searchLower)) ||
            (drug.generic_name && drug.generic_name.toLowerCase().includes(searchLower)) ||
            (drug.manufacturer && drug.manufacturer.toLowerCase().includes(searchLower)) ||
            (drug.description && drug.description.toLowerCase().includes(searchLower))
        );

        const grid = document.getElementById('medicinesGrid');
        const noResults = document.getElementById('noResults');

        if (!grid) return;

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = `
                    <h3>No medicines found for "${query}"</h3>
                    <p>Try searching with different terms or browse all categories.</p>
                `;
            }
            return;
        }

        if (noResults) noResults.style.display = 'none';

        grid.innerHTML = filtered.map(drug => {
            const category = this.categories.find(cat => cat.id === drug.category_id);
            const inCart = window.cart ? window.cart.items.find(item => item.drug_id === drug.id) : false;
            const prescriptionRequired = drug.prescription_required === 1 || drug.prescription_required === true;
            
            return `
            <div class="medicine-card">
                <h3>${drug.name}</h3>
                <div class="medicine-generic">${drug.generic_name}</div>
                <p class="medicine-description">${drug.description ? drug.description.substring(0, 100) + (drug.description.length > 100 ? '...' : '') : 'No description available'}</p>
                
                <div class="medicine-details">
                    <div class="medicine-detail">
                        <strong>Form</strong>
                        ${drug.dosage_form || 'Not specified'}
                    </div>
                    <div class="medicine-detail">
                        <strong>Strength</strong>
                        ${drug.strength || 'Not specified'}
                    </div>
                    <div class="medicine-detail">
                        <strong>Manufacturer</strong>
                        ${drug.manufacturer ? drug.manufacturer.substring(0, 20) + (drug.manufacturer.length > 20 ? '...' : '') : 'Not specified'}
                    </div>
                    <div class="medicine-detail">
                        <strong>Category</strong>
                        ${category ? category.name : 'Unknown'}
                    </div>
                </div>
                
                <div class="medicine-price">$${drug.price ? drug.price.toFixed(2) : '0.00'}</div>
                
                <div class="medicine-actions">
                    <button class="btn btn--primary btn--small view-details-btn" data-drug-id="${drug.id}">
                        View Details
                    </button>
                    ${prescriptionRequired ? 
                        '<span class="prescription-required">Prescription Required</span>' :
                        `<button class="btn ${inCart ? 'btn--secondary' : 'btn--outline'} btn--small add-to-cart-btn" 
                                data-drug-id="${drug.id}" ${drug.stock === 0 ? 'disabled' : ''}>
                            ${inCart ? '✓ Added' : drug.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>`
                    }
                </div>
            </div>
        `}).join('');

        this.setupMedicineCardListeners();
    }

    sortDrugs(sortBy) {
        this.currentSort = sortBy;
        this.applyFilters();
    }

    applyFilters() {
        this.renderDrugs();
    }

    async viewDetails(drugId) {
        try {
            console.log('Viewing details for drug ID:', drugId);
            const response = await fetch(`/api/drugs/${drugId}`);
            let drug;
            
            if (response.ok) {
                drug = await response.json();
            } else {
                // Fallback to local data from allDrugs
                drug = this.allDrugs.find(d => d.id === drugId);
            }
            
            if (!drug) {
                this.showMessage('Medicine not found', 'error');
                return;
            }
            
            const modal = document.getElementById('medicineModal');
            const content = document.getElementById('modalContent');
            const category = this.categories.find(cat => cat.id === drug.category_id);
            const inCart = window.cart ? window.cart.items.find(item => item.drug_id === drug.id) : false;
            const prescriptionRequired = drug.prescription_required === 1 || drug.prescription_required === true;

            content.innerHTML = `
                <h2>${drug.name}</h2>
                <div class="medicine-generic">${drug.generic_name}</div>
                
                <div class="modal-details">
                    <p><strong>Description:</strong> ${drug.description || 'No description available'}</p>
                    <p><strong>Category:</strong> ${category ? category.name : 'Unknown'}</p>
                    <p><strong>Dosage Form:</strong> ${drug.dosage_form || 'Not specified'}</p>
                    <p><strong>Strength:</strong> ${drug.strength || 'Not specified'}</p>
                    <p><strong>Manufacturer:</strong> ${drug.manufacturer || 'Not specified'}</p>
                    <p><strong>Stock Available:</strong> ${drug.stock || 0} units</p>
                    <p><strong>Prescription Required:</strong> ${prescriptionRequired ? 'Yes' : 'No'}</p>
                    ${drug.expiry_date ? `<p><strong>Expiry Date:</strong> ${new Date(drug.expiry_date).toLocaleDateString()}</p>` : ''}
                </div>
                
                <div class="modal-price">$${drug.price ? drug.price.toFixed(2) : '0.00'}</div>
                
                <div class="modal-actions">
                    ${!prescriptionRequired ? `
                        <button class="btn ${inCart ? 'btn--secondary' : 'btn--primary'} add-to-cart-modal-btn" 
                                data-drug-id="${drug.id}" ${drug.stock === 0 ? 'disabled' : ''}>
                            ${inCart ? '✓ Added to Cart' : drug.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    ` : ''}
                    <button class="btn btn--outline close-modal-btn">Close</button>
                </div>
            `;

            // Add event listeners to modal buttons
            const addToCartBtn = content.querySelector('.add-to-cart-modal-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => {
                    this.addToCart(drug.id);
                });
            }
            
            const closeModalBtn = content.querySelector('.close-modal-btn');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', () => {
                    this.closeModal();
                });
            }

            if (modal) modal.style.display = 'block';
        } catch (error) {
            console.error('Error loading medicine details:', error);
            this.showMessage('Failed to load medicine details', 'error');
        }
    }

    async addToCart(drugId) {
        try {
            console.log('Adding to cart drug ID:', drugId);
            const drug = this.allDrugs.find(d => d.id === drugId);
            if (!drug) {
                this.showMessage('Medicine not found', 'error');
                return;
            }
            
            // Check if prescription is required
            if (drug.prescription_required === 1 || drug.prescription_required === true) {
                this.showMessage('This medicine requires a prescription', 'error');
                return;
            }
            
            // Check stock
            if (drug.stock === 0) {
                this.showMessage('This medicine is out of stock', 'error');
                return;
            }
            
            if (!window.cart) {
                console.error('Cart is not initialized');
                this.showMessage('Cart is not available', 'error');
                return;
            }
            
            // Add to cart via API
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ drugId, quantity: 1 })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    window.cart.items = result.cart;
                    window.cart.updateCartUI();
                    this.renderDrugs(); // Update button states
                    this.showMessage('Added to cart successfully!', 'success');
                    this.closeModal();
                    return;
                }
            }
            
            // Fallback: Add to cart locally
            const existingItem = window.cart.items.find(item => item.drug_id === drugId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                window.cart.items.push({
                    id: Date.now(),
                    drug_id: drugId,
                    name: drug.name,
                    generic_name: drug.generic_name,
                    price: drug.price,
                    quantity: 1,
                    prescription_required: drug.prescription_required,
                    added_at: new Date().toISOString()
                });
            }
            
            window.cart.updateCartUI();
            this.renderDrugs();
            this.showMessage('Added to cart!', 'success');
            this.closeModal();
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showMessage('Failed to add to cart. Please try again.', 'error');
        }
    }

    setupEventListeners() {
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortDrugs(e.target.value);
            });
        }

        // Modal close
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('medicineModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setupMedicineCardListeners() {
        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const drugId = parseInt(e.target.getAttribute('data-drug-id'));
                this.viewDetails(drugId);
            });
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const drugId = parseInt(e.target.getAttribute('data-drug-id'));
                this.addToCart(drugId);
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('drugSearch');
        const searchButton = document.querySelector('.search-box button');
        
        if (!searchInput || !searchButton) return;
        
        // Search button click
        searchButton.addEventListener('click', () => this.searchDrugs(searchInput.value));
        
        // Enter key in search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchDrugs(searchInput.value);
        });

        // Real-time search with debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchDrugs(e.target.value);
            }, 300);
        });
    }

    closeModal() {
        const modal = document.getElementById('medicineModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const medicinesGrid = document.getElementById('medicinesGrid');
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (medicinesGrid) medicinesGrid.style.opacity = '0.5';
    }

    hideLoading() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const medicinesGrid = document.getElementById('medicinesGrid');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (medicinesGrid) medicinesGrid.style.opacity = '1';
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message--${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 2000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            messageDiv.style.background = '#28a745';
        } else if (type === 'error') {
            messageDiv.style.background = '#dc3545';
        } else if (type === 'info') {
            messageDiv.style.background = '#01796F';
        } else {
            messageDiv.style.background = '#6c757d';
        }
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }
}

class Cart {
    constructor() {
        this.items = [];
        this.loadCart();
    }

    async loadCart() {
        try {
            const response = await fetch('/api/cart');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.items = result.cart;
                }
            }
            this.updateCartUI();
        } catch (error) {
            console.error('Error loading cart:', error);
            this.updateCartUI();
        }
    }

    async updateItemQuantity(itemId, quantity) {
        if (quantity < 1) {
            await this.removeItem(itemId);
            return;
        }

        try {
            const response = await fetch(`/api/cart/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.items = result.cart;
                }
            }
            this.updateCartUI();
            if (window.pharmacy) {
                window.pharmacy.renderDrugs();
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            // Update locally
            const item = this.items.find(i => i.id == itemId);
            if (item) {
                item.quantity = quantity;
            }
            this.updateCartUI();
            if (window.pharmacy) {
                window.pharmacy.renderDrugs();
            }
        }
    }

    async removeItem(itemId) {
        try {
            const response = await fetch(`/api/cart/remove/${itemId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.items = result.cart;
                }
            }
            this.updateCartUI();
            if (window.pharmacy) {
                window.pharmacy.renderDrugs();
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            // Remove locally
            this.items = this.items.filter(item => item.id != itemId);
            this.updateCartUI();
            if (window.pharmacy) {
                window.pharmacy.renderDrugs();
            }
        }
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartCount || !cartItems || !cartEmpty || !cartSummary) return;
        
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Show/hide empty cart
        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            cartSummary.style.display = 'none';
            return;
        }
        
        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
        cartSummary.style.display = 'block';
        
        // Render cart items
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">💊</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-generic">${item.generic_name}</div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn minus-btn" data-item-id="${item.id}">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus-btn" data-item-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item remove-btn" data-item-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to cart buttons
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.getAttribute('data-item-id'));
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateItemQuantity(itemId, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.getAttribute('data-item-id'));
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateItemQuantity(itemId, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.getAttribute('data-item-id'));
                this.removeItem(itemId);
            });
        });
        
        // Update summary
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cartDelivery').textContent = '$0.00';
        document.getElementById('cartTotal').textContent = `$${subtotal.toFixed(2)}`;
    }

    showCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        if (cartSidebar) cartSidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
    }

    hideCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('overlay');
        if (cartSidebar) cartSidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    checkout() {
        if (this.items.length === 0) {
            window.pharmacy?.showMessage('Your cart is empty', 'error');
            return;
        }
        
        this.hideCart();
        this.showCheckout();
    }

    showCheckout() {
        const modal = document.getElementById('checkoutModal');
        const checkoutItems = document.getElementById('checkoutItems');
        
        if (!modal || !checkoutItems) return;
        
        // Render checkout items
        checkoutItems.innerHTML = this.items.map(item => `
            <div class="order-item">
                <div class="order-item-name">${item.name} × ${item.quantity}</div>
                <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
        
        // Update checkout summary
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
        const deliveryFee = deliveryOption?.value === 'delivery' ? 5.00 : 0;
        const total = subtotal + deliveryFee;
        
        document.getElementById('checkoutSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('checkoutDelivery').textContent = `$${deliveryFee.toFixed(2)}`;
        document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
        
        modal.style.display = 'block';
        
        // Update delivery fee on option change
        document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const newDeliveryFee = radio.value === 'delivery' ? 5.00 : 0;
                const newTotal = subtotal + newDeliveryFee;
                document.getElementById('checkoutDelivery').textContent = `$${newDeliveryFee.toFixed(2)}`;
                document.getElementById('checkoutTotal').textContent = `$${newTotal.toFixed(2)}`;
            });
        });
    }

    closeCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.style.display = 'none';
    }

    async submitCheckout(formData) {
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    items: this.items
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.items = [];
                    this.updateCartUI();
                    this.closeCheckout();
                    this.showOrderConfirmation(result.order);
                    if (window.pharmacy) {
                        window.pharmacy.renderDrugs();
                    }
                    window.pharmacy?.showMessage('Order placed successfully!', 'success');
                    return;
                }
            }
            
            // Fallback: Show success message even if API fails
            window.pharmacy?.showMessage('Order processed locally! Note: For real orders, please visit our pharmacy.', 'success');
            this.items = [];
            this.updateCartUI();
            this.closeCheckout();
            this.showOrderConfirmation({
                id: 'LOCAL-' + Date.now().toString().slice(-6),
                total: this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 
                       (formData.deliveryOption === 'delivery' ? 5.00 : 0)
            });
            
        } catch (error) {
            console.error('Error during checkout:', error);
            window.pharmacy?.showMessage('Failed to place order. Please try again or visit our pharmacy directly.', 'error');
        }
    }

    showOrderConfirmation(order) {
        const modal = document.getElementById('orderConfirmation');
        if (!modal) return;
        
        document.getElementById('confirmedOrderId').textContent = order.id;
        document.getElementById('confirmedOrderTotal').textContent = `$${order.total.toFixed(2)}`;
        modal.style.display = 'block';
    }

    closeConfirmation() {
        const modal = document.getElementById('orderConfirmation');
        if (modal) modal.style.display = 'none';
    }

    viewOrder() {
        this.closeConfirmation();
        window.pharmacy?.showMessage('Order details page coming soon!', 'info');
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing pharmacy and cart...');
    
    // Initialize pharmacy
    window.pharmacy = new Pharmacy();
    window.pharmacy.init();
    
    // Initialize cart
    window.cart = new Cart();
    
    // Setup checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                patientName: document.getElementById('patientName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                deliveryAddress: document.getElementById('deliveryAddress').value,
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
                deliveryOption: document.querySelector('input[name="deliveryOption"]:checked').value
            };
            
            const submitButton = checkoutForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;
            
            try {
                await window.cart.submitCheckout(formData);
            } finally {
                // Restore button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
    
    // Create overlay for cart if it doesn't exist
    if (!document.getElementById('overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.id = 'overlay';
        overlay.onclick = () => window.cart.hideCart();
        document.body.appendChild(overlay);
    }
    
    // Add cart floating button click listener
    const cartFloating = document.getElementById('cartFloating');
    if (cartFloating) {
        cartFloating.addEventListener('click', () => {
            window.cart.showCart();
        });
    }
    
    // Add close cart button listener
    const closeCartBtn = document.querySelector('.close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            window.cart.hideCart();
        });
    }
    
    // Add checkout button listener
    const checkoutBtn = document.querySelector('.cart-summary .btn--primary');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.cart.checkout();
        });
    }
    
    // Add close checkout modal listener
    const closeCheckoutBtn = document.querySelector('#checkoutModal .close-modal');
    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => {
            window.cart.closeCheckout();
        });
    }
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-spinner-small {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
`;
document.head.appendChild(style);