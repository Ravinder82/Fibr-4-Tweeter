(function() {
  const Export = {
    handleExportChat: function() {
      const format = 'markdown'; // Default to markdown
      let content = '';
      const fileName = `tabtalk-chat-${new Date().toISOString().slice(0, 10)}.${format === 'markdown' ? 'md' : 'txt'}`;
      if (!this.pageTitle || !this.currentTab) {
        alert('Missing context to export chat.');
        return;
      }
      if (!Array.isArray(this.chatHistory)) {
        alert('No chat history to export.');
        return;
      }
      if (format === 'markdown') {
        content = `# TabTalk AI Chat - ${this.pageTitle.textContent}\n\n`;
        content += `URL: ${this.currentTab.url}\n`;
        content += `Date: ${new Date().toLocaleString()}\n\n`;
        this.chatHistory.forEach(msg => {
          if (msg.role === 'user') {
            content += `## ${this.userDisplayName || 'You'}\n\n${msg.content}\n\n`;
          } else {
            content += `## TabTalk AI\n\n${msg.content}\n\n`;
          }
        });
      } else {
        content = `TabTalk AI Chat - ${this.pageTitle.textContent}\n\n`;
        content += `URL: ${this.currentTab.url}\n`;
        content += `Date: ${new Date().toLocaleString()}\n\n`;
        this.chatHistory.forEach(msg => {
          if (msg.role === 'user') {
            content += `${this.userDisplayName || 'You'}: ${msg.content}\n\n`;
          } else {
            content += `TabTalk AI: ${msg.content}\n\n`;
          }
        });
      }
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

  };
  window.TabTalkExport = Export;
})();
