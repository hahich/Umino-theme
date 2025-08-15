// Quick order list functionality
class QuickOrderList {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Quick order list buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-quick-order-add]')) {
        this.handleQuickOrderAdd(event);
      }
      
      if (event.target.matches('[data-quick-order-remove]')) {
        this.handleQuickOrderRemove(event);
      }
      
      if (event.target.matches('[data-quick-order-clear]')) {
        this.handleQuickOrderClear(event);
      }
    });

    // Quantity changes in quick order list
    document.addEventListener('change', (event) => {
      if (event.target.matches('[data-quick-order-quantity]')) {
        this.handleQuantityChange(event);
      }
    });
  }

  handleQuickOrderAdd(event) {
    event.preventDefault();
    const button = event.target;
    const productId = button.dataset.productId;
    const variantId = button.dataset.variantId || productId;
    
    if (!productId) return;
    
    this.addToQuickOrderList(productId, variantId);
  }

  handleQuickOrderRemove(event) {
    event.preventDefault();
    const button = event.target;
    const itemId = button.dataset.itemId;
    
    if (!itemId) return;
    
    this.removeFromQuickOrderList(itemId);
  }

  handleQuickOrderClear(event) {
    event.preventDefault();
    this.clearQuickOrderList();
  }

  handleQuantityChange(event) {
    const input = event.target;
    const itemId = input.dataset.itemId;
    const quantity = parseInt(input.value);
    
    if (!itemId) return;
    
    this.updateQuickOrderQuantity(itemId, quantity);
  }

  addToQuickOrderList(productId, variantId) {
    const quickOrderList = this.getQuickOrderList();
    const existingItem = quickOrderList.find(item => item.variantId === variantId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      quickOrderList.push({
        productId: productId,
        variantId: variantId,
        quantity: 1
      });
    }
    
    this.saveQuickOrderList(quickOrderList);
    this.updateQuickOrderUI();
  }

  removeFromQuickOrderList(itemId) {
    const quickOrderList = this.getQuickOrderList();
    const updatedList = quickOrderList.filter(item => item.variantId !== itemId);
    
    this.saveQuickOrderList(updatedList);
    this.updateQuickOrderUI();
  }

  clearQuickOrderList() {
    this.saveQuickOrderList([]);
    this.updateQuickOrderUI();
  }

  updateQuickOrderQuantity(itemId, quantity) {
    const quickOrderList = this.getQuickOrderList();
    const item = quickOrderList.find(item => item.variantId === itemId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromQuickOrderList(itemId);
      } else {
        item.quantity = quantity;
        this.saveQuickOrderList(quickOrderList);
        this.updateQuickOrderUI();
      }
    }
  }

  getQuickOrderList() {
    const stored = localStorage.getItem('quickOrderList');
    return stored ? JSON.parse(stored) : [];
  }

  saveQuickOrderList(list) {
    localStorage.setItem('quickOrderList', JSON.stringify(list));
  }

  updateQuickOrderUI() {
    const quickOrderList = this.getQuickOrderList();
    const container = document.querySelector('[data-quick-order-container]');
    
    if (!container) return;
    
    // Update item count
    const itemCountElements = document.querySelectorAll('[data-quick-order-count]');
    const totalItems = quickOrderList.reduce((sum, item) => sum + item.quantity, 0);
    
    itemCountElements.forEach(element => {
      element.textContent = totalItems;
    });
    
    // Update list display
    const listElement = container.querySelector('[data-quick-order-items]');
    if (listElement) {
      this.renderQuickOrderItems(listElement, quickOrderList);
    }
  }

  renderQuickOrderItems(container, items) {
    container.innerHTML = '';
    
    if (items.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No items in quick order list';
      emptyMessage.style.cssText = `
        color: #666;
        font-style: italic;
        text-align: center;
        padding: 20px;
      `;
      container.appendChild(emptyMessage);
      return;
    }
    
    items.forEach(item => {
      const itemElement = this.createQuickOrderItem(item);
      container.appendChild(itemElement);
    });
  }

  createQuickOrderItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'quick-order-item';
    itemDiv.style.cssText = `
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
      flex: 1;
    `;
    
    const title = document.createElement('h4');
    title.textContent = `Product ${item.productId}`;
    title.style.cssText = `
      margin: 0 0 5px 0;
      font-size: 14px;
      font-weight: 600;
    `;
    
    const quantity = document.createElement('span');
    quantity.textContent = `Quantity: ${item.quantity}`;
    quantity.style.cssText = `
      color: #666;
      font-size: 12px;
    `;
    
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.dataset.quickOrderRemove = '';
    removeButton.dataset.itemId = item.variantId;
    removeButton.style.cssText = `
      background: #dc3545;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    
    infoDiv.appendChild(title);
    infoDiv.appendChild(quantity);
    itemDiv.appendChild(infoDiv);
    itemDiv.appendChild(removeButton);
    
    return itemDiv;
  }
}

// Initialize quick order list when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuickOrderList();
  });
} else {
  new QuickOrderList();
} 