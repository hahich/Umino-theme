// Quantity popover functionality
class QuantityPopover {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Quantity input changes
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-quantity-input]')) {
        this.handleQuantityChange(event);
      }
    });

    // Quantity buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-quantity-button]')) {
        this.handleQuantityButtonClick(event);
      }
    });
  }

  handleQuantityChange(event) {
    const input = event.target;
    const value = parseInt(input.value);
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 999;
    
    // Validate value
    if (isNaN(value) || value < min) {
      input.value = min;
    } else if (value > max) {
      input.value = max;
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('quantity:changed', {
      detail: { value: parseInt(input.value), input }
    }));
  }

  handleQuantityButtonClick(event) {
    event.preventDefault();
    const button = event.target;
    const action = button.dataset.quantityButton;
    const input = button.closest('[data-quantity-wrapper]').querySelector('[data-quantity-input]');
    
    if (!input) return;
    
    const currentValue = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 999;
    
    let newValue = currentValue;
    
    if (action === 'decrease') {
      newValue = Math.max(currentValue - 1, min);
    } else if (action === 'increase') {
      newValue = Math.min(currentValue + 1, max);
    }
    
    if (newValue !== currentValue) {
      input.value = newValue;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

// Initialize quantity popover when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuantityPopover();
  });
} else {
  new QuantityPopover();
} 