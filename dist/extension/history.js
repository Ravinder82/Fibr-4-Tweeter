/**
 * History Manager for TabTalk AI
 * Handles saving, loading, and displaying saved content
 */

class HistoryManager {
  constructor(storageManager) {
    this.storage = storageManager;
    this.currentCategory = 'all';
  }
  
  /**
   * Load history items by category
   * @param {string} category - Category to filter by, or 'all'
   * @returns {Promise<Array>} - Array of history items
   */
  async loadHistory(category = 'all') {
    const savedContent = await this.storage.getSavedContent();
    
    if (category === 'all') {
      // Flatten all categories with category labels
      return Object.entries(savedContent).flatMap(([cat, items]) => 
        items.map(item => ({ ...item, category: cat }))
      ).sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return savedContent[category] || [];
  }
  
  /**
   * Render history items to container
   * @param {HTMLElement} container - Container element
   * @param {Array} items - History items to render
   * @param {string} category - Current category
   */
  renderHistoryList(container, items, category) {
    if (items.length === 0) {
      container.innerHTML = `<div class="empty-history">
        <p>No saved content in ${category} category</p>
      </div>`;
      return;
    }
    
    const html = items.map(item => `
      <div class="history-item" data-id="${item.id}" data-category="${item.category || category}">
        <div class="history-content">${this.truncateContent(item.content)}</div>
        <div class="history-meta">
          <span class="category-badge">${item.category || category}</span>
          <span class="timestamp">${new Date(item.timestamp).toLocaleDateString()}</span>
        </div>
        <div class="history-actions">
          <button class="btn-view">View</button>
          <button class="btn-copy">Copy</button>
          <button class="btn-delete">Delete</button>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
  }
  
  /**
   * Truncate content for preview
   * @param {string} content - Content to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated content
   */
  truncateContent(content, maxLength = 150) {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }
}

// Export for module usage
if (typeof module !== 'undefined') {
  module.exports = { HistoryManager };
}

// Export to window object for browser usage
window.HistoryManager = HistoryManager;
