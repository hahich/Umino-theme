// Product form functionality
class ProductForm {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Product form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('form[action*="/cart/add"]')) {
        this.handleProductFormSubmit(event);
      }
    });

    // Variant changes
    document.addEventListener('change', (event) => {
      if (event.target.matches('[name="id"]')) {
        this.handleVariantChange(event);
      }
    });
  }

  async handleProductFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('[type="submit"]');
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Adding...';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const item = await response.json();
        this.handleAddToCartSuccess(item);
      } else {
        const error = await response.json();
        this.handleAddToCartError(error);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.handleAddToCartError({ message: 'Network error occurred' });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Add to Cart';
      }
    }
  }

  handleAddToCartSuccess(item) {
    // Show success message
    this.showMessage('Product added to cart successfully!', 'success');
    
    // Update cart
    document.dispatchEvent(new CustomEvent('cart:update'));
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('product:added-to-cart', { detail: item }));
  }

  handleAddToCartError(error) {
    this.showMessage(error.message || 'Error adding product to cart', 'error');
  }

  async handleVariantChange(event) {
    const select = event.target;
    const variantId = select.value;
    const productId = select.dataset.productId;
    
    if (!variantId || !productId) return;

    try {
      // Prefer handle-based endpoint; derive handle from container data-url or current path
      const container = select.closest('[data-url]') || document.querySelector('[data-url]');
      const productUrl = container?.getAttribute('data-url') || window.location.pathname;
      const match = productUrl.match(/\/products\/(.+?)(?:[\/?]|$)/);
      const handle = match ? match[1] : productId;
      const response = await fetch(`/products/${handle}.js`);
      if (response.ok) {
        const product = await response.json();
        const variant = product.variants.find(v => v.id.toString() === variantId);
        
        if (variant) {
          this.updateProductInfo(variant, product);
        }
      }
    } catch (error) {
      console.error('Error fetching variant:', error);
    }
  }

  updateProductInfo(variant, product) {
    // Update price
    const priceElements = document.querySelectorAll('[data-product-price]');
    priceElements.forEach(element => {
      element.textContent = this.formatMoney(variant.price);
    });

    // Update compare price
    const comparePriceElements = document.querySelectorAll('[data-product-compare-price]');
    comparePriceElements.forEach(element => {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        element.textContent = this.formatMoney(variant.compare_at_price);
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });

    // Update availability
    const availabilityElements = document.querySelectorAll('[data-product-availability]');
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

    // Update variant image
    if (variant.featured_image) {
      const imageElements = document.querySelectorAll('[data-product-image]');
      imageElements.forEach(element => {
        element.src = variant.featured_image.src;
        element.srcset = variant.featured_image.src;
      });
    }

    // Trigger custom event
    document.dispatchEvent(new CustomEvent('product:variant-changed', { 
      detail: { variant, product } 
    }));
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `product-form-message product-form-message--${type}`;
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

  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }
}

// Initialize product form when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProductForm();
  });
} else {
  new ProductForm();
} 