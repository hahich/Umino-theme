// Customer functionality
class Customer {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Customer form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('[data-customer-form]')) {
        this.handleCustomerFormSubmit(event);
      }
    });

    // Customer address form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('[data-customer-address-form]')) {
        this.handleAddressFormSubmit(event);
      }
    });

    // Address deletion
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-address-delete]')) {
        this.handleAddressDelete(event);
      }
    });

    // Address editing
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-address-edit]')) {
        this.handleAddressEdit(event);
      }
    });
  }

  async handleCustomerFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('[type="submit"]');
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Saving...';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: formData
      });

      if (response.ok) {
        this.showMessage('Profile updated successfully!', 'success');
        // Optionally redirect or refresh
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const error = await response.text();
        this.showMessage('Error updating profile', 'error');
      }
    } catch (error) {
      console.error('Error updating customer profile:', error);
      this.showMessage('Error updating profile', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Save';
      }
    }
  }

  async handleAddressFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('[type="submit"]');
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Saving...';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: formData
      });

      if (response.ok) {
        this.showMessage('Address saved successfully!', 'success');
        // Optionally redirect or refresh
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const error = await response.text();
        this.showMessage('Error saving address', 'error');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      this.showMessage('Error saving address', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Save';
      }
    }
  }

  async handleAddressDelete(event) {
    event.preventDefault();
    const button = event.target;
    const addressId = button.dataset.addressId;
    
    if (!addressId) return;
    
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    // Show loading state
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Deleting...';
    
    try {
      const response = await fetch(`/account/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        this.showMessage('Address deleted successfully!', 'success');
        // Remove the address element from the DOM
        const addressElement = button.closest('[data-address-item]');
        if (addressElement) {
          addressElement.remove();
        }
      } else {
        this.showMessage('Error deleting address', 'error');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      this.showMessage('Error deleting address', 'error');
    } finally {
      // Restore button state
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  handleAddressEdit(event) {
    event.preventDefault();
    const button = event.target;
    const addressId = button.dataset.addressId;
    
    if (!addressId) return;
    
    // Find the address form for this address
    const addressForm = document.querySelector(`[data-address-form="${addressId}"]`);
    if (addressForm) {
      // Toggle form visibility
      addressForm.style.display = addressForm.style.display === 'none' ? 'block' : 'none';
    }
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `customer-message customer-message--${type}`;
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

// Initialize customer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Customer();
  });
} else {
  new Customer();
} 