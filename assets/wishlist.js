class WishlistManager {
  constructor() {
    this.wishlistKey = 'umino_wishlist';
    this.wishlistItems = this.loadWishlist();
    this.init();
  }

  init() {
    // Initialize wishlist buttons
    this.initWishlistButtons();
    
    // Update header counter
    this.updateHeaderCounter();
    
    // Listen for cart changes to update cart counter
    this.listenForCartChanges();
  }

  loadWishlist() {
    try {
      const stored = localStorage.getItem(this.wishlistKey);
      const parsed = stored ? JSON.parse(stored) : [];
      // normalize as strings to avoid indexOf mismatch
      return parsed.map(id => String(id));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlistItems));
      document.dispatchEvent(new Event('wishlist:updated'));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }

  addToWishlist(productId) {
    const id = String(productId);
    if (!this.wishlistItems.includes(id)) {
      this.wishlistItems.push(id);
      this.saveWishlist();
      this.updateHeaderCounter();
      this.updateProductButton(id, true);
      this.showNotification('Added to wishlist', 'success');
      return true;
    }
    return false;
  }

  removeFromWishlist(productId) {
    const id = String(productId);
    const index = this.wishlistItems.indexOf(id);
    if (index > -1) {
      this.wishlistItems.splice(index, 1);
      this.saveWishlist();
      this.updateHeaderCounter();
      this.updateProductButton(id, false);
      this.showNotification('Removed from wishlist', 'info');
      return true;
    }
    return false;
  }

  toggleWishlist(productId) {
    const id = String(productId);
    if (this.wishlistItems.includes(id)) {
      return this.removeFromWishlist(id);
    } else {
      return this.addToWishlist(id);
    }
  }

  isInWishlist(productId) {
    return this.wishlistItems.includes(String(productId));
  }

  updateHeaderCounter() {
    const counter = document.querySelector('[data-wishlist-count]');
    if (counter) {
      counter.textContent = this.wishlistItems.length;
      counter.style.display = this.wishlistItems.length > 0 ? 'flex' : 'none';
    }
  }

  updateProductButton(productId, isInWishlist) {
    const buttons = document.querySelectorAll(`[data-wishlist-button][data-product-id="${CSS.escape(String(productId))}"]`);
    buttons.forEach(button => {
      if (isInWishlist) {
        button.classList.add('wishlist-button--active');
        button.setAttribute('aria-label', 'Remove from wishlist');
        button.setAttribute('title', 'Remove from wishlist');
      } else {
        button.classList.remove('wishlist-button--active');
        button.setAttribute('aria-label', 'Add to wishlist');
        button.setAttribute('title', 'Add to wishlist');
      }
    });
  }

  initWishlistButtons() {
    // Initialize existing buttons
    document.querySelectorAll('[data-wishlist-button]').forEach(button => {
      const productId = button.dataset.productId;
      if (productId) {
        this.updateProductButton(productId, this.isInWishlist(productId));
        
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleWishlist(productId);
        });
      }
    });

    // Delegated handler to be robust for dynamic content (no reloads required)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-wishlist-button]');
      if (!btn) return;
      const id = btn.dataset.productId;
      if (!id) return;
      e.preventDefault();
      this.toggleWishlist(id);
    });

    // Listen for new buttons (for dynamic content)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const newButtons = node.querySelectorAll('[data-wishlist-button]');
            newButtons.forEach(button => {
              const productId = button.dataset.productId;
              if (productId && !button.hasAttribute('data-wishlist-initialized')) {
                button.setAttribute('data-wishlist-initialized', 'true');
                this.updateProductButton(productId, this.isInWishlist(productId));
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  listenForCartChanges() {
    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      this.updateCartCounter();
    });

    // Update cart counter on page load
    this.updateCartCounter();
  }

  updateCartCounter() {
    const counter = document.querySelector('[data-cart-count]');
    if (counter) {
      // Get cart count from Shopify cart object or use current value
      const cartCount = window.Shopify?.cart?.item_count || 
                       parseInt(counter.textContent) || 0;
      counter.textContent = cartCount;
      counter.style.display = cartCount > 0 ? 'flex' : 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `wishlist-notification wishlist-notification--${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#2ed573' : '#ff6b7a'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
    }, 3000);
  }

  getWishlistItems() { return [...this.wishlistItems]; }

  clearWishlist() {
    this.wishlistItems = [];
    this.saveWishlist();
    this.updateHeaderCounter();
    this.showNotification('Wishlist cleared', 'info');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.wishlistManager = new WishlistManager(); });
} else {
  window.wishlistManager = new WishlistManager();
} 