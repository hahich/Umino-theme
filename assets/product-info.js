// Product info functionality
class ProductInfo {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Listen for variant changes
    document.addEventListener('product:variant-changed', (event) => {
      this.handleVariantChange(event.detail);
    });
  }

  handleVariantChange({ variant, product }) {
    this.updatePrice(variant);
    this.updateAvailability(variant);
    this.updateVariantImage(variant);
    this.updateVariantTitle(variant);
    this.updateVariantSku(variant);
  }

  updatePrice(variant) {
    const priceElements = document.querySelectorAll('[data-product-price]');
    const comparePriceElements = document.querySelectorAll('[data-product-compare-price]');
    
    priceElements.forEach(element => {
      element.textContent = this.formatMoney(variant.price);
    });
    
    comparePriceElements.forEach(element => {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        element.textContent = this.formatMoney(variant.compare_at_price);
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }

  updateAvailability(variant) {
    const availabilityElements = document.querySelectorAll('[data-product-availability]');
    const addToCartButtons = document.querySelectorAll('[data-add-to-cart]');
    
    availabilityElements.forEach(element => {
      if (variant.available) {
        element.textContent = 'In Stock';
        element.classList.remove('out-of-stock');
        element.classList.add('in-stock');
      } else {
        element.textContent = 'Out of Stock';
        element.classList.remove('in-stock');
        element.classList.add('out-of-stock');
      }
    });
    
    addToCartButtons.forEach(button => {
      button.disabled = !variant.available;
      if (!variant.available) {
        button.textContent = 'Sold Out';
      } else {
        button.textContent = 'Add to Cart';
      }
    });
  }

  updateVariantImage(variant) {
    if (variant.featured_image) {
      const imageElements = document.querySelectorAll('[data-product-image]');
      imageElements.forEach(element => {
        element.src = variant.featured_image.src;
        element.srcset = variant.featured_image.src;
        element.alt = variant.featured_image.alt || variant.title;
      });
    }
  }

  updateVariantTitle(variant) {
    const titleElements = document.querySelectorAll('[data-variant-title]');
    titleElements.forEach(element => {
      element.textContent = variant.title;
    });
  }

  updateVariantSku(variant) {
    const skuElements = document.querySelectorAll('[data-variant-sku]');
    skuElements.forEach(element => {
      element.textContent = variant.sku || '';
    });
  }

  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }
}

// Initialize product info when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProductInfo();
  });
} else {
  new ProductInfo();
} 