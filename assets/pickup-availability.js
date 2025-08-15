// Pickup availability functionality
class PickupAvailability {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Pickup availability buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-pickup-availability-button]')) {
        this.handlePickupAvailabilityClick(event);
      }
    });
  }

  async handlePickupAvailabilityClick(event) {
    event.preventDefault();
    const button = event.target;
    const variantId = button.dataset.variantId;
    
    if (!variantId) return;
    
    // Show loading state
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    
    try {
      const availability = await this.fetchPickupAvailability(variantId);
      this.showPickupAvailability(availability, button);
    } catch (error) {
      console.error('Error fetching pickup availability:', error);
      this.showError('Error loading pickup availability', button);
    } finally {
      // Restore button state
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  async fetchPickupAvailability(variantId) {
    const response = await fetch(`/variants/${variantId}/pickup_availability.js`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch pickup availability');
    }
    
    return await response.json();
  }

  showPickupAvailability(availability, button) {
    // Create modal or popup to show pickup availability
    const modal = this.createPickupModal(availability);
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';
    
    // Close modal when clicking outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        this.closePickupModal(modal);
      }
    });
    
    // Close modal when clicking close button
    const closeButton = modal.querySelector('[data-pickup-modal-close]');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closePickupModal(modal);
      });
    }
  }

  createPickupModal(availability) {
    const modal = document.createElement('div');
    modal.className = 'pickup-availability-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 1000;
      align-items: center;
      justify-content: center;
    `;
    
    const content = document.createElement('div');
    content.className = 'pickup-availability-content';
    content.style.cssText = `
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Pickup Availability';
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.dataset.pickupModalClose = '';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    `;
    
    const availabilityList = this.createAvailabilityList(availability);
    
    content.appendChild(closeButton);
    content.appendChild(title);
    content.appendChild(availabilityList);
    modal.appendChild(content);
    
    return modal;
  }

  createAvailabilityList(availability) {
    const list = document.createElement('div');
    
    if (availability.pickup_locations && availability.pickup_locations.length > 0) {
      availability.pickup_locations.forEach(location => {
        const locationElement = this.createLocationElement(location);
        list.appendChild(locationElement);
      });
    } else {
      const noAvailability = document.createElement('p');
      noAvailability.textContent = 'No pickup locations available for this item.';
      noAvailability.style.cssText = `
        color: #666;
        font-style: italic;
      `;
      list.appendChild(noAvailability);
    }
    
    return list;
  }

  createLocationElement(location) {
    const locationDiv = document.createElement('div');
    locationDiv.style.cssText = `
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 10px;
    `;
    
    const name = document.createElement('h4');
    name.textContent = location.name;
    name.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
    `;
    
    const address = document.createElement('p');
    address.textContent = location.address;
    address.style.cssText = `
      margin: 0 0 5px 0;
      color: #666;
      font-size: 14px;
    `;
    
    const availability = document.createElement('p');
    availability.textContent = location.available ? 'Available for pickup' : 'Not available for pickup';
    availability.style.cssText = `
      margin: 0;
      color: ${location.available ? '#28a745' : '#dc3545'};
      font-weight: 500;
      font-size: 14px;
    `;
    
    locationDiv.appendChild(name);
    locationDiv.appendChild(address);
    locationDiv.appendChild(availability);
    
    return locationDiv;
  }

  closePickupModal(modal) {
    modal.style.display = 'none';
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  showError(message, button) {
    // Show error message
    const errorElement = document.createElement('div');
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    `;
    
    button.parentNode.appendChild(errorElement);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }, 3000);
  }
}

// Initialize pickup availability when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PickupAvailability();
  });
} else {
  new PickupAvailability();
} 