(function() {
  const Twitter = {
    generateSocialContent: async function(platform) {
      if (!this.pageContent || !this.apiKey) {
        this.addMessage('assistant', '❌ Please set up your Gemini API key first and ensure page content is loaded.');
        return;
      }

      this.setLoading(true, `Generating ${platform} content...`);
      console.log(`TabTalk AI: Generating ${platform} content for page: ${this.currentTab?.title}`);

      try {
        let systemPrompt = '';
        let userPrompt = '';
        let emoji = '';

        if (platform === 'twitter') {
          emoji = '🐦';
          systemPrompt = `You are a Twitter/X Premium content creation expert. Create clean, professional, copy-paste ready tweets. Focus on structured content with proper formatting. ABSOLUTELY NEVER include hashtags, asterisks for emphasis, or formatting noise. Output should be immediately usable on Twitter.`;
          userPrompt = `Create a clean, professional Twitter/X post from this content:

STRICT FORMATTING REQUIREMENTS:
- NO hashtags, NO # symbols anywhere - this will destroy the account
- NO asterisks (*) for emphasis - use natural language instead
- NO "(line break)" text - use actual line breaks
- NO markdown formatting or special characters
- Use clean paragraph structure with proper spacing
- Include relevant emojis naturally in the text
- Use bullet points (•) or numbers for lists if needed
- Keep it conversational and engaging
- Make it immediately copy-paste ready for Twitter

CONTENT STRUCTURE:
- Start with an engaging hook
- Use natural line breaks for readability  
- Include 1-2 relevant emojis per paragraph
- End with a compelling call-to-action
- Focus on value and insights

CONTENT TO TRANSFORM:
${this.pageContent}

OUTPUT: Clean, professional tweet ready to copy-paste to Twitter (no hashtags, no formatting noise).`;
        } else if (platform === 'thread') {
          emoji = '🧵';
          systemPrompt = `You are a Twitter Premium thread specialist. Create clean, professional, copy-paste ready thread content. Focus on structured, valuable content with proper formatting. ABSOLUTELY NEVER include hashtags, asterisks for emphasis, or formatting noise. Each tweet should be immediately usable on Twitter.`;
          userPrompt = `Create a clean, professional Twitter thread from this content:

STRICT FORMATTING REQUIREMENTS:
- Create 3-8 tweets numbered (1/n, 2/n, etc.)
- NO hashtags, NO # symbols anywhere - this will destroy the account
- NO asterisks (*) for emphasis - use natural language instead
- NO "(line break)" text - use actual line breaks
- NO markdown formatting or special characters
- Use clean paragraph structure with proper spacing
- Include relevant emojis naturally in the text
- Use bullet points (•) or numbers for lists if needed
- Make each tweet immediately copy-paste ready for Twitter

THREAD STRUCTURE:
- 1/n: Engaging hook with natural formatting
- 2/n-n/n: Value-packed content with proper spacing
- Final tweet: Strong call-to-action
- Use natural line breaks between ideas
- Include 1-2 relevant emojis per tweet

CONTENT TO TRANSFORM:
${this.pageContent}

OUTPUT FORMAT:
1/n: [Clean hook content]
2/n: [Clean insight content]  
3/n: [Clean analysis content]
...
n/n: [Clean conclusion with CTA]`;
        } else {
          this.addMessage('assistant', '❌ Only Twitter/X Post and Twitter Thread are supported.');
          return;
        }

        // Show progress bar instead of user message
        this.showProgressBar(`Generating ${platform === 'twitter' ? 'Twitter/X Post' : 'Twitter Thread'}...`);

        // Use the existing callGeminiAPIWithSystemPrompt method
        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          console.log(`TabTalk AI: Successfully generated ${platform} content, response length: ${response.length} characters`);
          const cleanedResponse = this.cleanTwitterContent(response);
          this.addTwitterMessage('assistant', cleanedResponse, platform);
          // Save a history record for future History page
          if (this.addToHistory) {
            const record = {
              timestamp: new Date().toISOString(),
              url: this.currentTab?.url || '',
              title: this.currentTab?.title || '',
              domain: this.currentDomain || '',
              content: cleanedResponse,
              type: platform
            };
            await this.addToHistory(platform, record);
          }
          await this.saveState();
        } else {
          throw new Error('Empty response received from Gemini API');
        }

      } catch (error) {
        console.error('Error generating social content:', error);
        this.addMessage('assistant', '❌ Error generating social media content. Please check your API key and try again.');
      } finally {
        this.setLoading(false);
        this.hideProgressBar();
      }
    },

    showProgressBar: function(message) {
      // Remove any existing progress bar
      this.hideProgressBar();
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      progressContainer.id = 'twitter-progress';
      progressContainer.innerHTML = `
        <div class="progress-message">${message}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      `;
      this.messagesContainer.appendChild(progressContainer);
      this.messagesContainer.scrollTo({
        top: this.messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
      setTimeout(() => {
        const fill = progressContainer.querySelector('.progress-fill');
        if (fill) fill.style.width = '100%';
      }, 100);
    },

    hideProgressBar: function() {
      const existingProgress = document.getElementById('twitter-progress');
      if (existingProgress) existingProgress.remove();
    },

    addTwitterMessage: function(role, content, platform) {
      const timestamp = new Date().toISOString();
      this.chatHistory.push({ role, content, timestamp, platform });
      this.renderTwitterContent(content, platform);
    },

    renderTwitterContent: function(content, platform) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container';
      if (platform === 'thread') {
        const tweets = this.parseTwitterThread(content);
        tweets.forEach((tweet, index) => {
          const cardTitle = `Thread ${index + 1}/${tweets.length}`;
          // DISABLED: Universal cards system - using legacy system for stability
          const card = this.createTwitterCard(tweet, cardTitle);
          card.dataset.platform = platform;
          contentContainer.appendChild(card);
        });
      } else {
        // DISABLED: Universal cards system - using legacy system for stability
        const card = this.createTwitterCard(content, 'Twitter Post');
        card.dataset.platform = platform;
        contentContainer.appendChild(card);
      }
      this.messagesContainer.appendChild(contentContainer);
      setTimeout(() => {
        this.messagesContainer.scrollTo({
          top: this.messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    },

    parseTwitterThread: function(content) {
      const cleanedContent = this.cleanTwitterContent(content);
      let processedContent = cleanedContent.replace(/Here's your clean.*?content:\s*/gi, '').trim();
      const tweetPattern = /(\d+\/\d+[\s:]*)/g;
      const parts = processedContent.split(tweetPattern).filter(part => part.trim());
      const tweets = [];
      let currentTweet = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (part.match(/^\d+\/\d+[\s:]*$/)) {
          if (currentTweet.trim()) tweets.push(currentTweet.trim());
          currentTweet = '';
        } else {
          currentTweet += part + ' ';
        }
      }
      if (currentTweet.trim()) tweets.push(currentTweet.trim());
      if (tweets.length === 0) {
        const lines = processedContent.split('\n').filter(line => line.trim());
        let tempTweet = '';
        for (const line of lines) {
          if (line.match(/^\d+\/\d+/)) {
            if (tempTweet.trim()) tweets.push(tempTweet.trim());
            tempTweet = line.replace(/^\d+\/\d+[\s:]*/, '').trim();
          } else if (tempTweet) {
            tempTweet += '\n' + line;
          } else {
            tempTweet = line;
          }
        }
        if (tempTweet.trim()) tweets.push(tempTweet.trim());
      }
      return tweets.length > 0 ? tweets : [processedContent || content];
    },

    createTwitterCard: function(tweetContent, cardTitle) {
      const card = document.createElement('div');
      card.className = 'twitter-card';
      card.innerHTML = `
        <div class="twitter-card-header">
          <span class="twitter-card-title">${cardTitle}</span>
          <div class="twitter-header-actions">
            <button class="twitter-action-btn copy-btn" title="Copy tweet" aria-label="Copy tweet content">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="twitter-card-content">
          <textarea class="twitter-text" placeholder="Edit your tweet content...">${tweetContent}</textarea>
          <div class="twitter-controls">
            <div class="twitter-length-control">
              <label class="length-label">Target Length:</label>
              <input type="range" class="length-slider" min="50" max="2000" value="${Math.max(50, this.getAccurateCharacterCount(tweetContent))}" step="50">
              <span class="length-display">${Math.max(50, this.getAccurateCharacterCount(tweetContent))}</span>
              <button class="regenerate-btn" title="Regenerate with new length">🔄</button>
            </div>
            <div class="twitter-char-count">${this.getAccurateCharacterCount(tweetContent)} characters</div>
          </div>
        </div>
      `;
      
      // Add save button to Twitter card header actions container
      if (window.TabTalkUI && window.TabTalkUI.addSaveButtonToCard) {
        const contentData = {
          id: Date.now().toString(),
          content: tweetContent,
          title: cardTitle
        };
        const contentType = cardTitle.toLowerCase().includes('thread') ? 'thread' : 'twitter';
        const actionsContainer = card.querySelector('.twitter-header-actions');
        if (actionsContainer) {
          window.TabTalkUI.addSaveButtonToCard(actionsContainer, contentType, contentData);
        }
      }
      
      // Copy button functionality
      const copyBtn = card.querySelector('.copy-btn');
      const textArea = card.querySelector('.twitter-text');
      
      // Store original copy icon for reset
      const originalCopyIcon = copyBtn.innerHTML;
      
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(textArea.value);
          
          // Success state
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`;
          copyBtn.classList.add('success');
          
          // Reset after 2 seconds
          setTimeout(() => {
            copyBtn.innerHTML = originalCopyIcon;
            copyBtn.classList.remove('success');
          }, 2000);
          
        } catch (err) {
          console.error('Copy failed:', err);
          // Could add error state here if needed
        }
      });
      
      // Auto-resize textarea functionality
      const autoResizeTextarea = () => {
        textArea.style.height = 'auto';
        textArea.style.height = Math.max(80, textArea.scrollHeight) + 'px';
      };
      setTimeout(autoResizeTextarea, 0);
      textArea.addEventListener('input', () => {
        const charCount = card.querySelector('.twitter-char-count');
        const length = this.getAccurateCharacterCount(textArea.value);
        charCount.textContent = `${length} characters`;
        charCount.style.color = 'var(--text-secondary)';
        autoResizeTextarea();
      });
      const lengthSlider = card.querySelector('.length-slider');
      const lengthDisplay = card.querySelector('.length-display');
      const regenerateBtn = card.querySelector('.regenerate-btn');
      lengthSlider.addEventListener('input', () => {
        lengthDisplay.textContent = lengthSlider.value;
      });
      card.dataset.originalContent = this.pageContent;
      card.dataset.platform = cardTitle.includes('Thread') ? 'thread' : 'twitter';
      regenerateBtn.addEventListener('click', async () => {
        const targetLength = parseInt(lengthSlider.value);
        const platform = card.dataset.platform;
        await this.regenerateWithLength(card, targetLength, platform);
      });
      return card;
    },

    cleanTwitterContent: function(content) {
      if (!content) return content;
      let cleaned = content;
      cleaned = cleaned.replace(/#\w+/g, '');
      cleaned = cleaned.replace(/#/g, '');
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
      cleaned = cleaned.replace(/\(line break\)/gi, '\n');
      cleaned = cleaned.replace(/\[line break\]/gi, '\n');
      cleaned = cleaned.replace(/_{2,}([^_]+)_{2,}/g, '$1');
      cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
      cleaned = cleaned.replace(/\*{2,}/g, '');
      cleaned = cleaned.replace(/_{2,}/g, '');
      cleaned = cleaned.replace(/[-*]\s+/g, '• ');
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
      cleaned = cleaned.trim();
      cleaned = cleaned.replace(/\[([^\]]+)\]/g, '$1');
      cleaned = cleaned.replace(/\(([^)]+)\)/g, (match, p1) => {
        if (p1.includes('emphasis') || p1.includes('bold') || p1.includes('italic')) {
          return '';
        }
        return match;
      });
      return cleaned;
    },

    getAccurateCharacterCount: function(text) {
      if (!text) return 0;
      const trimmedText = text.trim();
      let count = 0;
      const characters = Array.from(trimmedText);
      for (const char of characters) {
        if (this.isEmojiOrSpecialChar(char)) count += 2; else count += 1;
      }
      return count;
    },

    isEmojiOrSpecialChar: function(char) {
      const codePoint = char.codePointAt(0);
      return (
        (codePoint >= 0x1F000 && codePoint <= 0x1F9FF) ||
        (codePoint >= 0x2600 && codePoint <= 0x26FF) ||
        (codePoint >= 0x2700 && codePoint <= 0x27BF) ||
        (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
        (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) ||
        (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) ||
        (codePoint >= 0x1F1E0 && codePoint <= 0x1F1FF) ||
        (codePoint >= 0x200D)
      );
    },

    regenerateWithLength: async function(card, targetLength, platform) {
      const textArea = card.querySelector('.twitter-text');
      const regenerateBtn = card.querySelector('.regenerate-btn');
      const originalContent = card.dataset.originalContent;
      regenerateBtn.textContent = '⏳';
      regenerateBtn.disabled = true;
      try {
        let systemPrompt = '';
        let userPrompt = '';
        if (platform === 'twitter') {
          systemPrompt = `You are a Twitter/X Premium content creation expert. Create engaging, viral-worthy tweets that drive maximum engagement. Focus on detailed storytelling and valuable insights. NEVER use hashtags in your output.`;
          userPrompt = `Create a Twitter/X post with EXACTLY ${targetLength} characters (±10 characters acceptable):

STRICT REQUIREMENTS:
- Target character count: ${targetLength} characters
- NO HASHTAGS ALLOWED - This rule cannot be broken
- Make it highly engaging and shareable
- Use conversational, compelling tone
- Include emoji strategically to enhance readability
- Add call-to-action if space allows
- Focus on delivering maximum value

CONTENT TO TRANSFORM:
${originalContent}

OUTPUT FORMAT: Tweet content exactly around ${targetLength} characters WITHOUT hashtags.`;
        } else if (platform === 'thread') {
          const tweetsNeeded = Math.ceil(targetLength / 400);
          systemPrompt = `You are a Twitter Premium thread specialist. Create compelling multi-tweet threads that tell detailed stories and provide valuable insights. NEVER use hashtags in your output.`;
          userPrompt = `Create a Twitter thread with approximately ${targetLength} total characters across ${tweetsNeeded} tweets:

STRICT REQUIREMENTS:
- Create ${tweetsNeeded} tweets numbered (1/n, 2/n, etc.)
- Total thread length: approximately ${targetLength} characters
- NO HASHTAGS ALLOWED anywhere in the thread
- Each tweet should be comprehensive and valuable
- Build compelling narrative throughout
- End with strong call-to-action

CONTENT TO TRANSFORM:
${originalContent}

OUTPUT FORMAT:
1/n: [Tweet content]
2/n: [Tweet content]
...
n/n: [Conclusion with CTA]`;
        }
        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        if (response) {
          const cleanedResponse = this.cleanTwitterContent(response);
          if (platform === 'thread') {
            const tweets = this.parseTwitterThread(cleanedResponse);
            const firstTweet = tweets[0] || cleanedResponse;
            textArea.value = firstTweet;
          } else {
            textArea.value = cleanedResponse;
          }
          const charCount = card.querySelector('.twitter-char-count');
          const accurateLength = this.getAccurateCharacterCount(textArea.value);
          charCount.textContent = `${accurateLength} characters`;
          setTimeout(() => {
            textArea.style.height = 'auto';
            textArea.style.height = Math.max(80, textArea.scrollHeight) + 'px';
          }, 0);
        }
      } catch (error) {
        console.error('Error regenerating content:', error);
        alert('Error regenerating content. Please try again.');
      } finally {
        regenerateBtn.textContent = '🔄';
        regenerateBtn.disabled = false;
      }
    }
  };

  window.TabTalkTwitter = Twitter;
})();
