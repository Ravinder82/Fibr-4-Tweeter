(function() {
  const PrivacyPolicy = {
    render(container) {
      container.innerHTML = '';

      const header = document.createElement('header');
      header.className = 'privacy-header glass-card';
      header.innerHTML = `
        <button class="button-secondary back-btn" id="privacy-back" aria-label="Back to home">
          ← Back
        </button>
        <div class="privacy-heading">
          <span class="privacy-icon">🔒</span>
          <div>
            <h2>Privacy & Security Policy</h2>
            <p class="policy-subtitle">Transparent practices to keep your data safe</p>
          </div>
        </div>
      `;
      container.appendChild(header);

      const sections = [
        {
          title: 'Effective Date',
          content: '<p>October 31, 2025</p>'
        },
        {
          title: 'Introduction',
          content: `<p>Fibr ("we," "us," or "our") is committed to protecting your privacy. This Privacy and Security Policy explains how Fibr collects, uses, and safeguards your information when you use our Chrome extension.</p>`
        },
        {
          title: 'Information We Collect',
          highlights: [
            '<strong>API Key:</strong> Your Google Gemini API key is stored securely in chrome.storage.local and never transmitted to our servers.',
            '<strong>No Personal Data:</strong> Fibr does not collect personal information, browsing history, or webpage content beyond what you select for AI processing.'
          ]
        },
        {
          title: 'How We Use Information',
          highlights: [
            'Your API key only authenticates requests sent directly from your browser to Google\'s Gemini API.',
            'All AI processing happens on Google servers. Fibr does not proxy or monitor these requests.',
            'Generated outputs are saved locally in your browser to power the gallery and history experiences.'
          ]
        },
        {
          title: 'Information Sharing',
          highlights: [
            'Fibr never shares, sells, or discloses your data to third parties.',
            'API traffic flows directly from your device to Google Gemini.',
            'We do not run analytics scripts or external trackers inside the extension.'
          ]
        },
        {
          title: 'Data Security',
          highlights: [
            'API keys remain in Chrome\'s secure storage with built-in encryption.',
            'All requests use HTTPS to protect data in transit.',
            'Processing is client-side wherever possible; only AI generation relies on Gemini.'
          ]
        },
        {
          title: 'User Rights & Controls',
          highlights: [
            'Remove your API key and saved content anytime from the extension or Chrome settings.',
            'Choose which webpages to analyze—nothing is sent without your action.',
            'Reach out to our support team anytime at grow.with.fibr@gmail.com for privacy questions.'
          ]
        },
        {
          title: 'Chrome Extension Permissions',
          content: `
            <ul>
              <li><code>activeTab</code> – Reads the current tab only when you trigger a generation.</li>
              <li><code>storage</code> – Saves your API key and generated posts locally.</li>
              <li><code>scripting</code> – Injects lightweight content extraction scripts when needed.</li>
            </ul>
            <p class="policy-footnote">We request the minimum permissions required for core functionality.</p>
          `
        },
        {
          title: 'Policy Updates',
          content: '<p>We may update this policy to reflect product improvements or regulatory changes. Major updates will be highlighted inside the extension and repository changelog.</p>'
        },
        {
          title: 'Contact Us',
          content: '<p>Need help or want to share feedback? Email us directly at <a href="mailto:grow.with.fibr@gmail.com">grow.with.fibr@gmail.com</a>.</p>'
        }
      ];

      const timeline = document.createElement('section');
      timeline.className = 'privacy-content';

      sections.forEach(section => {
        const card = document.createElement('article');
        card.className = 'privacy-card glass-card';

        const heading = document.createElement('h3');
        heading.textContent = section.title;
        card.appendChild(heading);

        if (section.highlights) {
          const list = document.createElement('ul');
          list.className = 'privacy-list';
          section.highlights.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = item;
            list.appendChild(li);
          });
          card.appendChild(list);
        }

        if (section.content) {
          const body = document.createElement('div');
          body.className = 'privacy-body';
          body.innerHTML = section.content;
          card.appendChild(body);
        }

        timeline.appendChild(card);
      });

      container.appendChild(timeline);

      this.bindEvents(container);
    },
    
    bindEvents(container) {
      const backBtn = container.querySelector('#privacy-back');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.FibrNavigation && window.FibrNavigation.showView) {
            window.FibrNavigation.showView('chat');
          }
        });
      }
    }
  };
  
  window.FibrPrivacyPolicy = PrivacyPolicy;
  window.TabTalkPrivacyPolicy = PrivacyPolicy; // Backward compatibility alias
})();
