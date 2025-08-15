// Recipient form functionality
class RecipientForm {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Recipient form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('[data-recipient-form]')) {
        this.handleRecipientFormSubmit(event);
      }
    });

    // Recipient form toggles
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-recipient-toggle]')) {
        this.handleRecipientToggle(event);
      }
    });

    // Recipient form validation
    document.addEventListener('input', (event) => {
      if (event.target.matches('[data-recipient-input]')) {
        this.handleRecipientInput(event);
      }
    });
  }

  handleRecipientFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('[type="submit"]');
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Saving...';
    }

    // Validate form
    if (!this.validateRecipientForm(form)) {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Save';
      }
      return;
    }

    // Form is valid, allow submission
    form.submit();
  }

  handleRecipientToggle(event) {
    const toggle = event.target;
    const form = toggle.closest('[data-recipient-form]');
    const recipientFields = form.querySelector('[data-recipient-fields]');
    
    if (!recipientFields) return;
    
    if (toggle.checked) {
      recipientFields.style.display = 'block';
      this.enableRecipientFields(form);
    } else {
      recipientFields.style.display = 'none';
      this.disableRecipientFields(form);
    }
  }

  handleRecipientInput(event) {
    const input = event.target;
    const form = input.closest('[data-recipient-form]');
    
    // Real-time validation
    this.validateRecipientField(input);
    
    // Update form validation state
    this.updateFormValidation(form);
  }

  validateRecipientForm(form) {
    const toggle = form.querySelector('[data-recipient-toggle]');
    
    // If recipient toggle is not checked, form is valid
    if (!toggle || !toggle.checked) {
      return true;
    }
    
    const requiredFields = form.querySelectorAll('[data-recipient-input][required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!this.validateRecipientField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  validateRecipientField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    const fieldType = field.type;
    
    // Clear previous error
    this.clearFieldError(field);
    
    // Check if required field is empty
    if (isRequired && !value) {
      this.showFieldError(field, 'This field is required');
      return false;
    }
    
    // Validate email field
    if (fieldType === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showFieldError(field, 'Please enter a valid email address');
        return false;
      }
    }
    
    // Validate phone field
    if (fieldType === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        this.showFieldError(field, 'Please enter a valid phone number');
        return false;
      }
    }
    
    return true;
  }

  showFieldError(field, message) {
    // Remove existing error
    this.clearFieldError(field);
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'recipient-field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    `;
    
    // Add error class to field
    field.classList.add('error');
    
    // Insert error after field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }

  clearFieldError(field) {
    // Remove error class from field
    field.classList.remove('error');
    
    // Remove error message
    const errorElement = field.parentNode.querySelector('.recipient-field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  updateFormValidation(form) {
    const submitButton = form.querySelector('[type="submit"]');
    const isValid = this.validateRecipientForm(form);
    
    if (submitButton) {
      submitButton.disabled = !isValid;
    }
  }

  enableRecipientFields(form) {
    const recipientInputs = form.querySelectorAll('[data-recipient-input]');
    recipientInputs.forEach(input => {
      input.disabled = false;
    });
  }

  disableRecipientFields(form) {
    const recipientInputs = form.querySelectorAll('[data-recipient-input]');
    recipientInputs.forEach(input => {
      input.disabled = true;
      input.value = '';
      this.clearFieldError(input);
    });
  }

  // Utility method to get recipient data
  getRecipientData(form) {
    const toggle = form.querySelector('[data-recipient-toggle]');
    
    if (!toggle || !toggle.checked) {
      return null;
    }
    
    const recipientData = {};
    const recipientInputs = form.querySelectorAll('[data-recipient-input]');
    
    recipientInputs.forEach(input => {
      const key = input.name || input.dataset.recipientField;
      if (key) {
        recipientData[key] = input.value.trim();
      }
    });
    
    return recipientData;
  }

  // Utility method to set recipient data
  setRecipientData(form, data) {
    if (!data) return;
    
    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"], [data-recipient-field="${key}"]`);
      if (input) {
        input.value = data[key];
      }
    });
  }

  // Utility method to reset recipient form
  resetRecipientForm(form) {
    form.reset();
    
    // Clear all field errors
    const recipientInputs = form.querySelectorAll('[data-recipient-input]');
    recipientInputs.forEach(input => {
      this.clearFieldError(input);
    });
    
    // Reset form validation
    this.updateFormValidation(form);
  }
}

// Initialize recipient form when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RecipientForm();
  });
} else {
  new RecipientForm();
} 