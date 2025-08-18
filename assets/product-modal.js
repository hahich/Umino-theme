// Product modal functionality
class ProductModal {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Product modal open buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-product-modal-open]')) {
        this.openModal(event);
      }
    });

    // Product modal close buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-product-modal-close]')) {
        this.closeModal(event);
      }
    });

    // Overlay clicks
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-product-modal-overlay]')) {
        this.closeModal(event);
      }
    });

    // Keyboard events
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  async openModal(event) {
    event.preventDefault();
    const trigger = event.target;
    const productId = trigger.dataset.productId;
    const modalId = trigger.dataset.productModalOpen;
    
    if (!productId || !modalId) return;
    
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Show loading state
    this.showLoading(modal);
    
    try {
      // Fetch product data
      const productData = await this.fetchProductData(productId);
      
      // Populate modal with product data
      this.populateModal(modal, productData);
      
      // Show modal
      this.showModal(modal);
      
    } catch (error) {
      console.error('Error loading product modal:', error);
      this.showError(modal, 'Error loading product information');
    }
  }

  async fetchProductData(productId) {
    // Prefer handle-based endpoint; get handle from a nearby element or fallback to current URL
    const triggerEl = document.querySelector(`[data-product-modal-open][data-product-id="${productId}"]`);
    const handleAttr = triggerEl?.getAttribute('data-product-handle');
    const fromUrl = window.location.pathname.match(/\/products\/(.+?)(?:[\/?]|$)/)?.[1];
    const handle = handleAttr || fromUrl || productId;
    const response = await fetch(`/products/${handle}.js`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product data');
    }
    
    return await response.json();
  }

  populateModal(modal, product) {
    // Populate product title
    const titleElement = modal.querySelector('[data-product-title]');
    if (titleElement) {
      titleElement.textContent = product.title;
    }
    
    // Populate product price
    const priceElement = modal.querySelector('[data-product-price]');
    if (priceElement) {
      priceElement.textContent = this.formatMoney(product.price);
    }
    
    // Populate product compare price
    const comparePriceElement = modal.querySelector('[data-product-compare-price]');
    if (comparePriceElement && product.compare_at_price && product.compare_at_price > product.price) {
      comparePriceElement.textContent = this.formatMoney(product.compare_at_price);
      comparePriceElement.style.display = 'block';
    } else if (comparePriceElement) {
      comparePriceElement.style.display = 'none';
    }
    
    // Populate product description
    const descriptionElement = modal.querySelector('[data-product-description]');
    if (descriptionElement) {
      descriptionElement.innerHTML = product.description;
    }
    
    // Populate product image
    const imageElement = modal.querySelector('[data-product-image]');
    if (imageElement && product.featured_image) {
      imageElement.src = product.featured_image;
      imageElement.alt = product.title;
    }
    
    // Populate product variants
    this.populateVariants(modal, product);
    
    // Set up add to cart form
    this.setupAddToCartForm(modal, product);
  }

  populateVariants(modal, product) {
    const variantSelect = modal.querySelector('[data-product-variant-select]');
    if (!variantSelect || !product.variants) return;
    
    // Clear existing options
    variantSelect.innerHTML = '';
    
    // Add variant options
    product.variants.forEach(variant => {
      const option = document.createElement('option');
      option.value = variant.id;
      option.textContent = variant.title;
      option.disabled = !variant.available;
      variantSelect.appendChild(option);
    });
    
    // Set default variant
    if (product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.available) || product.variants[0];
      variantSelect.value = defaultVariant.id;
    }
  }

  setupAddToCartForm(modal, product) {
    const form = modal.querySelector('[data-product-form]');
    if (!form) return;
    
    // Set product ID
    const productIdInput = form.querySelector('input[name="id"]');
    if (productIdInput && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.available) || product.variants[0];
      productIdInput.value = defaultVariant.id;
    }
    
    // Handle variant changes
    const variantSelect = modal.querySelector('[data-product-variant-select]');
    if (variantSelect) {
      variantSelect.addEventListener('change', (event) => {
        const variantId = event.target.value;
        const variant = product.variants.find(v => v.id.toString() === variantId);
        
        if (variant) {
          this.updateVariantInfo(modal, variant);
          
          // Update form
          if (productIdInput) {
            productIdInput.value = variant.id;
          }
        }
      });
    }
    
    // Handle form submission
    form.addEventListener('submit', (event) => {
      this.handleAddToCart(event, modal);
    });
  }

  updateVariantInfo(modal, variant) {
    // Update price
    const priceElement = modal.querySelector('[data-product-price]');
    if (priceElement) {
      priceElement.textContent = this.formatMoney(variant.price);
    }
    
    // Update compare price
    const comparePriceElement = modal.querySelector('[data-product-compare-price]');
    if (comparePriceElement && variant.compare_at_price && variant.compare_at_price > variant.price) {
      comparePriceElement.textContent = this.formatMoney(variant.compare_at_price);
      comparePriceElement.style.display = 'block';
    } else if (comparePriceElement) {
      comparePriceElement.style.display = 'none';
    }
    
    // Update availability
    const addToCartButton = modal.querySelector('[data-add-to-cart-button]');
    if (addToCartButton) {
      if (variant.available) {
        addToCartButton.disabled = false;
        addToCartButton.textContent = 'Add to Cart';
      } else {
        addToCartButton.disabled = true;
        addToCartButton.textContent = 'Sold Out';
      }
    }
    
    // Update variant image
    if (variant.featured_image) {
      const imageElement = modal.querySelector('[data-product-image]');
      if (imageElement) {
        imageElement.src = variant.featured_image.src;
        imageElement.alt = variant.title;
      }
    }
  }

  async handleAddToCart(event, modal) {
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
        this.handleAddToCartSuccess(modal, item);
      } else {
        const error = await response.json();
        this.handleAddToCartError(modal, error);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.handleAddToCartError(modal, { message: 'Network error occurred' });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Add to Cart';
      }
    }
  }

  handleAddToCartSuccess(modal, item) {
    // Show success message
    this.showSuccess(modal, 'Product added to cart successfully!');
    
    // Update cart
    document.dispatchEvent(new CustomEvent('cart:update'));
    
    // Close modal after a short delay
    setTimeout(() => {
      this.closeModalElement(modal);
    }, 1500);
  }

  handleAddToCartError(modal, error) {
    this.showError(modal, error.message || 'Error adding product to cart');
  }

  showModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('product-modal:opened', { 
      detail: { modal } 
    }));
  }

  closeModal(event) {
    event.preventDefault();
    const trigger = event.target;
    const modal = trigger.closest('[data-product-modal]') || document.querySelector('[data-product-modal].active');
    
    if (modal) {
      this.closeModalElement(modal);
    }
  }

  closeModalElement(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear modal content
    this.clearModalContent(modal);
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('product-modal:closed', { 
      detail: { modal } 
    }));
  }

  closeAllModals() {
    const modals = document.querySelectorAll('[data-product-modal].active');
    modals.forEach(modal => {
      this.closeModalElement(modal);
    });
  }

  showLoading(modal) {
    const content = modal.querySelector('[data-product-modal-content]');
    if (content) {
      content.innerHTML = '<div class="loading">Loading...</div>';
    }
  }

  showError(modal, message) {
    const content = modal.querySelector('[data-product-modal-content]');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  showSuccess(modal, message) {
    const content = modal.querySelector('[data-product-modal-content]');
    if (content) {
      content.innerHTML = `<div class="success">${message}</div>`;
    }
  }

  clearModalContent(modal) {
    const content = modal.querySelector('[data-product-modal-content]');
    if (content) {
      content.innerHTML = '';
    }
  }

  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }
}

// Initialize product modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProductModal();
  });
} else {
  new ProductModal();
} 