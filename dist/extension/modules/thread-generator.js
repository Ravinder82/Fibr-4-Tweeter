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
                <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Topic</label>
                <input type="text" id="modal-thread-topic" class="builder-select" placeholder="e.g., The future of artificial intelligence" style="width: 100%; padding: 10px 12px; border-radius: 10px; font-size: 14px;" />
                <small style="display: block; margin-top: 6px; font-size: 11px; color: var(--text-secondary);">Enter any topic you want to create a thread about</small>
              </div>
              
              <div class="form-group" style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="modal-use-knowledge-pack" checked style="width: 16px; height: 16px;" />
                  <span style="font-size: 13px; font-weight: 500; color: var(--text-primary);">Use AI Knowledge Base</span>
                </label>
                <small style="display: block; margin-top: 4px; margin-left: 24px; font-size: 11px; color: var(--text-secondary);">Includes curated facts and hooks</small>
              </div>

              <div class="form-group" style="margin-bottom: 8px; margin-top: 6px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="modal-include-image-prompts" style="width: 16px; height: 16px;" />
                  <span style="font-size: 13px; font-weight: 500; color: var(--text-primary);">Generate per‑tweet Image Prompts (9:16)</span>
                </label>
                <small style="display: block; margin-top: 4px; margin-left: 24px; font-size: 11px; color: var(--text-secondary);">Live only. Not saved to Gallery.</small>
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
      
      // Clear previous content before generation
      if (ThreadGenerator.popupInstance && ThreadGenerator.popupInstance.resetScreenForGeneration) {
        ThreadGenerator.popupInstance.resetScreenForGeneration();
      }
      
      // Call the generation function on the stored popup instance
      if (ThreadGenerator.popupInstance && ThreadGenerator.popupInstance.generateThreadMVP) {
        await ThreadGenerator.popupInstance.generateThreadMVP(topic, { 
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

    // Smart thread length optimization based on topic complexity
    optimizeThreadLength: async function(topic) {
      try {
        const analysisPrompt = `Analyze this topic and determine the optimal Twitter thread length: "${topic}"

Rate the topic complexity on a scale of 1-10:
1-3: Simple concepts (basic tips, opinions, quick takeaways)
4-6: Moderate complexity (explanations, how-to guides, analysis)
7-8: Complex topics (technical deep-dives, research, multi-faceted issues)
9-10: Very complex (academic subjects, comprehensive analysis, expert-level content)

Also consider:
- Does it require examples and case studies? (+1-2 tweets)
- Does it need historical context? (+1 tweet)
- Are there multiple subtopics to cover? (+1-3 tweets)
- Does it benefit from data and evidence? (+1-2 tweets)

RESPONSE FORMAT:
Just return a number between 3 and 12 for the optimal tweet count.

Topic: "${topic}"`;

        const response = await window.TabTalkAPI?.callGeminiAPI(analysisPrompt);

        if (response) {
          const length = parseInt(response.trim());
          // Ensure the length is within reasonable bounds
          return Math.max(3, Math.min(12, length || 8));
        }
      } catch (error) {
        console.warn('Smart length optimization failed, using default:', error);
      }
      
      // Fallback to default length
      return 8;
    },
    
    // Generate thread using AI with knowledge pack context
    generateThreadMVP: async function(topic, options = {}) {
      // Store reference to popup instance for use in helper functions
      const popup = this;
      
      if (!popup.apiKey) {
        alert('❌ Please set up your Gemini API key first.');
        popup.showView && popup.showView('settings');
        return;
      }
      
      const useKnowledgePack = options.useKnowledgePack !== false;
      let maxTweets = options.maxTweets || 8;
      const tone = options.tone || 'curious';
      
      // Smart length optimization based on topic complexity
      if (!options.maxTweets) {
        maxTweets = await this.optimizeThreadLength(topic);
        console.log(`Smart optimization: Set thread length to ${maxTweets} tweets for topic: ${topic}`);
      }
      
      popup.setLoading(true, `Generating thread...`);
      console.log(`Fibr: Generating thread for topic: ${topic}`);
      
      try {
        // Load knowledge pack if enabled - use general knowledge now
        let knowledgeContext = '';
        if (useKnowledgePack) {
          // Load a general knowledge pack or use built-in knowledge
          knowledgeContext = `\n\nRELEVANT KNOWLEDGE BASE:
• Include verifiable facts, statistics, and expert insights about the topic
• Reference historical context, recent developments, and future trends
• Incorporate scientific principles, case studies, and real-world examples
• Add surprising data points and counterintuitive findings
• Include practical applications and implications\n`;
        }
        
        // Show progress bar
        popup.showProgressBar && popup.showProgressBar(`Generating thread...`);
        
        // Step 1: Generate outline
        const outlineSystemPrompt = `You are a precise thread outline creator. You create structured outlines for engaging Twitter/X threads. No markdown, no hashtags.`;
        
        const outlineUserPrompt = `Create a ${maxTweets}-tweet thread outline about: ${topic}

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
        const expandSystemPrompt = `You are a masterful Twitter/X thread storyteller. You craft threads that captivate readers. Each tweet pulses with energy and personality. Write in plain text with strategic emojis - no hashtags, no URLs, no formatting symbols.`;
        
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
        ThreadGenerator.renderThreadGeneratorResult.call(popup, finalTweets, threadId, topic, useKnowledgePack);
        
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
    renderThreadGeneratorResult: function(tweets, threadId, topic, useKnowledgePack = true) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container thread-generator-result';
      
      // Store metadata for regeneration
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
            <span class="thread-category">AI Generated</span>
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
        await this.copyAllTweets(tweets, copyAllBtn, copyAllStatus, threadId);
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
        await this.regenerateEntireThreadForGenerator(contentContainer, threadId, targetLength, topic, useKnowledgePack);
      });
      
      // Individual tweet cards in SIMPLE MODE (no per-tweet controls)
      const includeImagePrompts = document.getElementById('modal-include-image-prompts')?.checked;
      tweets.forEach((tweet, index) => {
        const cardTitle = `Thread ${index + 1}/${tweets.length}`;
        // Pass true for isThreadCard = simple mode (only char count)
        const card = this.createTwitterCard(tweet, cardTitle, true);
        card.dataset.platform = 'thread';
        card.dataset.threadId = threadId;
        contentContainer.appendChild(card);

        // Live-only per-tweet image prompt generation if enabled
        if (includeImagePrompts && window.TabTalkImagePromptGenerator) {
          (async () => {
            try {
              const contentId = `threadgen_${threadId}_tweet_${index + 1}`;
              const prompt = await window.TabTalkImagePromptGenerator.generatePromptForCard(contentId, tweet);
              if (prompt) {
                // Attach to card for copy; do not persist to Gallery
                card.dataset.imagePrompt = encodeURIComponent(prompt);
                // Inject UI block under content
                const contentEl = card.querySelector('.twitter-card-content');
                if (contentEl && !card.querySelector('.image-prompt-display')) {
                  const promptEl = document.createElement('div');
                  promptEl.className = 'image-prompt-display';
                  promptEl.innerHTML = `
                    <div class="image-prompt-label">🖼️ Nano Banana Prompt (9:16)</div>
                    <div class="image-prompt-text">${window.TabTalkUI?.escapeHtml ? window.TabTalkUI.escapeHtml(prompt) : prompt}</div>
                  `;
                  contentEl.appendChild(promptEl);
                }
              }
            } catch (e) {
              console.warn('Thread Generator: image prompt generation failed:', e);
            }
          })();
        }
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
    regenerateEntireThreadForGenerator: async function(container, threadId, targetLength, topic, useKnowledgePack) {
      const regenerateBtn = container.querySelector('.btn-regenerate-thread');
      if (!regenerateBtn) return;
      
      const originalText = regenerateBtn.textContent;
      regenerateBtn.textContent = '⏳ Regenerating...';
      regenerateBtn.disabled = true;
      
      try {
        // Calculate desired tweet count based on length
        const tweetsNeeded = Math.max(3, Math.min(12, Math.ceil(targetLength / 400)));
        
        // Use general knowledge context
        let knowledgeContext = '';
        if (useKnowledgePack) {
          knowledgeContext = `\n\nRELEVANT KNOWLEDGE BASE:
• Include verifiable facts, statistics, and expert insights about the topic
• Reference historical context, recent developments, and future trends
• Incorporate scientific principles, case studies, and real-world examples
• Add surprising data points and counterintuitive findings
• Include practical applications and implications\n`;
        }
        
        // Generate new thread with expert-level research and analysis
        const systemPrompt = `You are a world-class research analyst and subject matter expert who creates the most comprehensive, data-driven Twitter threads ever published. Your work is cited by academics, journalists, and industry leaders for its depth, accuracy, and groundbreaking insights.

Your expertise includes:
- Advanced research methodology and data analysis
- Cross-disciplinary knowledge integration
- Statistical analysis and evidence-based reasoning
- Historical context and trend identification
- Technical deep-dives with practical applications
- Economic analysis and market dynamics
- Scientific principles and empirical evidence

You write with intellectual rigor while maintaining accessibility. Every claim is supported by verifiable data, every insight is backed by research, and every conclusion follows logically from the evidence presented. Your threads become reference material that people bookmark and return to repeatedly.

Write in plain text with precise, professional language - no hashtags, no URLs, no formatting symbols. Pure expert-level analysis with strategic emojis that emphasize key insights.`;
        
        const userPrompt = `Generate a comprehensive, expert-level research thread on: ${topic}

CRITICAL REQUIREMENTS:
- Create reference-quality content that becomes the definitive analysis on this topic
- Include verifiable facts, specific figures, statistical data, and concrete evidence
- Provide deep technical insights with practical applications and implications
- Synthesize information from multiple disciplines and perspectives
- Maintain academic rigor while ensuring accessibility for educated readers

FORMAT REQUIREMENT:
Start each tweet with: 1/${tweetsNeeded}: 2/${tweetsNeeded}: 3/${tweetsNeeded}: etc.

EXPERT THREAD STRUCTURE:
1/${tweetsNeeded}: Executive Summary - Core thesis, significance, and key findings upfront
2/${tweetsNeeded}: Historical Context & Evolution - How we arrived at current understanding
3-${tweetsNeeded-2}: Deep Analysis - Technical details, data patterns, causal relationships, case studies, empirical evidence
${tweetsNeeded-1}: Practical Implications - Real-world applications, future projections, strategic considerations
${tweetsNeeded}: Conclusions & Further Research - Key takeaways, unanswered questions, next steps for investigation

RESEARCH STANDARDS:
✓ Include specific numbers, percentages, dates, and measurable metrics
✓ Cite studies, reports, or data sources when relevant
✓ Explain technical concepts with precision and clarity
✓ Identify causal relationships vs. correlations
✓ Address counterarguments and limitations
✓ Provide actionable insights based on evidence
✓ Use professional terminology with explanations when needed
✓ Include 1-2 strategic emojis to highlight critical insights

CONTENT QUALITY:
- Every claim must be supported by evidence or logical reasoning
- Include surprising or counterintuitive findings that challenge conventional wisdom
- Connect abstract concepts to concrete real-world examples
- Demonstrate depth of knowledge through nuanced analysis
- Balance technical accuracy with readability

${knowledgeContext}

Generate your expert research thread now:`;
        
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
      const topicInput = document.getElementById('thread-topic');
      const useKnowledgeToggle = document.getElementById('use-knowledge-pack');
      
      if (!topicInput) {
        console.error('Thread generator form elements not found');
        return;
      }
      
      const topic = topicInput.value.trim();
      
      if (!topic) {
        window.TabTalkUI?.showToast('Please enter a topic', 2000);
        return;
      }
      
      // Use expert-level thread generation system
      const useKnowledge = useKnowledgeToggle ? useKnowledgeToggle.checked : true;
      
      try {
        // Show loading state
        const generateBtn = document.getElementById('generate-thread-btn');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '⏳ Generating...';
        generateBtn.disabled = true;
        
        // Generate thread using expert-level system
        const tweetsNeeded = Math.max(3, Math.min(8, Math.ceil(2000 / 400)));
        
        // Load knowledge pack if enabled - use general knowledge now
        let knowledgeContext = '';
        if (useKnowledge) {
          // Use general knowledge context instead of category-specific
          knowledgeContext = `\n\nRELEVANT KNOWLEDGE BASE:
• Include verifiable facts, statistics, and expert insights about the topic
• Reference historical context, recent developments, and future trends
• Incorporate scientific principles, case studies, and real-world examples
• Add surprising data points and counterintuitive findings
• Include practical applications and implications\n`;
        }
        
        // Use the expert-level system prompt
        const systemPrompt = `You are a world-class research analyst and subject matter expert who creates the most comprehensive, data-driven Twitter threads ever published. Your work is cited by academics, journalists, and industry leaders for its depth, accuracy, and groundbreaking insights.

Your expertise includes:
- Advanced research methodology and data analysis
- Cross-disciplinary knowledge integration
- Statistical analysis and evidence-based reasoning
- Historical context and trend identification
- Technical deep-dives with practical applications
- Economic analysis and market dynamics
- Scientific principles and empirical evidence

You write with intellectual rigor while maintaining accessibility. Every claim is supported by verifiable data, every insight is backed by research, and every conclusion follows logically from the evidence presented. Your threads become reference material that people bookmark and return to repeatedly.

Write in plain text with precise, professional language - no hashtags, no URLs, no formatting symbols. Pure expert-level analysis with strategic emojis that emphasize key insights.`;
        
        const userPrompt = `Generate a comprehensive, expert-level research thread on: ${topic}

CRITICAL REQUIREMENTS:
- Create reference-quality content that becomes the definitive analysis on this topic
- Include verifiable facts, specific figures, statistical data, and concrete evidence
- Provide deep technical insights with practical applications and implications
- Synthesize information from multiple disciplines and perspectives
- Maintain academic rigor while ensuring accessibility for educated readers

FORMAT REQUIREMENT:
Start each tweet with: 1/${tweetsNeeded}: 2/${tweetsNeeded}: 3/${tweetsNeeded}: etc.

EXPERT THREAD STRUCTURE:
1/${tweetsNeeded}: Executive Summary - Core thesis, significance, and key findings upfront
2/${tweetsNeeded}: Historical Context & Evolution - How we arrived at current understanding
3-${tweetsNeeded-2}: Deep Analysis - Technical details, data patterns, causal relationships, case studies, empirical evidence
${tweetsNeeded-1}: Practical Implications - Real-world applications, future projections, strategic considerations
${tweetsNeeded}: Conclusions & Further Research - Key takeaways, unanswered questions, next steps for investigation

RESEARCH STANDARDS:
✓ Include specific numbers, percentages, dates, and measurable metrics
✓ Cite studies, reports, or data sources when relevant
✓ Explain technical concepts with precision and clarity
✓ Identify causal relationships vs. correlations
✓ Address counterarguments and limitations
✓ Provide actionable insights based on evidence
✓ Use professional terminology with explanations when needed
✓ Include 1-2 strategic emojis to highlight critical insights

CONTENT QUALITY:
- Every claim must be supported by evidence or logical reasoning
- Include surprising or counterintuitive findings that challenge conventional wisdom
- Connect abstract concepts to concrete real-world examples
- Demonstrate depth of knowledge through nuanced analysis
- Balance technical accuracy with readability

${knowledgeContext}

Generate your expert research thread now:`;
        
        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          const cleanedResponse = this.cleanTwitterContent(response);
          const tweets = this.parseTwitterThread(cleanedResponse);
          
          // Display result in messages container
          this.displayThreadResult(cleanedResponse, topic, category);
          
          // Save to gallery
          this.saveThreadToGallery(cleanedResponse, topic, category);
          
          window.TabTalkUI?.showToast('Expert thread generated successfully!', 2000);
        }
        
      } catch (error) {
        console.error('Thread generation failed:', error);
        window.TabTalkUI?.showToast('Failed to generate thread', 3000);
      } finally {
        // Reset button state
        const generateBtn = document.getElementById('generate-thread-btn');
        if (generateBtn) {
          generateBtn.textContent = '🚀 Generate Enhanced Thread';
          generateBtn.disabled = false;
        }
      }
    }
  };
  
  // Defer initialization until the main app requests it
  // This prevents race conditions on DOM load
  // The main popup.js will call ThreadGenerator.init()
  
  // Export to window
  window.TabTalkThreadGenerator = ThreadGenerator;
})();
