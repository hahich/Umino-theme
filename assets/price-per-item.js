// Price per item functionality
class PricePerItem {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Listen for quantity changes
    document.addEventListener('quantity:changed', (event) => {
      this.handleQuantityChange(event.detail);
    });

    // Listen for variant changes
    document.addEventListener('product:variant-changed', (event) => {
      this.handleVariantChange(event.detail);
    });
  }

  handleQuantityChange({ value, input }) {
    const container = input.closest('[data-price-per-item-container]');
    if (!container) return;
    
    const pricePerItemElement = container.querySelector('[data-price-per-item]');
    const totalPriceElement = container.querySelector('[data-total-price]');
    const unitPrice = parseFloat(container.dataset.unitPrice) || 0;
    
    if (pricePerItemElement) {
      const pricePerItem = unitPrice / value;
      pricePerItemElement.textContent = this.formatMoney(pricePerItem);
    }
    
    if (totalPriceElement) {
      const totalPrice = unitPrice * value;
      totalPriceElement.textContent = this.formatMoney(totalPrice);
    }
  }

  handleVariantChange({ variant }) {
    const containers = document.querySelectorAll('[data-price-per-item-container]');
    
    containers.forEach(container => {
      const unitPrice = variant.price;
      container.dataset.unitPrice = unitPrice;
      
      const quantityInput = container.querySelector('[data-quantity-input]');
      if (quantityInput) {
        const quantity = parseInt(quantityInput.value) || 1;
        this.handleQuantityChange({ value: quantity, input: quantityInput });
      }
    });
  }

  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }
}

// Initialize price per item when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PricePerItem();
  });
} else {
  new PricePerItem();
} 