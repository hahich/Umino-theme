// Cart functionality
class Cart {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Cart form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('form[action*="/cart/add"]')) {
        this.handleAddToCart(event);
      }
    });

    // Quantity changes
    document.addEventListener('change', (event) => {
      if (event.target.matches('[name="quantity"]')) {
        this.handleQuantityChange(event);
      }
    });

    // Remove item buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-cart-remove]')) {
        this.handleRemoveItem(event);
      }
    });
  }

  async handleAddToCart(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const item = await response.json();
        this.updateCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async handleQuantityChange(event) {
    const input = event.target;
    const itemKey = input.dataset.itemKey;
    const quantity = parseInt(input.value);
    
    if (quantity === 0) {
      await this.removeItem(itemKey);
    } else {
      await this.updateItemQuantity(itemKey, quantity);
    }
  }

  async handleRemoveItem(event) {
    event.preventDefault();
    const button = event.target;
    const itemKey = button.dataset.itemKey;
    await this.removeItem(itemKey);
  }

  async updateItemQuantity(itemKey, quantity) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemKey,
          quantity: quantity
        })
      });
      
      if (response.ok) {
        this.updateCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
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

  async updateCart() {
    try {
      const response = await fetch('/cart.js');
      if (response.ok) {
        const cart = await response.json();
        this.updateCartUI(cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  updateCartUI(cart) {
    // Update cart count
    const cartCountElements = document.querySelectorAll('[data-cart-count]');
    cartCountElements.forEach(element => {
      element.textContent = cart.item_count;
    });

    // Update cart total
    const cartTotalElements = document.querySelectorAll('[data-cart-total]');
    cartTotalElements.forEach(element => {
      element.textContent = this.formatMoney(cart.total_price);
    });

    // Trigger custom event for other components
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  }

  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }
}

// Initialize cart when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Cart();
  });
} else {
  new Cart();
} 