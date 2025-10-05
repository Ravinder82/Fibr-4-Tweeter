(function() {
  const Twitter = {
    generateSocialContent: async function(platform) {
      if (!this.pageContent || !this.apiKey) {
        if (this.showToast) {
          this.showToast('❌ Please set up your Gemini API key first and ensure page content is loaded.', 3000);
        } else {
          alert('❌ Please set up your Gemini API key first and ensure page content is loaded.');
        }
        return;
      }

      this.setLoading(true, `Generating ${platform} content...`);
      console.log(`TabTalk AI: Generating ${platform} content for page: ${this.currentTab?.title}`);
      console.log(`Page content length: ${this.pageContent.length} characters`);

      try {
        let systemPrompt = '';
        let userPrompt = '';
        let emoji = '';

        if (platform === 'twitter') {
          emoji = '🐦';
          systemPrompt = `You are a charismatic Twitter/X storyteller who writes content that stops people mid-scroll. Your posts are vibrant, human, and overflowing with personality. You write like you're sharing exciting news with a close friend - with genuine enthusiasm, natural emotion, and irresistible energy. Every word should spark curiosity and delight. Write in plain text only - no hashtags, no URLs, no formatting symbols. Just pure, engaging human expression with strategic emojis.`;
          userPrompt = `Transform this webpage content into an electrifying Twitter/X post that feels authentically human.

YOUR WRITING STYLE:
✓ Write with GENUINE excitement and energy
✓ Use natural line breaks to create rhythm and pacing
✓ Sprinkle 2-4 emojis throughout to amplify emotion
✓ Start with a scroll-stopping hook that sparks curiosity
✓ Use conversational language (contractions, casual tone)
✓ Add personality - be bold, enthusiastic, delightfully human
✓ Include punchy short sentences mixed with flowing longer ones
✓ Make every word count - no fluff, pure value
✓ Create visual breathing room with smart line breaks
✓ End with intrigue or a thought-provoking insight

STRUCTURE:
[Attention-grabbing hook]

[Core insight with excitement]

[Supporting detail or surprising angle]

[Memorable closer]

KEEP IT CLEAN:
✗ No hashtags or # symbols
✗ No bold/italic markdown
✗ No URLs
✗ No meta-commentary

CONTENT TO TRANSFORM:
${this.pageContent}

Write your captivating post now:`;
        } else if (platform === 'thread') {
          emoji = '🧵';
          systemPrompt = `You are a masterful Twitter/X thread storyteller. You craft thread narratives that hook readers from tweet 1 and keep them glued until the final tweet. Each tweet pulses with energy, personality, and human warmth. You break down complex ideas into bite-sized revelations that feel like having an engaging conversation with a brilliant friend. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols. Just pure storytelling magic.`;
          userPrompt = `Create a magnetic Twitter thread (3-8 tweets) from this content.

CRITICAL FORMAT REQUIREMENT:
Start each tweet with: 1/n: 2/n: 3/n: etc.

THREAD STRUCTURE:
Tweet 1: Explosive hook - Stop the scroll immediately
Tweet 2: Setup - Introduce core concept
Middle Tweets: Value bombs - One powerful insight per tweet
Final Tweet: Unforgettable closer - Leave them thinking

YOUR STYLE:
- Enthusiastic and genuinely excited
- Human and conversational (use contractions)
- Bold and confident
- Include 1-2 emojis per tweet naturally
- Use line breaks for visual flow

KEEP IT CLEAN:
- No hashtags
- No formatting symbols
- No URLs

CONTENT:
${this.pageContent}

OUTPUT EXAMPLE:
1/5:
[Hook content]

2/5:
[Setup content]

3/5:
[Value content]

Generate your thread now:`;
        } else {
          if (this.showToast) {
            this.showToast('❌ Only Twitter/X Post and Twitter Thread are supported.', 3000);
          } else {
            alert('❌ Only Twitter/X Post and Twitter Thread are supported.');
          }
          return;
        }

        // Show progress bar instead of user message
        this.showProgressBar(`Generating ${platform === 'twitter' ? 'Post' : 'Thread'}...`);

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
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          platform: platform,
          hasApiKey: !!this.apiKey,
          hasPageContent: !!this.pageContent,
          pageContentLength: this.pageContent?.length
        });
        if (this.showToast) {
          this.showToast(`❌ Error: ${error.message}. Please check your API key and try again.`, 4000);
        } else {
          alert(`❌ Error generating social media content: ${error.message}. Please check your API key and try again.`);
        }
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
      // Directly render Twitter content (no chat history needed)
      this.renderTwitterContent(content, platform);
    },

    renderTwitterContent: function(content, platform) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container';
      if (platform === 'thread') {
        const tweets = this.parseTwitterThread(content);
        const threadId = `thread_${Date.now()}`;
        
        // AUTO-SAVE THREAD TO PERSISTENT STORAGE
        this.autoSaveThread(threadId, tweets, content);
        
        // Add thread header with Copy All button and Master Control
        const threadHeader = document.createElement('div');
        threadHeader.className = 'thread-header';
        const currentTotalChars = this.getTotalChars(tweets);
        threadHeader.innerHTML = `
          <div class="thread-info">
            <span class="thread-icon">🧵</span>
            <span class="thread-title">Thread Generated</span>
            <span class="thread-meta">${tweets.length} tweets • ${currentTotalChars} chars</span>
          </div>
          <div class="thread-actions">
            <button class="btn-copy-all-thread" data-thread-id="${threadId}" title="Copy all tweets">
              📋 Copy All
            </button>
            <span class="copy-all-status hidden">✓ All Copied!</span>
          </div>
        `;
        contentContainer.appendChild(threadHeader);
        
        // Add Master Thread Control
        const masterControl = document.createElement('div');
        masterControl.className = 'thread-master-control';
        masterControl.innerHTML = `
          <div class="master-control-header">
            <span class="control-label">Thread Length Control</span>
            <span class="control-hint">Adjust total thread length • Characters distributed proportionally</span>
          </div>
          <div class="master-control-slider">
            <div class="slider-presets">
              <button class="preset-btn" data-length="1000">Short (1K)</button>
              <button class="preset-btn" data-length="2500">Medium (2.5K)</button>
              <button class="preset-btn" data-length="5000">Long (5K)</button>
            </div>
            <div class="slider-container">
              <span class="slider-min">500</span>
              <input type="range" class="master-length-slider" min="500" max="5000" value="${currentTotalChars}" step="100" data-thread-id="${threadId}">
              <span class="slider-max">5000</span>
            </div>
            <div class="slider-value">
              <span class="current-length">${currentTotalChars}</span> characters total
            </div>
          </div>
          <div class="master-control-actions">
            <button class="btn-regenerate-thread" data-thread-id="${threadId}" title="Regenerate entire thread with new length">
              🔄 Regenerate Thread
            </button>
          </div>
        `;
        contentContainer.appendChild(masterControl);
        
        // Bind Copy All button
        const copyAllBtn = threadHeader.querySelector('.btn-copy-all-thread');
        const copyAllStatus = threadHeader.querySelector('.copy-all-status');
        copyAllBtn.addEventListener('click', async () => {
          await this.copyAllTweets(tweets, copyAllBtn, copyAllStatus);
        });
        
        // Bind Master Control events
        const masterSlider = masterControl.querySelector('.master-length-slider');
        const currentLengthSpan = masterControl.querySelector('.current-length');
        const regenerateThreadBtn = masterControl.querySelector('.btn-regenerate-thread');
        const presetBtns = masterControl.querySelectorAll('.preset-btn');
        
        // Update display when slider moves
        masterSlider.addEventListener('input', (e) => {
          currentLengthSpan.textContent = e.target.value;
        });
        
        // Preset buttons
        presetBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const length = btn.dataset.length;
            masterSlider.value = length;
            currentLengthSpan.textContent = length;
          });
        });
        
        // Regenerate thread with new length
        regenerateThreadBtn.addEventListener('click', async () => {
          const targetLength = parseInt(masterSlider.value);
          await this.regenerateEntireThread(contentContainer, threadId, targetLength, content);
        });
        
        tweets.forEach((tweet, index) => {
          const cardTitle = `Thread ${index + 1}/${tweets.length}`;
          // DISABLED: Universal cards system - using legacy system for stability
          const card = this.createTwitterCard(tweet, cardTitle, true); // true = isThreadCard
          card.dataset.platform = platform;
          card.dataset.threadId = threadId;
          contentContainer.appendChild(card);
        });
      } else {
        // DISABLED: Universal cards system - using legacy system for stability
        const card = this.createTwitterCard(content, 'Post');
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
      
      // Enhanced parsing: Split by numbered tweet pattern
      const tweets = [];
      const lines = processedContent.split('\n');
      let currentTweet = '';
      let currentNumber = null;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check if line starts with tweet number (1/5:, 2/5:, etc.)
        const numberMatch = trimmedLine.match(/^(\d+)\/(\d+)[\s:]*(.*)$/);
        
        if (numberMatch) {
          // Save previous tweet if exists
          if (currentTweet.trim()) {
            tweets.push(currentTweet.trim());
          }
          
          // Start new tweet
          currentNumber = numberMatch[1];
          currentTweet = numberMatch[3] || ''; // Content after the number
        } else if (currentNumber !== null && trimmedLine) {
          // Continue current tweet
          currentTweet += (currentTweet ? '\n' : '') + trimmedLine;
        }
      }
      
      // Add last tweet
      if (currentTweet.trim()) {
        tweets.push(currentTweet.trim());
      }
      
      // Fallback: if no tweets parsed, return entire content as single tweet
      if (tweets.length === 0) {
        console.warn('Thread parsing failed, returning full content as single tweet');
        return [processedContent || content];
      }
      
      console.log(`✅ Parsed ${tweets.length} tweets from thread`);
      return tweets;
    },

    createTwitterCard: function(tweetContent, cardTitle, isThreadCard = false) {
      const card = document.createElement('div');
      card.className = 'twitter-card';
      
      // For thread cards, show only character count (no tone, no length slider)
      const controlsHTML = isThreadCard ? `
        <div class="twitter-controls">
          <div class="twitter-char-count">${this.getAccurateCharacterCount(tweetContent)} characters</div>
        </div>
      ` : `
        <div class="twitter-controls">
          <div class="twitter-tone-control">
            <label class="tone-label" for="tone-select">Tone:</label>
            <select id="tone-select" class="tone-select" aria-label="Tone">
              <option value="supportive">Supportive with facts</option>
              <option value="critical">Critical with facts</option>
            </select>
          </div>
          <div class="twitter-length-control">
            <label class="length-label">Target Length:</label>
            <input type="range" class="length-slider" min="50" max="2000" value="${Math.max(50, this.getAccurateCharacterCount(tweetContent))}" step="50">
            <span class="length-display">${Math.max(50, this.getAccurateCharacterCount(tweetContent))}</span>
            <button class="regenerate-btn" title="Regenerate with new length">🔄</button>
          </div>
          <div class="twitter-char-count">${this.getAccurateCharacterCount(tweetContent)} characters</div>
        </div>
      `;
      
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
          ${controlsHTML}
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
      
      // Only bind length slider and regenerate for non-thread cards
      if (!isThreadCard) {
        const lengthSlider = card.querySelector('.length-slider');
        const lengthDisplay = card.querySelector('.length-display');
        const regenerateBtn = card.querySelector('.regenerate-btn');
        const toneSelect = card.querySelector('.tone-select');
        
        if (lengthSlider && lengthDisplay) {
          lengthSlider.addEventListener('input', () => {
            lengthDisplay.textContent = lengthSlider.value;
          });
        }
        
        card.dataset.originalContent = this.pageContent;
        card.dataset.platform = cardTitle.includes('Thread') ? 'thread' : 'twitter';
        
        if (regenerateBtn) {
          regenerateBtn.addEventListener('click', async () => {
            const targetLength = parseInt(lengthSlider.value);
            const platform = card.dataset.platform;
            const tone = toneSelect ? toneSelect.value : 'supportive';
            await this.regenerateWithLength(card, targetLength, platform, { tone });
          });
        }
      }
      
      return card;
    },

    cleanTwitterContent: function(content) {
      if (!content) return content;
      let cleaned = content;
      
      // CRITICAL: Remove AI meta-commentary and warnings about formatting
      // These patterns catch when AI responds about the rules instead of following them
      cleaned = cleaned.replace(/^.*?Unacceptable.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?critical failure.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?forbidden.*?formatting.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?breaks the instructions.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?--[•\-]\s*Original Response:.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?You have used.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?This output is unusable.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?Here's your.*?content:.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?OUTPUT:.*?\n/gim, '');
      
      // Remove hashtags
      cleaned = cleaned.replace(/#\w+/g, '');
      cleaned = cleaned.replace(/#/g, '');
      
      // Remove markdown bold/italic
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
      cleaned = cleaned.replace(/_{2,}([^_]+)_{2,}/g, '$1');
      cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
      cleaned = cleaned.replace(/\*{2,}/g, '');
      cleaned = cleaned.replace(/_{2,}/g, '');
      
      // Remove line break placeholders
      cleaned = cleaned.replace(/\(line break\)/gi, '\n');
      cleaned = cleaned.replace(/\[line break\]/gi, '\n');
      
      // Convert markdown lists to bullet points
      cleaned = cleaned.replace(/^[-*]\s+/gm, '• ');
      
      // Strip URLs completely (critical for Twitter shadowban prevention)
      cleaned = cleaned.replace(/https?:\/\/\S+/gi, '');
      cleaned = cleaned.replace(/\((https?:\/\/[^)]+)\)/gi, '');
      cleaned = cleaned.replace(/www\.\S+/gi, '');
      
      // Remove markdown-style links [text](url)
      cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      // Remove any remaining square brackets
      cleaned = cleaned.replace(/\[([^\]]+)\]/g, '$1');
      
      // Remove meta-commentary parentheses like (emphasis), (bold), etc.
      cleaned = cleaned.replace(/\(emphasis\)/gi, '');
      cleaned = cleaned.replace(/\(bold\)/gi, '');
      cleaned = cleaned.replace(/\(italic\)/gi, '');
      
      // Normalize whitespace
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
      cleaned = cleaned.replace(/(^|\n)\s*$/g, '');
      
      // Final trim
      cleaned = cleaned.trim();
      
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

    regenerateWithLength: async function(card, targetLength, platform, opts) {
      const textArea = card.querySelector('.twitter-text');
      const regenerateBtn = card.querySelector('.regenerate-btn');
      const originalContent = card.dataset.originalContent;
      regenerateBtn.textContent = '⏳';
      regenerateBtn.disabled = true;
      try {
        let systemPrompt = '';
        let userPrompt = '';
        const tone = (opts && opts.tone) || 'supportive';
        const buildToneDelta = (t) => {
          if (t === 'critical') {
            return (
              'TONE RULES (Critical with Facts):\n' +
              '- You may use your internal general knowledge where appropriate.\n' +
              '- Identify 1–2 weaknesses, gaps, or contradictions grounded in the provided content.\n' +
              '- Keep professional, evidence-based wording. No ad hominem.\n' +
              '- If evidence is limited, hedge (e.g., "may", "appears").\n' +
              'Preserve ALL formatting constraints above. Do NOT include links or hashtags.'
            );
          }
          // default supportive
          return (
            'TONE RULES (Supportive with Facts):\n' +
            '- You may use your internal general knowledge where appropriate.\n' +
            '- Highlight 1–2 verifiable points that support the content.\n' +
            '- Keep professional, concise, and evidence-based.\n' +
            'Preserve ALL formatting constraints above. Do NOT include links or hashtags.'
          );
        };
        if (platform === 'twitter') {
          systemPrompt = `You are a charismatic Twitter/X storyteller creating ${targetLength}-character posts that radiate personality and human warmth. Every word sparkles with energy and genuine enthusiasm. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols. Make people stop scrolling and feel something real.`;
          userPrompt = `Recreate this as an electrifying ${targetLength}-character Twitter post that feels delightfully human.

YOUR APPROACH:
✓ Target: ${targetLength} characters (±10 acceptable)
✓ Write with GENUINE excitement and energy
✓ Use natural line breaks for rhythm
✓ Include 2-4 emojis strategically placed
✓ Start with a scroll-stopping hook
✓ Add punchy, conversational language
✓ Mix short zingers with flowing sentences
✓ ${tone === 'critical' ? 'Challenge with bold, evidence-based critique' : 'Amplify with enthusiastic support and facts'}
✓ End with impact or intrigue

KEEP IT CLEAN:
✗ No hashtags
✗ No formatting symbols
✗ No URLs
✗ No meta-commentary

ORIGINAL CONTENT:
${originalContent}

Transform it now:`;
        } else if (platform === 'thread') {
          const tweetsNeeded = Math.ceil(targetLength / 400);
          systemPrompt = `You are a masterful Twitter/X thread storyteller crafting ${tweetsNeeded} tweets (${targetLength} total characters) that captivate from start to finish. Each tweet vibrates with personality, energy, and human warmth. You turn complex ideas into addictive narratives. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`;
          userPrompt = `Recreate this as a magnetic ${tweetsNeeded}-tweet thread (around ${targetLength} characters total).

YOUR STORYTELLING APPROACH:
✓ Create ${tweetsNeeded} numbered tweets (1/${tweetsNeeded}, 2/${tweetsNeeded}, etc.)
✓ Total: approximately ${targetLength} characters
✓ Write with genuine enthusiasm and energy
✓ Use line breaks for visual breathing room
✓ Include 1-2 emojis per tweet naturally
✓ Each tweet delivers a powerful insight
✓ Build narrative momentum throughout
✓ Mix punchy short lines with flowing explanations
✓ ${tone === 'critical' ? 'Challenge boldly with evidence-based critique' : 'Support enthusiastically with compelling facts'}
✓ End with an unforgettable closer

KEEP IT CLEAN:
✗ No hashtags
✗ No formatting symbols
✗ No URLs
✗ No explanations about format

ORIGINAL CONTENT:
${originalContent}

Craft your thread now:`;
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
    },
    
    // AUTO-SAVE THREAD TO PERSISTENT STORAGE
    autoSaveThread: async function(threadId, tweets, rawContent) {
      if (!window.TabTalkStorage || !window.TabTalkStorage.saveThread) {
        console.warn('Storage module not available for thread persistence');
        return;
      }
      
      try {
        // DELETE OLD AUTO-SAVED THREADS (keep only latest)
        const allThreads = await window.TabTalkStorage.getAllThreads();
        const autoSavedThreads = Object.values(allThreads).filter(t => t.isAutoSaved);
        
        // Delete all previous auto-saved threads
        for (const oldThread of autoSavedThreads) {
          await window.TabTalkStorage.deleteThread(oldThread.id);
          console.log('🗑️ Deleted old auto-saved thread:', oldThread.id);
        }
        
        const threadData = {
          id: threadId,
          title: this.currentTab?.title || 'Untitled Thread',
          url: this.currentTab?.url || '',
          domain: this.currentDomain || '',
          platform: 'thread',
          isAutoSaved: true, // Mark as auto-saved
          tweets: tweets.map((tweet, index) => ({
            id: `tweet_${index + 1}`,
            number: `${index + 1}/${tweets.length}`,
            content: tweet,
            charCount: this.getAccurateCharacterCount(tweet)
          })),
          rawContent: rawContent,
          totalTweets: tweets.length,
          totalChars: this.getTotalChars(tweets),
          createdAt: Date.now()
        };
        
        await window.TabTalkStorage.saveThread(threadData);
        console.log('✅ Thread auto-saved persistently:', threadId);
        
        // Show subtle notification
        this.showAutoSaveNotification();
      } catch (error) {
        console.error('Error auto-saving thread:', error);
      }
    },
    
    // COPY ALL TWEETS FUNCTIONALITY
    copyAllTweets: async function(tweets, button, statusElement) {
      try {
        // Join all tweets with double line breaks for easy pasting
        const allTweetsText = tweets.map((tweet, index) => {
          return `${index + 1}/${tweets.length}:\n${tweet}`;
        }).join('\n\n---\n\n');
        
        await navigator.clipboard.writeText(allTweetsText);
        
        // Update UI
        button.classList.add('hidden');
        statusElement.classList.remove('hidden');
        
        // Reset after 3 seconds
        setTimeout(() => {
          button.classList.remove('hidden');
          statusElement.classList.add('hidden');
        }, 3000);
        
        console.log('✅ All tweets copied to clipboard');
      } catch (error) {
        console.error('Error copying all tweets:', error);
        alert('Failed to copy tweets. Please try again.');
      }
    },
    
    // GET TOTAL CHARACTER COUNT FOR THREAD
    getTotalChars: function(tweets) {
      return tweets.reduce((total, tweet) => {
        return total + this.getAccurateCharacterCount(tweet);
      }, 0);
    },
    
    // SHOW AUTO-SAVE NOTIFICATION
    showAutoSaveNotification: function() {
      const notification = document.createElement('div');
      notification.className = 'auto-save-notification';
      notification.innerHTML = '💾 Thread auto-saved';
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInUp 0.3s ease;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }, 2000);
    },
    
    // REGENERATE ENTIRE THREAD WITH NEW LENGTH
    regenerateEntireThread: async function(container, threadId, targetLength, originalContent) {
      const regenerateBtn = container.querySelector('.btn-regenerate-thread');
      if (!regenerateBtn) return;
      
      const originalText = regenerateBtn.textContent;
      regenerateBtn.textContent = '⏳ Regenerating...';
      regenerateBtn.disabled = true;
      
      try {
        // Calculate desired tweet count based on length
        const tweetsNeeded = Math.max(3, Math.min(8, Math.ceil(targetLength / 500)));
        
        const systemPrompt = `You are a masterful Twitter/X thread storyteller crafting ${tweetsNeeded} tweets (${targetLength} total characters) that captivate from start to finish. Each tweet vibrates with personality, energy, and human warmth. You turn complex ideas into addictive narratives. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`;
        
        const userPrompt = `Create a magnetic Twitter thread with EXACTLY ${tweetsNeeded} tweets totaling approximately ${targetLength} characters.

CRITICAL FORMAT REQUIREMENT:
You MUST start each tweet with its number in this EXACT format:
1/${tweetsNeeded}:
2/${tweetsNeeded}:
3/${tweetsNeeded}:
etc.

THREAD STRUCTURE:
- Tweet 1: Explosive hook (15% of total = ${Math.floor(targetLength * 0.15)} chars)
- Tweets 2-${tweetsNeeded-1}: Value bombs (60% of total = ${Math.floor(targetLength * 0.60 / (tweetsNeeded - 2))} chars each)
- Tweet ${tweetsNeeded}: Unforgettable closer (25% of total = ${Math.floor(targetLength * 0.25)} chars)

YOUR TONE:
✓ Enthusiastic and genuinely excited
✓ Human and conversational
✓ Bold and confident
✓ Delightfully engaging
✓ Strategic line breaks for visual flow

KEEP IT CLEAN:
✗ No hashtags
✗ No formatting symbols
✗ No URLs
✗ No explanations about format

CONTENT:
${this.pageContent || originalContent}

OUTPUT FORMAT EXAMPLE:
1/${tweetsNeeded}:
[Your explosive hook here]

2/${tweetsNeeded}:
[Your value bomb here]

Craft your ${targetLength}-character thread now:`;
        
        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          const cleanedResponse = this.cleanTwitterContent(response);
          const newTweets = this.parseTwitterThread(cleanedResponse);
          
          // Remove old tweet cards
          const oldCards = container.querySelectorAll('.twitter-card');
          oldCards.forEach(card => card.remove());
          
          // Add new tweet cards
          newTweets.forEach((tweet, index) => {
            const cardTitle = `Thread ${index + 1}/${newTweets.length}`;
            const card = this.createTwitterCard(tweet, cardTitle, true);
            card.dataset.platform = 'thread';
            card.dataset.threadId = threadId;
            container.appendChild(card);
          });
          
          // Update header meta
          const metaSpan = container.querySelector('.thread-meta');
          if (metaSpan) {
            metaSpan.textContent = `${newTweets.length} tweets • ${this.getTotalChars(newTweets)} chars`;
          }
          
          // Update current length display
          const currentLengthSpan = container.querySelector('.current-length');
          if (currentLengthSpan) {
            currentLengthSpan.textContent = this.getTotalChars(newTweets);
          }
          
          // Update slider value
          const masterSlider = container.querySelector('.master-length-slider');
          if (masterSlider) {
            masterSlider.value = this.getTotalChars(newTweets);
          }
          
          // Auto-save updated thread
          await this.autoSaveThread(threadId, newTweets, cleanedResponse);
          
          console.log('✅ Thread regenerated successfully');
        }
        
      } catch (error) {
        console.error('Error regenerating thread:', error);
        alert('Failed to regenerate thread. Please try again.');
      } finally {
        regenerateBtn.textContent = originalText;
        regenerateBtn.disabled = false;
      }
    }
  };

  window.TabTalkTwitter = Twitter;
})();
