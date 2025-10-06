(function() {
  const ThreadGenerator = {
    knowledgePacks: {},
    modalInitialized: false,
    popupInstance: null,
    
    // Initialize modal
    init: function() {
      if (this.modalInitialized) return;
      this.createModalHTML();
      this.bindModalEvents();
      this.modalInitialized = true;
    },
    
    // Create modal HTML
    createModalHTML: function() {
      const modalHTML = `
        <div id="thread-generator-modal" class="tone-modal hidden" role="dialog" aria-labelledby="thread-gen-title" aria-modal="true">
          <div class="tone-modal-overlay"></div>
          <div class="tone-modal-content">
            <div class="tone-modal-header">
              <h2 id="thread-gen-title">Create Thread</h2>
              <button class="tone-modal-close" aria-label="Close">&times;</button>
            </div>
            
            <div class="tone-grid" style="padding: 24px;">
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Category</label>
                <select id="modal-thread-category" class="builder-select" style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(203, 213, 225, 0.4); background: rgba(255, 255, 255, 0.8); font-size: 14px;">
                  <option value="history">📜 History</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="stories">📖 Stories</option>
                  <option value="celebrity">⭐ Celebrity</option>
                  <option value="news">📰 News</option>
                </select>
              </div>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Topic</label>
                <input type="text" id="modal-thread-topic" class="builder-select" placeholder="e.g., The fall of the Roman Empire" style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(203, 213, 225, 0.4); background: rgba(255, 255, 255, 0.8); font-size: 14px;" />
                <small style="display: block; margin-top: 6px; font-size: 11px; color: var(--text-secondary);">Enter any topic you want to create a thread about</small>
              </div>
              
              <div class="form-group" style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="modal-use-knowledge-pack" checked style="width: 16px; height: 16px;" />
                  <span style="font-size: 13px; font-weight: 500; color: var(--text-primary);">Use AI Knowledge Base</span>
                </label>
                <small style="display: block; margin-top: 4px; margin-left: 24px; font-size: 11px; color: var(--text-secondary);">Includes curated facts and hooks</small>
              </div>
            </div>
            
            <div class="tone-modal-actions">
              <button id="thread-gen-cancel-btn" class="tone-btn tone-btn-secondary">Cancel</button>
              <button id="thread-gen-generate-btn" class="tone-btn tone-btn-primary">
                Generate Thread
              </button>
            </div>
          </div>
        </div>
      `;
      
      if (!document.getElementById('thread-generator-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
      }
    },
    
    // Bind modal events
    bindModalEvents: function() {
      const modal = document.getElementById('thread-generator-modal');
      if (!modal) return;
      
      const closeBtn = modal.querySelector('.tone-modal-close');
      const overlay = modal.querySelector('.tone-modal-overlay');
      const cancelBtn = document.getElementById('thread-gen-cancel-btn');
      const generateBtn = document.getElementById('thread-gen-generate-btn');
      
      closeBtn?.addEventListener('click', () => this.hideModal());
      overlay?.addEventListener('click', () => this.hideModal());
      cancelBtn?.addEventListener('click', () => this.hideModal());
      generateBtn?.addEventListener('click', () => this.handleGenerate());
      
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.hideModal();
      });
    },
    
    // Show modal
    showModal: function(popupInstance) {
      // Store reference to the popup instance
      if (popupInstance) {
        ThreadGenerator.popupInstance = popupInstance;
        console.log('ThreadGenerator: Stored popup instance, has apiKey:', !!popupInstance.apiKey);
      } else {
        console.error('ThreadGenerator: No popup instance provided to showModal');
        alert('Unable to open thread generator. Please refresh and try again.');
        return;
      }
      
      ThreadGenerator.init();
      const modal = document.getElementById('thread-generator-modal');
      if (!modal) return;
      
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
      const topicInput = document.getElementById('modal-thread-topic');
      topicInput?.focus();
    },
    
    // Hide modal
    hideModal: function() {
      const modal = document.getElementById('thread-generator-modal');
      if (!modal) return;
      
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    },
    
    // Handle generate
    handleGenerate: async function() {
      const category = document.getElementById('modal-thread-category')?.value;
      const topic = document.getElementById('modal-thread-topic')?.value?.trim();
      const useKnowledgePack = document.getElementById('modal-use-knowledge-pack')?.checked;
      
      if (!topic) {
        alert('Please enter a topic');
        return;
      }
      
      console.log('ThreadGenerator: handleGenerate called');
      console.log('ThreadGenerator: popupInstance exists:', !!ThreadGenerator.popupInstance);
      console.log('ThreadGenerator: popupInstance has apiKey:', !!ThreadGenerator.popupInstance?.apiKey);
      console.log('ThreadGenerator: popupInstance has generateThreadMVP:', !!ThreadGenerator.popupInstance?.generateThreadMVP);
      
      ThreadGenerator.hideModal();
      
      // Call the generation function on the stored popup instance
      if (ThreadGenerator.popupInstance && ThreadGenerator.popupInstance.generateThreadMVP) {
        await ThreadGenerator.popupInstance.generateThreadMVP(category, topic, { 
          useKnowledgePack,
          maxTweets: 8,
          tone: 'curious'
        });
      } else {
        console.error('Popup instance not available for thread generation');
        console.error('popupInstance:', ThreadGenerator.popupInstance);
        alert('Unable to generate thread. Please try again.');
      }
    },
    
    // Load knowledge pack for a category
    loadKnowledgePack: async function(category) {
      if (this.knowledgePacks[category]) {
        return this.knowledgePacks[category];
      }
      
      try {
        const response = await fetch(`knowledge-packs/${category}.json`);
        if (!response.ok) {
          console.warn(`Knowledge pack not found for ${category}`);
          return null;
        }
        const data = await response.json();
        this.knowledgePacks[category] = data;
        return data;
      } catch (error) {
        console.error(`Error loading knowledge pack for ${category}:`, error);
        return null;
      }
    },
    
    // Get a random hook from the knowledge pack
    getRandomHook: function(knowledgePack) {
      if (!knowledgePack || !knowledgePack.hooks || knowledgePack.hooks.length === 0) {
        return null;
      }
      const randomIndex = Math.floor(Math.random() * knowledgePack.hooks.length);
      return knowledgePack.hooks[randomIndex];
    },
    
    // Generate thread using AI with knowledge pack context
    generateThreadMVP: async function(category, topic, options = {}) {
      // Store reference to popup instance for use in helper functions
      const popup = this;
      
      if (!popup.apiKey) {
        alert('❌ Please set up your Gemini API key first.');
        popup.showView && popup.showView('settings');
        return;
      }
      
      const useKnowledgePack = options.useKnowledgePack !== false;
      const maxTweets = options.maxTweets || 8;
      const tone = options.tone || 'curious';
      
      popup.setLoading(true, `Generating ${category} thread...`);
      console.log(`Fibr: Generating thread for category: ${category}, topic: ${topic}`);
      
      try {
        // Load knowledge pack if enabled
        let knowledgeContext = '';
        if (useKnowledgePack) {
          const knowledgePack = await ThreadGenerator.loadKnowledgePack(category);
          if (knowledgePack && knowledgePack.facts) {
            knowledgeContext = `\n\nRELEVANT KNOWLEDGE BASE:\n${knowledgePack.facts.slice(0, 5).map((fact, i) => `${i + 1}. ${fact}`).join('\n')}\n`;
          }
        }
        
        // Show progress bar
        popup.showProgressBar && popup.showProgressBar(`Generating ${category} thread...`);
        
        // Step 1: Generate outline
        const outlineSystemPrompt = `You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads about ${category}. No markdown, no hashtags.`;
        
        const outlineUserPrompt = `Create a ${maxTweets}-tweet thread outline about: ${topic}

Category: ${category}
Tone: ${tone}
${knowledgeContext}

Create an outline with ${maxTweets} beats:
- Beat 1: Hook (attention-grabbing opener)
- Beats 2-${maxTweets - 1}: Core content (facts, insights, twists)
- Beat ${maxTweets}: Closer (memorable ending)

Format each beat as:
[Beat number]: [One-sentence description]

Generate the outline now:`;
        
        const outlineResponse = await popup.callGeminiAPIWithSystemPrompt(outlineSystemPrompt, outlineUserPrompt);
        
        if (!outlineResponse) {
          throw new Error('Failed to generate outline');
        }
        
        console.log('✅ Outline generated');
        
        // Step 2: Expand outline to full tweets
        const expandSystemPrompt = `You are a masterful Twitter/X thread storyteller. You craft threads about ${category} that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.`;
        
        const expandUserPrompt = `Transform this outline into a complete ${maxTweets}-tweet thread about: ${topic}

OUTLINE:
${outlineResponse}

CRITICAL FORMAT:
Start each tweet with: 1/${maxTweets}: 2/${maxTweets}: 3/${maxTweets}: etc.

TONE: ${tone}
${tone === 'curious' ? '- Ask questions, spark wonder, invite exploration' : ''}
${tone === 'neutral' ? '- Factual, balanced, informative' : ''}
${tone === 'dramatic' ? '- Bold, intense, emotionally charged' : ''}

STYLE:
✓ Each tweet can be 100-280 characters
✓ Include 1-2 emojis per tweet naturally
✓ Use line breaks for visual flow
✓ Conversational and human
✓ No hashtags, no URLs, no markdown

${knowledgeContext}

OUTPUT EXAMPLE:
1/${maxTweets}:
[Hook content here]

2/${maxTweets}:
[Content here]

Generate the complete thread now:`;
        
        const expandResponse = await popup.callGeminiAPIWithSystemPrompt(expandSystemPrompt, expandUserPrompt);
        
        if (!expandResponse) {
          throw new Error('Failed to expand thread');
        }
        
        console.log('✅ Thread expanded');
        
        // Step 3: Clean and parse
        const cleanedResponse = popup.cleanTwitterContent(expandResponse);
        const tweets = popup.parseTwitterThread(cleanedResponse);
        
        // Step 4: Smart split if any tweet exceeds 280 chars
        const finalTweets = [];
        for (let tweet of tweets) {
          const charCount = popup.getAccurateCharacterCount(tweet);
          if (charCount <= 280) {
            finalTweets.push(tweet);
          } else {
            // Split long tweet
            const splitTweets = await ThreadGenerator.smartSplitTweet.call(popup, tweet, 280);
            finalTweets.push(...splitTweets);
          }
        }
        
        console.log(`✅ Thread generated: ${finalTweets.length} tweets`);
        
        // Step 5: Render - pass popup instance
        const threadId = `thread_${Date.now()}`;
        ThreadGenerator.renderThreadGeneratorResult.call(popup, finalTweets, threadId, category, topic, useKnowledgePack);
        
        // Auto-save
        if (popup.autoSaveThread) {
          await popup.autoSaveThread(threadId, finalTweets, cleanedResponse);
        }
        
        await popup.saveState();
        
      } catch (error) {
        console.error('Error generating thread:', error);
        alert(`❌ Error generating thread: ${error.message}`);
      } finally {
        popup.setLoading(false);
        popup.hideProgressBar && popup.hideProgressBar();
      }
    },
    
    // Smart split a tweet that's too long
    smartSplitTweet: async function(tweet, maxLength) {
      // Simple split for MVP - just break at sentence boundaries
      const sentences = tweet.match(/[^.!?]+[.!?]+/g) || [tweet];
      const splits = [];
      let current = '';
      
      for (const sentence of sentences) {
        const testLength = this.getAccurateCharacterCount(current + sentence);
        if (testLength <= maxLength) {
          current += sentence;
        } else {
          if (current) splits.push(current.trim());
          current = sentence;
        }
      }
      
      if (current) splits.push(current.trim());
      
      return splits.length > 0 ? splits : [tweet.substring(0, maxLength)];
    },
    
    // Render the thread generator result
    renderThreadGeneratorResult: function(tweets, threadId, category, topic, useKnowledgePack = true) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container thread-generator-result';
      
      // Store metadata for regeneration
      contentContainer.dataset.category = category;
      contentContainer.dataset.topic = topic;
      contentContainer.dataset.useKnowledgePack = useKnowledgePack;
      
      // Thread header - cleaner, more compact
      const threadHeader = document.createElement('div');
      threadHeader.className = 'thread-header';
      const currentTotalChars = this.getTotalChars(tweets);
      threadHeader.innerHTML = `
        <div class="thread-info">
          <span class="thread-icon">🧵</span>
          <div class="thread-title-group">
            <span class="thread-title">${topic}</span>
            <span class="thread-category">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
          </div>
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
      
      // Bind Copy All button
      const copyAllBtn = threadHeader.querySelector('.btn-copy-all-thread');
      const copyAllStatus = threadHeader.querySelector('.copy-all-status');
      copyAllBtn.addEventListener('click', async () => {
        await this.copyAllTweets(tweets, copyAllBtn, copyAllStatus);
      });
      
      // Add Master Thread Control (unified slider + presets + regenerate)
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
        await this.regenerateEntireThreadForGenerator(contentContainer, threadId, targetLength, category, topic, useKnowledgePack);
      });
      
      // Individual tweet cards in SIMPLE MODE (no per-tweet controls)
      tweets.forEach((tweet, index) => {
        const cardTitle = `Thread ${index + 1}/${tweets.length}`;
        // Pass true for isThreadCard = simple mode (only char count)
        const card = this.createTwitterCard(tweet, cardTitle, true);
        card.dataset.platform = 'thread';
        card.dataset.threadId = threadId;
        card.dataset.category = category;
        contentContainer.appendChild(card);
      });
      
      this.messagesContainer.appendChild(contentContainer);
      setTimeout(() => {
        this.messagesContainer.scrollTo({
          top: this.messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    },
    
    // Regenerate entire thread for Thread Generator with new length
    regenerateEntireThreadForGenerator: async function(container, threadId, targetLength, category, topic, useKnowledgePack) {
      const regenerateBtn = container.querySelector('.btn-regenerate-thread');
      if (!regenerateBtn) return;
      
      const originalText = regenerateBtn.textContent;
      regenerateBtn.textContent = '⏳ Regenerating...';
      regenerateBtn.disabled = true;
      
      try {
        // Calculate desired tweet count based on length
        const tweetsNeeded = Math.max(3, Math.min(12, Math.ceil(targetLength / 400)));
        
        // Load knowledge pack if enabled
        let knowledgeContext = '';
        if (useKnowledgePack) {
          const knowledgePack = await this.loadKnowledgePack(category);
          if (knowledgePack && knowledgePack.facts) {
            knowledgeContext = `\n\nRELEVANT KNOWLEDGE BASE:\n${knowledgePack.facts.slice(0, 5).map((fact, i) => `${i + 1}. ${fact}`).join('\n')}\n`;
          }
        }
        
        // Generate new thread with target length
        const systemPrompt = `You are a masterful Twitter/X thread storyteller crafting ${tweetsNeeded} tweets (${targetLength} total characters) about ${category}. Each tweet vibrates with personality, energy, and human warmth. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting. Pure storytelling magic.`;
        
        const userPrompt = `Create a magnetic Twitter thread with EXACTLY ${tweetsNeeded} tweets totaling approximately ${targetLength} characters about: ${topic}

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

YOUR TONE: Curious and engaging
✓ Ask questions, spark wonder, invite exploration
✓ Enthusiastic and genuinely excited
✓ Human and conversational
✓ Bold and confident
✓ Strategic line breaks for visual flow

KEEP IT CLEAN:
✗ No hashtags
✗ No formatting symbols
✗ No URLs
✗ No explanations about format

${knowledgeContext}

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
            card.dataset.category = category;
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
          if (this.autoSaveThread) {
            await this.autoSaveThread(threadId, newTweets, cleanedResponse);
          }
          
          console.log('✅ Thread regenerated successfully');
        }
        
      } catch (error) {
        console.error('Error regenerating thread:', error);
        alert('Failed to regenerate thread. Please try again.');
      } finally {
        regenerateBtn.textContent = originalText;
        regenerateBtn.disabled = false;
      }
    },
    
    // Show thread generator view
    showThreadGeneratorView: function() {
      const threadGenView = document.getElementById('thread-generator-view');
      if (threadGenView) {
        this.showView('thread-generator');
      }
    },
    
    // Initialize collapsible "How it works" section
    initializeHowItWorksToggle: function() {
      const toggle = document.getElementById('how-it-works-toggle');
      const content = document.getElementById('how-it-works-content');
      
      if (!toggle || !content) return;
      
      // Start collapsed
      content.classList.remove('expanded');
      toggle.classList.remove('expanded');
      
      toggle.addEventListener('click', () => {
        const isExpanded = content.classList.contains('expanded');
        
        if (isExpanded) {
          content.classList.remove('expanded');
          toggle.classList.remove('expanded');
        } else {
          content.classList.add('expanded');
          toggle.classList.add('expanded');
        }
      });
    },
    
    // Handle thread generator form submission
    handleThreadGeneratorSubmit: async function() {
      const categorySelect = document.getElementById('thread-category');
      const topicInput = document.getElementById('thread-topic');
      const useKnowledgeToggle = document.getElementById('use-knowledge-pack');
      
      if (!categorySelect || !topicInput) {
        console.error('Thread generator form elements not found');
        return;
      }
      
      const category = categorySelect.value;
      const topic = topicInput.value.trim();
      const useKnowledgePack = useKnowledgeToggle ? useKnowledgeToggle.checked : true;
      
      if (!topic) {
        alert('Please enter a topic');
        return;
      }
      
      // Switch to chat view to show results
      this.showView('chat');
      
      // Clear previous messages for clean display
      if (this.resetScreenForGeneration) {
        this.resetScreenForGeneration();
      }
      
      // Generate thread
      await this.generateThreadMVP(category, topic, {
        useKnowledgePack,
        maxTweets: 8,
        tone: 'curious'
      });
      
      // Clear the topic input for next generation
      topicInput.value = '';
    }
  };
  
  // Defer initialization until the main app requests it
  // This prevents race conditions on DOM load
  // The main popup.js will call ThreadGenerator.init()
  
  // Export to window
  window.TabTalkThreadGenerator = ThreadGenerator;
})();
