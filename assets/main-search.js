// Main search functionality
class MainSearch {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Search form submissions
    document.addEventListener('submit', (event) => {
      if (event.target.matches('[data-search-form]')) {
        this.handleSearchSubmit(event);
      }
    });

    // Search input changes
    document.addEventListener('input', (event) => {
      if (event.target.matches('[data-search-input]')) {
        this.handleSearchInput(event);
      }
    });

    // Search suggestions
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-search-suggestion]')) {
        this.handleSearchSuggestion(event);
      }
    });
  }

  handleSearchSubmit(event) {
    const form = event.target;
    const input = form.querySelector('[data-search-input]');
    const query = input.value.trim();
    
    if (!query) {
      event.preventDefault();
      this.showMessage('Please enter a search term', 'warning');
      return;
    }
    
    // Allow form to submit normally
  }

  handleSearchInput(event) {
    const input = event.target;
    const query = input.value.trim();
    const suggestionsContainer = input.closest('[data-search-container]').querySelector('[data-search-suggestions]');
    
    if (!suggestionsContainer) return;
    
    if (query.length < 2) {
      this.hideSuggestions(suggestionsContainer);
      return;
    }
    
    // Debounce search suggestions
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.fetchSearchSuggestions(query, suggestionsContainer);
    }, 300);
  }

  handleSearchSuggestion(event) {
    event.preventDefault();
    const suggestion = event.target;
    const query = suggestion.dataset.searchQuery;
    const input = suggestion.closest('[data-search-container]').querySelector('[data-search-input]');
    
    if (input && query) {
      input.value = query;
      this.hideSuggestions(suggestion.closest('[data-search-suggestions]'));
      
      // Submit the search form
      const form = input.closest('[data-search-form]');
      if (form) {
        form.submit();
      }
    }
  }

  async fetchSearchSuggestions(query, container) {
    try {
      const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`);
      
      if (response.ok) {
        const data = await response.json();
        this.displaySearchSuggestions(data, container);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
    }
  }

  displaySearchSuggestions(data, container) {
    container.innerHTML = '';
    
    if (data.resources && data.resources.results && data.resources.results.products) {
      const products = data.resources.results.products;
      
      if (products.length > 0) {
        const suggestionsList = document.createElement('ul');
        suggestionsList.style.cssText = `
          list-style: none;
          margin: 0;
          padding: 0;
          border: 1px solid #ddd;
          border-top: none;
          background: white;
          max-height: 300px;
          overflow-y: auto;
        `;
        
        products.forEach(product => {
          const suggestionItem = this.createSuggestionItem(product);
          suggestionsList.appendChild(suggestionItem);
        });
        
        container.appendChild(suggestionsList);
        container.style.display = 'block';
      } else {
        this.hideSuggestions(container);
      }
    } else {
      this.hideSuggestions(container);
    }
  }

  createSuggestionItem(product) {
    const item = document.createElement('li');
    item.style.cssText = `
      padding: 10px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      display: flex;
      align-items: center;
    `;
    
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = '#f8f9fa';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'white';
    });
    
    // Product image
    if (product.featured_image) {
      const image = document.createElement('img');
      image.src = product.featured_image;
      image.alt = product.title;
      image.style.cssText = `
        width: 40px;
        height: 40px;
        object-fit: cover;
        margin-right: 10px;
        border-radius: 4px;
      `;
      item.appendChild(image);
    }
    
    // Product info
    const info = document.createElement('div');
    info.style.cssText = `
      flex: 1;
    `;
    
    const title = document.createElement('div');
    title.textContent = product.title;
    title.style.cssText = `
      font-weight: 500;
      margin-bottom: 2px;
    `;
    
    const price = document.createElement('div');
    price.textContent = this.formatMoney(product.price);
    price.style.cssText = `
      color: #666;
      font-size: 14px;
    `;
    
    info.appendChild(title);
    info.appendChild(price);
    item.appendChild(info);
    
    // Make the entire item clickable
    item.dataset.searchSuggestion = '';
    item.dataset.searchQuery = product.title;
    
    return item;
  }

  hideSuggestions(container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `main-search-message main-search-message--${type}`;
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

  formatMoney(cents) {
    return (cents / 100).toFixed(2);
  }
}

// Initialize main search when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MainSearch();
  });
} else {
  new MainSearch();
} 