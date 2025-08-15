class CartDrawer {
  constructor() {
    this.drawer = document.getElementById('cart-drawer');
    this.overlay = document.getElementById('cart-drawer-overlay');
    this.closeBtn = document.getElementById('cart-drawer-close');
    this.isOpen = false;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCartCount();
  }

  bindEvents() {
    // Close cart drawer
    this.closeBtn?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());
    
    // Cart operations
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Quantity buttons
      if (target.matches('[data-action="increase"]')) {
        this.updateQuantity(target.dataset.itemKey, 1);
      } else if (target.matches('[data-action="decrease"]')) {
        this.updateQuantity(target.dataset.itemKey, -1);
      } else if (target.matches('[data-action="remove"]')) {
        this.removeItem(target.dataset.itemKey);
      }
    });

    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      this.updateCart();
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    if (!this.drawer) return;
    
    this.drawer.classList.add('is-open');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Focus management
    this.closeBtn?.focus();
  }

  close() {
    if (!this.drawer) return;
    
    this.drawer.classList.remove('is-open');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  async updateCart() {
    try {
      const response = await fetch('/cart.js');
      if (response.ok) {
        const cart = await response.json();
        this.renderCart(cart);
        this.updateCartCount();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  renderCart(cart) {
    if (!this.drawer) return;

    const body = this.drawer.querySelector('.cart-drawer__body');
    const footer = this.drawer.querySelector('.cart-drawer__footer');
    
    if (cart.item_count > 0) {
      // Render cart items
      const itemsHtml = cart.items.map(item => this.renderCartItem(item)).join('');
      body.innerHTML = `
        <div class="cart-drawer__items">
          ${itemsHtml}
        </div>
      `;
      
      // Render footer with checkout
      footer.innerHTML = `
        <div class="cart-drawer__subtotal">
          <span>Subtotal:</span>
          <span class="cart-drawer__subtotal-price">${this.formatMoney(cart.total_price)}</span>
        </div>
        <button class="cart-drawer__checkout-btn" onclick="window.location.href='/cart'">
          Checkout
        </button>
        <p class="cart-drawer__shipping">🔥 Free delivery on orders over 175₫</p>
      `;
    } else {
      // Render empty cart
      body.innerHTML = `
        <div class="cart-drawer__empty">
          <h3 class="cart-drawer__empty-title">Your cart is empty.</h3>
          <p class="cart-drawer__empty-message">Find trending collection, products right below!</p>
        </div>
      `;
      
      footer.innerHTML = `
        <button class="cart-drawer__continue-btn" onclick="window.location.href='/collections'">
          Show All Collections
        </button>
        <p class="cart-drawer__shipping">🔥 Free delivery on orders over 175₫</p>
      `;
    }
  }

  renderCartItem(item) {
    const image = item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy" width="60" height="60">` : '<div class="cart-drawer__item-placeholder"></div>';
    const variant = item.product_has_only_default_variant ? '' : `<p class="cart-drawer__item-variant">${item.variant_title}</p>`;
    
    return `
      <div class="cart-drawer__item" data-cart-item="${item.key}">
        <div class="cart-drawer__item-image">
          ${image}
        </div>
        <div class="cart-drawer__item-details">
          <h3 class="cart-drawer__item-title">${item.title}</h3>
          ${variant}
          <div class="cart-drawer__item-price">${this.formatMoney(item.final_line_price)}</div>
          <div class="cart-drawer__item-quantity">
            <button class="cart-drawer__quantity-btn" data-action="decrease" data-item-key="${item.key}">-</button>
            <span class="cart-drawer__quantity-value">${item.quantity}</span>
            <button class="cart-drawer__quantity-btn" data-action="increase" data-item-key="${item.key}">+</button>
          </div>
        </div>
        <button class="cart-drawer__remove-btn" data-action="remove" data-item-key="${item.key}" aria-label="Remove ${item.title}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
  }

  async updateQuantity(itemKey, change) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemKey,
          quantity: change
        })
      });
      
      if (response.ok) {
        this.updateCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  async removeItem(itemKey) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemKey,
          quantity: 0
        })
      });
      
      if (response.ok) {
        this.updateCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  updateCartCount() {
    const countElement = document.querySelector('[data-cart-count]');
    if (countElement) {
      fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
          countElement.textContent = cart.item_count;
          countElement.style.display = cart.item_count > 0 ? 'flex' : 'none';
        })
        .catch(error => {
          console.error('Error updating cart count:', error);
        });
    }
  }

  formatMoney(cents) {
    // Simple money formatting - you might want to use Shopify's money filter instead
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  }
}

// Initialize cart drawer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cartDrawer = new CartDrawer();
  });
} else {
  window.cartDrawer = new CartDrawer();
}

// Global function to open cart drawer
window.openCartDrawer = function() {
  window.cartDrawer?.open();
}; 