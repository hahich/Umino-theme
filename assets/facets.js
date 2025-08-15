// Facets functionality
class Facets {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Facet filter changes
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-facet-filter]')) {
        this.handleFacetChange(event);
      }
    });

    // Facet clear buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-facet-clear]')) {
        this.handleFacetClear(event);
      }
    });
  }

  handleFacetChange(event) {
    const filter = event.target;
    const value = filter.value;
    const type = filter.dataset.facetType;
    
    if (!value || !type) return;
    
    this.updateFacetFilter(type, value);
  }

  handleFacetClear(event) {
    event.preventDefault();
    const button = event.target;
    const type = button.dataset.facetType;
    
    if (!type) return;
    
    this.clearFacetFilter(type);
  }

  updateFacetFilter(type, value) {
    const url = new URL(window.location);
    const params = url.searchParams;
    
    // Update or add the facet parameter
    params.set(type, value);
    
    // Navigate to the new URL
    window.location.href = url.toString();
  }

  clearFacetFilter(type) {
    const url = new URL(window.location);
    const params = url.searchParams;
    
    // Remove the facet parameter
    params.delete(type);
    
    // Navigate to the new URL
    window.location.href = url.toString();
  }

  getActiveFacets() {
    const url = new URL(window.location);
    const params = url.searchParams;
    const activeFacets = {};
    
    for (const [key, value] of params.entries()) {
      if (key.startsWith('filter.')) {
        activeFacets[key] = value;
      }
    }
    
    return activeFacets;
  }

  updateFacetCounts(counts) {
    // Update facet count displays
    Object.entries(counts).forEach(([facet, count]) => {
      const countElements = document.querySelectorAll(`[data-facet-count="${facet}"]`);
      countElements.forEach(element => {
        element.textContent = count;
      });
    });
  }
}

// Initialize facets when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Facets();
  });
} else {
  new Facets();
} 