// Quick add functionality
class QuickAdd {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Quick add buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-quick-add]')) {
        this.handleQuickAdd(event);
      }
    });
  }

  async handleQuickAdd(event) {
    event.preventDefault();
    const button = event.target;
    const productId = button.dataset.productId;
    const variantId = button.dataset.variantId || productId;
    
    if (!productId) return;
    
    // Disable button and show loading state
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Adding...';
    
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: 1
        })
      });
      
      if (response.ok) {
        const item = await response.json();
        this.handleQuickAddSuccess(item, button);
      } else {
        const error = await response.json();
        this.handleQuickAddError(error, button);
      }
    } catch (error) {
      console.error('Error in quick add:', error);
      this.handleQuickAddError({ message: 'Network error occurred' }, button);
    } finally {
      // Restore button state
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  handleQuickAddSuccess(item, button) {
    // Show success message
    this.showMessage('Product added to cart!', 'success');
    
    // Update cart
    document.dispatchEvent(new CustomEvent('cart:update'));
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('quick-add:success', { detail: item }));
  }

  handleQuickAddError(error, button) {
    this.showMessage(error.message || 'Error adding product to cart', 'error');
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('quick-add:error', { detail: error }));
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `quick-add-message quick-add-message--${type}`;
    messageElement.textContent = message;
    
    // Add styles
    messageElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
      messageElement.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
      messageElement.style.backgroundColor = '#dc3545';
    } else {
      messageElement.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
      messageElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize quick add when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuickAdd();
  });
} else {
  new QuickAdd();
} 