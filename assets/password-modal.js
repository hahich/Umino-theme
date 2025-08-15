// Password modal functionality
class PasswordModal {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Password modal open buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-password-modal-open]')) {
        this.openModal(event);
      }
    });

    // Password modal close buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-password-modal-close]')) {
        this.closeModal(event);
      }
    });

    // Overlay clicks
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-password-modal-overlay]')) {
        this.closeModal(event);
      }
    });

    // Password form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('[data-password-form]')) {
        this.handlePasswordSubmit(event);
      }
    });

    // Keyboard events
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  openModal(event) {
    event.preventDefault();
    const trigger = event.target;
    const modalId = trigger.dataset.passwordModalOpen;
    const modal = document.getElementById(modalId);
    
    if (!modal) return;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus password input
    const passwordInput = modal.querySelector('input[type="password"]');
    if (passwordInput) {
      passwordInput.focus();
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('password-modal:opened', { 
      detail: { modal, trigger } 
    }));
  }

  closeModal(event) {
    event.preventDefault();
    const trigger = event.target;
    const modal = trigger.closest('[data-password-modal]') || document.querySelector('[data-password-modal].active');
    
    if (modal) {
      this.closeModalElement(modal);
    }
  }

  closeModalElement(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear form
    const form = modal.querySelector('[data-password-form]');
    if (form) {
      form.reset();
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('password-modal:closed', { 
      detail: { modal } 
    }));
  }

  closeAllModals() {
    const modals = document.querySelectorAll('[data-password-modal].active');
    modals.forEach(modal => {
      this.closeModalElement(modal);
    });
  }

  async handlePasswordSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('[type="submit"]');
    const passwordInput = form.querySelector('input[type="password"]');
    
    if (!passwordInput) return;
    
    const password = passwordInput.value.trim();
    
    if (!password) {
      this.showError('Please enter a password', form);
      return;
    }
    
    // Disable submit button
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Checking...';
    }
    
    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Password is correct, redirect or show success
        this.handlePasswordSuccess(form);
      } else {
        // Password is incorrect
        this.handlePasswordError(form);
      }
    } catch (error) {
      console.error('Error checking password:', error);
      this.showError('An error occurred while checking the password', form);
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Enter';
      }
    }
  }

  handlePasswordSuccess(form) {
    const modal = form.closest('[data-password-modal]');
    
    // Show success message
    this.showSuccess('Password accepted!', form);
    
    // Close modal after a short delay
    setTimeout(() => {
      if (modal) {
        this.closeModalElement(modal);
      }
      
      // Redirect to the intended page or reload
      const redirectUrl = form.dataset.redirectUrl || window.location.href;
      window.location.href = redirectUrl;
    }, 1000);
  }

  handlePasswordError(form) {
    this.showError('Incorrect password. Please try again.', form);
    
    // Clear password input
    const passwordInput = form.querySelector('input[type="password"]');
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  showError(message, form) {
    // Remove existing error messages
    const existingError = form.querySelector('.password-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'password-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: #dc3545;
      font-size: 14px;
      margin-top: 10px;
      text-align: center;
    `;
    
    // Insert after the form
    form.parentNode.insertBefore(errorElement, form.nextSibling);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }, 5000);
  }

  showSuccess(message, form) {
    // Remove existing messages
    const existingMessage = form.querySelector('.password-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create success message
    const messageElement = document.createElement('div');
    messageElement.className = 'password-message password-message--success';
    messageElement.textContent = message;
    messageElement.style.cssText = `
      color: #28a745;
      font-size: 14px;
      margin-top: 10px;
      text-align: center;
    `;
    
    // Insert after the form
    form.parentNode.insertBefore(messageElement, form.nextSibling);
  }

  // Utility method to programmatically open a password modal
  openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus password input
    const passwordInput = modal.querySelector('input[type="password"]');
    if (passwordInput) {
      passwordInput.focus();
    }
    
    return modal;
  }

  // Utility method to programmatically close a password modal
  closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      this.closeModalElement(modal);
    }
  }
}

// Initialize password modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PasswordModal();
  });
} else {
  new PasswordModal();
} 