(function() {
  const Navigation = {
    showView: function(viewName) {
      const views = document.querySelectorAll('.view');
      views.forEach(v => v.classList.add('hidden'));
      let targetId = `${viewName}-view`;
      if (viewName === 'chat') targetId = 'chat-view';
      if (viewName === 'settings') targetId = 'settings-view';
      if (viewName === 'welcome') targetId = 'welcome-view';
      if (viewName === 'api-setup') targetId = 'api-setup-view';
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.remove('hidden');
      } else {
        console.warn(`showView: target view not found for "${viewName}" (id "${targetId}")`);
      }
    },

    updateViewState: function(state, statusMessage = 'Loading...') {
      if (this.sidebar) {
        this.sidebar.classList.add('hidden');
        this.sidebar.style.display = 'none';
      }
      Object.values(this.views).forEach(view => view.classList.add('hidden'));
      if (this.views[state]) {
        this.views[state].classList.remove('hidden');
        if (state === 'chat' && this.messageInput) {
          this.messageInput.focus();
        } else if (state === 'settings' && this.apiKeyInput) {
          this.apiKeyInput.focus();
        }
      } else {
        console.error(`View "${state}" not found`);
      }
      if (state === 'status' && this.statusText) {
        this.statusText.textContent = statusMessage;
      }
      if (state === 'settings') {
        const onboardingInfo = document.querySelector('.onboarding-info');
        if (onboardingInfo) onboardingInfo.style.display = this.apiKey ? 'none' : 'block';
      }
      this.setAriaStatus(`Switched to ${state} view. ${statusMessage}`);
    }
  };
  window.TabTalkNavigation = Navigation;
})();
