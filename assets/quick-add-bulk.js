// Quick add bulk functionality
class QuickAddBulk {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Bulk add buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-quick-add-bulk]')) {
        this.handleBulkAdd(event);
      }
    });
  }

  async handleBulkAdd(event) {
    event.preventDefault();
    const button = event.target;
    const container = button.closest('[data-quick-add-bulk-container]');
    
    if (!container) return;
    
    // Get all selected items
    const selectedItems = this.getSelectedItems(container);
    
    if (selectedItems.length === 0) {
      this.showMessage('Please select at least one item', 'warning');
      return;
    }
    
    // Disable button and show loading state
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Adding...';
    
    try {
      await this.addItemsToCart(selectedItems);
      this.showMessage(`${selectedItems.length} items added to cart!`, 'success');
    } catch (error) {
      console.error('Error in bulk add:', error);
      this.showMessage('Error adding items to cart', 'error');
    } finally {
      // Restore button state
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  getSelectedItems(container) {
    const checkboxes = container.querySelectorAll('[data-quick-add-bulk-item]:checked');
    const items = [];
    
    checkboxes.forEach(checkbox => {
      const item = {
        variantId: checkbox.dataset.variantId,
        quantity: parseInt(checkbox.dataset.quantity) || 1
      };
      
      if (item.variantId) {
        items.push(item);
      }
    });
    
    return items;
  }

  async addItemsToCart(items) {
    const promises = items.map(item => 
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.variantId,
          quantity: item.quantity
        })
      })
    );
    
    const responses = await Promise.all(promises);
    
    // Check if all requests were successful
    const failedResponses = responses.filter(response => !response.ok);
    
    if (failedResponses.length > 0) {
      throw new Error(`${failedResponses.length} items failed to add to cart`);
    }
    
    // Update cart
    document.dispatchEvent(new CustomEvent('cart:update'));
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `quick-add-bulk-message quick-add-bulk-message--${type}`;
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
    } else if (type === 'warning') {
      messageElement.style.backgroundColor = '#ffc107';
      messageElement.style.color = '#000';
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

// Initialize quick add bulk when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuickAddBulk();
  });
} else {
  new QuickAddBulk();
} 