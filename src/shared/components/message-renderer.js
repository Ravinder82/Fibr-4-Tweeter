// src/shared/components/message-renderer.js
// Shared message renderer for both extension and web app

export class MessageRenderer {
  constructor(markedInstance = null) {
    this.marked = markedInstance;
    if (this.marked) {
      this.marked.setOptions({ gfm: true, breaks: true, sanitize: true });
    }
  }

  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', message.role, 'visible');
    
    // Add content type specific class for styling
    if (message.contentType) {
      messageEl.classList.add(`${message.contentType}-message`);
    }
    
    const headerEl = document.createElement('div');
    headerEl.classList.add('message-header');
    
    const avatarEl = document.createElement('div');
    avatarEl.classList.add('avatar');
    
    // Set avatar based on message type and role
    if (message.role === 'user') {
      avatarEl.textContent = '👤';
    } else {
      switch (message.contentType) {
        case 'summary':
          avatarEl.textContent = '📝';
          break;
        case 'keypoints':
          avatarEl.textContent = '🔑';
          break;
        case 'analysis':
          avatarEl.textContent = '📊';
          break;
        case 'faq':
          avatarEl.textContent = '❓';
          break;
        case 'factcheck':
          avatarEl.textContent = '✅';
          break;
        case 'tweet':
          avatarEl.textContent = '🐦';
          break;
        default:
          avatarEl.textContent = '🤖';
      }
    }
    
    const timestampEl = document.createElement('div');
    timestampEl.classList.add('timestamp');
    const messageTime = message.timestamp || new Date().toISOString();
    timestampEl.textContent = new Date(messageTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Add components to header in correct order
    if (message.role === 'user') {
      headerEl.appendChild(timestampEl);
      headerEl.appendChild(avatarEl);
    } else {
      headerEl.appendChild(avatarEl);
      headerEl.appendChild(timestampEl);
    }
    
    const contentEl = document.createElement('div');
    contentEl.classList.add('content');
    
    // Render content with markdown if available
    if (this.marked && message.content) {
      contentEl.innerHTML = this.marked.parse(message.content);
    } else {
      contentEl.textContent = message.content || '';
    }
    
    // Add copy button for assistant messages
    if (message.role === 'assistant') {
      const copyButton = document.createElement('button');
      copyButton.classList.add('copy-button');
      copyButton.innerHTML = '📋';
      copyButton.title = 'Copy to clipboard';
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(message.content).then(() => {
          // Show feedback
          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = '✓';
          setTimeout(() => {
            copyButton.innerHTML = originalText;
          }, 2000);
        });
      });
      contentEl.appendChild(copyButton);
    }
    
    messageEl.appendChild(headerEl);
    messageEl.appendChild(contentEl);
    
    return messageEl;
  }

  formatSpecialContent(content, type) {
    // Handle special content formatting if needed
    return content;
  }
}