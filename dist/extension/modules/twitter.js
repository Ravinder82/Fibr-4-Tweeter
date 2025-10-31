(function() {
  const Twitter = {
    // Deep analysis and research of content
    analyzeAndResearchContent: async function(pageContent, selectedTone, platform = 'twitter') {
      // CRITICAL FIX: Disable caching to ensure unique content every generation
      // Each generation should produce fresh, unique content based on the current context
      console.log('Performing fresh content analysis for unique generation');

      // Perform deep analysis
      const analysisPrompt = `You are an expert content analyst and researcher. Analyze this webpage content and provide:

1. SUMMARY (2-3 sentences): Core message and main points
2. KEY INSIGHTS (3-5 bullet points): Most important facts, data, or claims
3. RESEARCH CONTEXT: Relevant domain knowledge, background, trends, or expert perspective from your training data (up to October 2024) that adds depth and credibility

Be concise, factual, and focus on what makes this content significant or noteworthy.

CONTENT:
${pageContent.substring(0, 3000)}

Provide your analysis in this format:
SUMMARY: [your summary]
KEY INSIGHTS:
- [insight 1]
- [insight 2]
- [insight 3]
RESEARCH CONTEXT: [relevant background knowledge and expert perspective]`;

      try {
        const analysisResponse = await this.callGeminiAPIWithSystemPrompt(
          'You are an expert content analyst who provides structured, insightful analysis.',
          analysisPrompt
        );

        // Parse the response
        const analysis = this.parseAnalysisResponse(analysisResponse);
        
        // CACHING DISABLED: Each generation gets fresh analysis for unique content
        return analysis;
      } catch (error) {
        console.error('Analysis failed:', error);
        // Return minimal fallback
        return {
          summary: 'Content analysis unavailable.',
          keyInsights: '- Focus on core message from the content',
          researchContext: 'Apply general domain knowledge and best practices.'
        };
      }
    },

    clearPreviousCommentOutputs: function() {
      if (!this.messagesContainer) return;
      const existingCommentContainers = this.messagesContainer.querySelectorAll('.twitter-content-container');
      existingCommentContainers.forEach(container => {
        const isComment = container.querySelector('.twitter-card-title')?.textContent?.toLowerCase().includes('comment');
        if (isComment) {
          container.remove();
        }
      });
    },

    clearPreviousRepostOutputs: function() {
      if (!this.messagesContainer) return;
      
      console.log('🧹 Clearing previous repost outputs...');
      
      const existingRepostContainers = this.messagesContainer.querySelectorAll('.twitter-content-container');
      let removedCount = 0;
      
      existingRepostContainers.forEach(container => {
        const card = container.querySelector('.twitter-card');
        if (!card) return;
        
        // STRATEGY 1: Check explicit repost marker (most reliable)
        if (container.dataset.generationType === 'repost') {
          container.remove();
          removedCount++;
          return;
        }
        
        // STRATEGY 2: Check platform dataset
        const platform = card.dataset?.platform;
        if (platform === 'twitter' && !container.querySelector('.thread-header')) {
          const cardTitle = container.querySelector('.twitter-card-title')?.textContent?.toLowerCase() || '';
          const isComment = cardTitle.includes('comment');
          if (!isComment) {
            container.remove();
            removedCount++;
            return;
          }
        }
        
        // STRATEGY 3: Defensive - check for single twitter card without thread/comment markers
        // This catches cards that may not have proper dataset attributes
        const hasThreadHeader = container.querySelector('.thread-header');
        const hasThreadMasterControl = container.querySelector('.thread-master-control');
        const cardTitle = container.querySelector('.twitter-card-title')?.textContent?.toLowerCase() || '';
        const isComment = cardTitle.includes('comment');
        const isSinglePost = cardTitle === 'post' || (!cardTitle.includes('thread') && !isComment);
        
        if (!hasThreadHeader && !hasThreadMasterControl && isSinglePost) {
          container.remove();
          removedCount++;
        }
      });
      
      console.log(`🧹 Removed ${removedCount} previous repost card(s)`);
    },

    // Simple hash function for cache keys
    simpleHash: function(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    },

    // Parse analysis response into structured format
    parseAnalysisResponse: function(response) {
      const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=KEY INSIGHTS:|$)/s);
      const insightsMatch = response.match(/KEY INSIGHTS:\s*(.+?)(?=RESEARCH CONTEXT:|$)/s);
      const researchMatch = response.match(/RESEARCH CONTEXT:\s*(.+?)$/s);

      return {
        summary: summaryMatch ? summaryMatch[1].trim() : 'Content provides valuable information.',
        keyInsights: insightsMatch ? insightsMatch[1].trim() : '- Key points from the content',
        researchContext: researchMatch ? researchMatch[1].trim() : 'General domain knowledge applies.'
      };
    },

    // Show tone selector before generation
    showToneSelector: function(platform) {
      if (!this.pageContent || !this.apiKey) {
        if (this.showToast) {
          this.showToast('❌ Please set up your Gemini API key first and ensure page content is loaded.', 3000);
        } else {
          alert('❌ Please set up your Gemini API key first and ensure page content is loaded.');
        }
        return;
      }

      // Show tone selector modal with context-aware recommendations
      if (window.TabTalkToneSelector) {
        window.TabTalkToneSelector.show(
          platform,
          this.pageContent,
          (selectedTone, selectedPlatform, includeImagePrompt) => {
            this.generateSocialContentWithTone(selectedPlatform, selectedTone, includeImagePrompt);
          }
        );
      } else {
        console.error('Tone selector not loaded');
        // Fallback to default tone
        this.generateSocialContentWithTone(platform, { id: 'agreeing', name: 'Amplify & Agree' }, false);
      }
    },

    generateSocialContent: async function(platform) {
      // Legacy method - redirect to tone selector
      this.showToneSelector(platform);
    },

    // Generate content with selected tone
    generateSocialContentWithTone: async function(platform, selectedTone, includeImagePrompt = false) {
      if (!this.pageContent || !this.apiKey) {
        if (this.showToast) {
          this.showToast('❌ Please set up your Gemini API key first and ensure page content is loaded.', 3000);
        } else {
          alert('❌ Please set up your Gemini API key first and ensure page content is loaded.');
        }
        return;
      }

      // Store selected tone and image prompt preference for regeneration
      this.currentSelectedTone = selectedTone;
      this.currentIncludeImagePrompt = includeImagePrompt;

      this.setLoading(true, `Analyzing content...`);
      console.log(`TabTalk AI: Generating ${platform} content for page: ${this.currentTab?.title}`);
      console.log(`Page content length: ${this.pageContent.length} characters`);
      console.log(`Selected tone: ${selectedTone.name} (${selectedTone.id})`);
      console.log(`Include image prompt: ${includeImagePrompt}`);

      try {
        // PHASE 1: Deep Analysis & Research
        this.showProgressBar('Analyzing content...');
        const contentAnalysis = await this.analyzeAndResearchContent(this.pageContent, selectedTone, platform);
        
        // Store analysis for regeneration
        this.currentContentAnalysis = contentAnalysis;
        
        // PHASE 2: Generate with enriched context
        this.showProgressBar('Generating expert post...');
        
        let systemPrompt = '';
        let userPrompt = '';
        let emoji = '';

        // Get tone-specific AI instructions
        const toneInstructions = selectedTone.aiInstructions || this.getDefaultToneInstructions(selectedTone.id);

        if (platform === 'twitter') {
          emoji = '🐦';
          systemPrompt = `You are an authentic human Twitter/X user who writes exactly like real people talk - natural, conversational, and unfiltered. Your tweets feel like they're coming from a real person sharing their genuine thoughts, not a content machine.

YOUR AUTHENTIC VOICE:
- "I tweet like I talk" - natural speech-like patterns
- Use informal language, slang, and abbreviations naturally
- Direct address to followers ("you guys", "y'all", "everyone")
- Strategic emojis that amplify real emotions (2-4 max)
- Natural line breaks that create conversational rhythm
- Write like you're talking to smart friends

CRITICAL CONTENT RULES FOR ORIGINAL POSTS:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER include engagement metrics (likes, views, retweets, follower counts)
- NEVER reference "this post" or "the author" - write as if YOU are the original creator
- NEVER end with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing YOUR thoughts, not commenting on someone else's
- IF USING EXPERT REPURPOSE: ONLY rephrase wording, NEVER change the message or intent

${toneInstructions}

CONTEXT ANALYSIS:
${contentAnalysis.summary}

KEY INSIGHTS:
${contentAnalysis.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${contentAnalysis.researchContext}`;
          userPrompt = `${selectedTone.id === 'repurpose' ? 'REPHRASE this content with better wording - DO NOT add your own opinions or change the message.' : 'Share your authentic thoughts about this content - exactly like you\'d tweet it to your followers.'}

MISSION: ${selectedTone.id === 'repurpose' ? 'Rephrase the EXACT same content with improved vocabulary and flow. Keep the same message, intent, and calls-to-action.' : 'Write something that feels 100% human and conversational, like you\'re actually talking to people.'}

${selectedTone.id === 'repurpose' ? 'CRITICAL: DO NOT start with "Here\'s a rephrased version" or any meta-commentary. Just output the rephrased content directly.' : ''}

YOUR AUTHENTIC TWEET STYLE:
✓ Write like you talk - natural speech patterns
✓ Use informal language, slang, abbreviations
✓ Direct address: "you guys", "y'all", "everyone"
✓ Strategic emojis that amplify real feelings
✓ Natural line breaks for conversational flow
✓ Start with whatever's most interesting - no forced hooks
✓ Show your genuine personality and voice
✓ Mix short and long sentences like real speech
✓ End naturally - a thought, observation, or takeaway
✓ Apply the ${selectedTone.name} tone authentically

KEEP IT 100% REAL:
✗ No hashtags, URLs, or formatting symbols
✗ No marketing language or buzzwords
✗ No generic "content creator" speak
✗ No forced structures or templates
✗ NEVER mention Twitter handles or usernames
✗ NEVER include stats like "1.5M views" or "10K likes" - this is YOUR original post
✗ NEVER reference "this post" or "the author" - YOU are the creator
✗ NEVER end with questions (What do you think? Thoughts? etc.)
✗ Write like you're actually talking to friends
${selectedTone.id === 'repurpose' ? '✗ DO NOT add skepticism, warnings, or change promotional content into critiques' : ''}
${selectedTone.id === 'repurpose' ? '✗ DO NOT add meta-commentary like "Here\'s a rephrased version" or explain what you\'re doing' : ''}

CONTENT ${selectedTone.id === 'repurpose' ? 'TO REPHRASE' : 'THAT INSPIRED YOUR THOUGHTS'}:
${this.pageContent}

${selectedTone.id === 'repurpose' ? 'Rephrase this content now with better wording:' : 'Share your authentic tweet now:'} Generation ID: ${Date.now()}`;
        } else if (platform === 'thread') {
          emoji = '🧵';
          systemPrompt = `You are an authentic human Twitter/X user who writes threads exactly like real people talk - natural, conversational, and storytelling. Your threads feel like you're telling a fascinating story to friends, not creating content.

YOUR AUTHENTIC THREAD VOICE:
- "I tweet like I talk" - natural speech-like patterns throughout
- Use informal language, slang, and abbreviations naturally
- Direct address to followers ("you guys", "y'all", "everyone")
- Strategic emojis that amplify real emotions (1-2 per tweet)
- Natural line breaks that create conversational rhythm
- Write like you're telling a story to smart friends
- Each tweet flows naturally into the next

CRITICAL CONTENT RULES:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER end tweets with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing thoughts, not soliciting responses

${toneInstructions}

CONTEXT ANALYSIS:
${contentAnalysis.summary}

KEY INSIGHTS:
${contentAnalysis.keyInsights}

RESEARCH AUGMENTATION (from domain knowledge):
${contentAnalysis.researchContext}`;
          userPrompt = `Share your thoughts about this content as a Twitter thread - exactly like you'd tell a story to your followers.

MISSION: Write a thread that feels 100% human and conversational, like you're actually talking to people and telling a story.

CRITICAL FORMAT REQUIREMENT:
Start each tweet with: 1/n: 2/n: 3/n: etc.

YOUR AUTHENTIC THREAD STYLE:
✓ Write like you talk - natural speech patterns
✓ Use informal language, slang, abbreviations
✓ Direct address: "you guys", "y'all", "everyone"
✓ Strategic emojis that amplify real feelings (1-2 per tweet)
✓ Natural line breaks for conversational flow
✓ Tweet 1: What first grabbed your attention
✓ Tweet 2: Your initial thoughts or what surprised you
✓ Middle Tweets: What fascinates you - insights, questions, connections
✓ Final Tweet: What you're left thinking or hoping others consider
✓ Apply the ${selectedTone.name} tone authentically

KEEP IT REAL:
✓ No hashtags or formatting symbols
✓ No marketing speak or "content strategist" language
✓ No forced structures - let the story flow naturally
✓ No URLs
✗ NEVER mention Twitter handles or usernames
✗ NEVER end tweets with questions for engagement

CONTENT THAT INSPIRED YOUR THREAD:
${this.pageContent}

Share your authentic thread now: Generation ID: ${Date.now()}`;
        } else {
          if (this.showToast) {
            this.showToast('❌ Only Twitter/X Post and Twitter Thread are supported.', 3000);
          } else {
            alert('❌ Only Twitter/X Post and Twitter Thread are supported.');
          }
          return;
        }

        // Progress already shown above

        // Use the existing callGeminiAPIWithSystemPrompt method
        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          console.log(`TabTalk AI: Successfully generated ${platform} content, response length: ${response.length} characters`);
          const cleanedResponse = this.cleanTwitterContent(response);
          
          // Generate image prompt if requested
          let imagePrompt = null;
          if (includeImagePrompt) {
            this.showProgressBar('Generating image prompt...');
            try {
              if (window.TabTalkImagePromptGenerator) {
                const contentId = `content_${Date.now()}`;
                imagePrompt = await window.TabTalkImagePromptGenerator.generatePromptForCard(contentId, cleanedResponse);
                console.log('Image prompt generated:', imagePrompt ? 'Success' : 'Failed');
              }
            } catch (error) {
              console.error('Image prompt generation failed:', error);
              // Continue without image prompt
            }
          }
          
          this.addTwitterMessage('assistant', cleanedResponse, platform, imagePrompt);
          // Save a history record for future History page
          if (this.addToHistory) {
            const record = {
              timestamp: new Date().toISOString(),
              url: this.currentTab?.url || '',
              title: this.currentTab?.title || '',
              domain: this.currentDomain || '',
              content: cleanedResponse,
              type: platform,
              imagePrompt: imagePrompt || undefined
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

    generateCommentReplyWithTone: async function(selectedTone) {
      if (!this.pageContent || !this.apiKey) {
        if (this.showToast) {
          this.showToast('❌ Please set up your Gemini API key first and ensure page content is loaded.', 3000);
        } else {
          alert('❌ Please set up your Gemini API key first and ensure page content is loaded.');
        }
        return;
      }

      this.currentSelectedTone = selectedTone;
      this.currentIncludeImagePrompt = false;

      // Content is already cleared by resetScreenForGeneration() before modal opened

      this.setLoading(true, 'Researching the discussion...');
      console.log('TabTalk AI: Generating comment reply', {
        toneId: selectedTone?.id,
        toneName: selectedTone?.name,
        pageTitle: this.currentTab?.title
      });

      try {
        this.showProgressBar('Analyzing conversation context...');
        const contentAnalysis = await this.analyzeAndResearchContent(this.pageContent, selectedTone, 'comment');
        this.currentContentAnalysis = contentAnalysis;

        this.showProgressBar('Drafting high-signal comment...');

        const toneInstructions = selectedTone.aiInstructions || this.getDefaultToneInstructions(selectedTone.id);

        const systemPrompt = `You are an elite social strategist trusted by top creators to drop high-signal replies in Twitter/X comment sections. Every reply must feel like it comes from a seasoned operator who did the homework on the conversation.

OPERATING CONDITIONS:
1. Re-immerse yourself in the analysis and source notes below before drafting.
2. Extract the sharpest, most conversation-native detail that proves you actually read the post.
3. Deliver the reply in one cohesive paragraph that can ship immediately.

QUALITY BARS:
- 2–4 sentences (80–220 characters total) with zero filler or meta commentary.
- Surface at least one concrete proof (metric, quote, shipped feature, customer signal, roadmap hint).
- Speak with confident, collaborative energy—never salesy, never fawning, never hostile.
- No hashtags, no @handles, no emoji spam (max 1 if it heightens authenticity).
- Never end with engagement bait or vague “thoughts?” requests.

TONE MODULE — ${selectedTone.name.toUpperCase()}:
${toneInstructions}

CONTEXT ANALYSIS DIGEST:
${contentAnalysis.summary}

KEY INSIGHTS TO LEVERAGE:
${contentAnalysis.keyInsights}

ADDITIONAL RESEARCH SIGNALS:
${contentAnalysis.researchContext}`;

        const userPrompt = `Write one fresh, ready-to-post reply for the active Twitter/X conversation.

OUTPUT REQUIREMENTS:
- Sound like a peer with real operating experience.
- Lead with context that proves you internalized the content.
- Weave in at least one tangible detail (metric, system behavior, release note, user outcome).
- Keep it human—no bullet lists, no headers, no second options.
- This replaces any previous reply; do not recycle earlier phrasing.

SOURCE MATERIAL (full page extraction):
${this.pageContent}

Produce the final comment now in plain text only. Fresh run ID: ${Date.now()}`;

        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);

        if (!response) {
          throw new Error('Empty response received from Gemini API');
        }

        const cleanedResponse = this.cleanTwitterContent(response);
        this.addTwitterMessage('assistant', cleanedResponse, 'comment');

        if (this.addToHistory) {
          const record = {
            timestamp: new Date().toISOString(),
            url: this.currentTab?.url || '',
            title: this.currentTab?.title || '',
            domain: this.currentDomain || '',
            content: cleanedResponse,
            type: 'comment'
          };
          await this.addToHistory('comment', record);
        }

        await this.saveState();
      } catch (error) {
        console.error('Error generating comment reply:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          hasApiKey: !!this.apiKey,
          hasPageContent: !!this.pageContent,
          toneId: selectedTone?.id
        });
        if (this.showToast) {
          this.showToast(`❌ Comment reply failed: ${error.message}`, 4000);
        } else {
          alert(`❌ Comment reply failed: ${error.message}`);
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

    addTwitterMessage: function(role, content, platform, imagePrompt = null) {
      // Directly render Twitter content (no chat history needed)
      this.renderTwitterContent(content, platform, imagePrompt);
    },

    renderTwitterContent: function(content, platform, imagePrompt = null) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container';
      
      // CRITICAL: Mark generation type for reliable clearing
      // This must be set BEFORE appending to DOM
      if (platform === 'twitter') {
        contentContainer.dataset.generationType = 'repost';
        contentContainer.dataset.generationTimestamp = Date.now().toString();
      } else if (platform === 'thread') {
        contentContainer.dataset.generationType = 'thread';
      } else if (platform === 'comment') {
        contentContainer.dataset.generationType = 'comment';
      }
      if (platform === 'thread') {
        // BULLETPROOF: Use enhanced parsing with validation
        const tweets = this.parseTwitterThread(content);
        
        // Validate parsing worked correctly
        if (tweets.length <= 1 && content.includes('1/')) {
          console.warn('⚠️  Thread parsing may have failed - got single tweet but content suggests thread');
          console.log('Original content length:', content.length);
          console.log('Parsed tweets count:', tweets.length);
        }
        
        const threadId = `thread_${Date.now()}`;
        
        // AUTO-SAVE THREAD WITH BULLETPROOF METADATA
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
              📋
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
          await this.copyAllTweets(tweets, copyAllBtn, copyAllStatus, threadId);
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
        
        // BULLETPROOF: Create individual tweet cards with validation
        tweets.forEach((tweet, index) => {
          const cardTitle = `Thread ${index + 1}/${tweets.length}`;
          const card = this.createTwitterCard(tweet, cardTitle, true); // true = isThreadCard
          card.dataset.platform = platform;
          card.dataset.threadId = threadId;
          
          // Add validation metadata
          card.dataset.tweetIndex = index;
          card.dataset.totalTweets = tweets.length;
          card.dataset.isValidThread = 'true';
          
          contentContainer.appendChild(card);

          // If user requested image prompts, generate one per tweet card asynchronously
          if (this.currentIncludeImagePrompt && window.TabTalkImagePromptGenerator) {
            (async () => {
              try {
                const contentId = `thread_${threadId}_tweet_${index + 1}`;
                const tweetPrompt = await window.TabTalkImagePromptGenerator.generatePromptForCard(contentId, tweet);
                if (tweetPrompt) {
                  // Persist on card for copy/save flows
                  card.dataset.imagePrompt = encodeURIComponent(tweetPrompt);
                  // Inject prompt UI if not present
                  const contentEl = card.querySelector('.twitter-card-content');
                  if (contentEl && !card.querySelector('.image-prompt-display')) {
                    const promptEl = document.createElement('div');
                    promptEl.className = 'image-prompt-display';
                    promptEl.innerHTML = `
                      <div class="image-prompt-label">🖼️ Nano Banana Prompt (9:16)</div>
                      <div class="image-prompt-text">${this.escapeHtml(tweetPrompt)}</div>
                    `;
                    contentEl.appendChild(promptEl);
                  } else if (contentEl) {
                    // Update existing prompt text if container already exists
                    const textEl = card.querySelector('.image-prompt-text');
                    if (textEl) textEl.textContent = tweetPrompt;
                  }

                  // Do NOT persist image prompts to saved Gallery
                }
              } catch (e) {
                console.warn('Image prompt generation for thread tweet failed:', e);
              }
            })();
          }
        });
        
        // BULLETPROOF: Log successful thread rendering
        console.log(`✅ Thread rendered successfully: ${tweets.length} tweets, ${currentTotalChars} total chars`);
        
      } else {
        // DISABLED: Universal cards system - using legacy system for stability
        const cardTitle = platform === 'comment' ? 'Comment Reply' : 'Post';
        const card = this.createTwitterCard(content, cardTitle, false, imagePrompt);
        
        // CRITICAL: Set platform dataset BEFORE appending
        card.dataset.platform = platform;
        card.dataset.generationTimestamp = Date.now().toString();
        
        if (imagePrompt) {
          card.dataset.imagePrompt = encodeURIComponent(imagePrompt);
        }
        if (platform === 'comment') {
          const lengthControl = card.querySelector('.twitter-length-control');
          lengthControl?.remove();
        }
        contentContainer.appendChild(card);
      }
      
      // Content is already cleared by resetScreenForGeneration() before any action
      // Just append the new content directly
      this.messagesContainer.appendChild(contentContainer);
      setTimeout(() => {
        this.messagesContainer.scrollTo({
          top: this.messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    },

    // BULLETPROOF THREAD DETECTION - Works across all content formats
    isThreadContent: function(item) {
      if (!item) return false;
      
      // Check 1: Explicit platform/type markers
      if ((item.platform || '').toLowerCase() === 'thread') return true;
      if ((item.type || '').toLowerCase() === 'thread') return true;
      
      // Check 2: Title contains thread indicators
      const title = (item.title || '').toLowerCase();
      if (title.includes('thread')) return true;
      
      // Check 3: Content has structured thread indicators
      const content = (item.content || '').toLowerCase();
      
      // Look for numbered thread patterns (most reliable)
      if (content.includes('1/') && content.includes('2/')) return true;
      if (content.includes('1/8') || content.includes('1/7') || content.includes('1/6') || 
          content.includes('1/5') || content.includes('1/4') || content.includes('1/3')) return true;
      
      // Look for thread emoji
      if (content.includes('🧵')) return true;
      
      // Check 4: Has structured tweets array (definitive proof)
      if (Array.isArray(item.tweets) && item.tweets.length > 1) return true;
      
      // Check 5: Total tweets metadata
      if (item.totalTweets && item.totalTweets > 1) return true;
      
      return false;
    },

    // ENHANCED THREAD PARSING - Multiple fallback patterns with comprehensive error handling
    parseTwitterThread: function(content) {
      if (!content || typeof content !== 'string') {
        console.warn('parseTwitterThread: Invalid content provided');
        return [''];
      }

      const cleanedContent = this.cleanTwitterContent(content);
      let processedContent = cleanedContent.replace(/Here\'s your clean.*?content:\s*/gi, '').trim();
      
      // STRATEGY 1: Standard numbered pattern (most common)
      let tweets = this.tryStandardNumberedParsing(processedContent);
      if (tweets.length > 1) return tweets;
      
      // STRATEGY 2: Line-by-line numbered pattern
      tweets = this.tryLineByLineParsing(processedContent);
      if (tweets.length > 1) return tweets;
      
      // STRATEGY 3: Flexible pattern matching
      tweets = this.tryFlexiblePatternParsing(processedContent);
      if (tweets.length > 1) return tweets;
      
      // STRATEGY 4: Content-based splitting (last resort)
      tweets = this.tryContentBasedSplitting(processedContent);
      if (tweets.length > 1) return tweets;
      
      // FALLBACK: Return as single tweet
      console.warn('parseTwitterThread: Could not parse as multi-tweet thread, treating as single content');
      return [processedContent || content || ''];
    },

    // Strategy 1: Standard numbered pattern parsing
    tryStandardNumberedParsing: function(content) {
      const tweets = [];
      const tweetPattern = /(\d+\/\d+[\s:]*)/g;
      const parts = content.split(tweetPattern).filter(part => part.trim());
      let currentTweet = '';
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (/^\d+\/\d+[\s:]*$/.test(part)) {
          if (currentTweet.trim()) tweets.push(currentTweet.trim());
          currentTweet = '';
        } else {
          currentTweet += part + ' ';
        }
      }
      if (currentTweet.trim()) tweets.push(currentTweet.trim());
      
      return tweets.filter(tweet => tweet.length > 0);
    },

    // Strategy 2: Line-by-line parsing
    tryLineByLineParsing: function(content) {
      const tweets = [];
      const lines = content.split('\n').filter(line => line.trim());
      let tempTweet = '';
      
      for (const line of lines) {
        if (/^\d+\/\d+/.test(line)) {
          if (tempTweet.trim()) tweets.push(tempTweet.trim());
          tempTweet = line.replace(/^\d+\/\d+[\s:]*/, '').trim();
        } else if (tempTweet) {
          tempTweet += '\n' + line;
        } else {
          tempTweet = line;
        }
      }
      if (tempTweet.trim()) tweets.push(tempTweet.trim());
      
      return tweets.filter(tweet => tweet.length > 0);
    },

    // Strategy 3: Flexible pattern matching
    tryFlexiblePatternParsing: function(content) {
      const tweets = [];
      
      // Try multiple regex patterns
      const patterns = [
        /(?:^|\n)(\d+\/\d+)\s*[:\n]\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g,  // Standard: 1/8: content
        /(?:^|\n)(\d+\/\d+)\s*\n\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g,      // Newline: 1/8\ncontent
        /(?:^|\n)(\d+)\/(\d+)\s*[:\n]\s*([^]*?)(?=\n\d+\/\d+|\n*$)/g   // Capturing groups
      ];
      
      for (const pattern of patterns) {
        let match;
        tweets.length = 0; // Clear previous attempts
        
        while ((match = pattern.exec(content)) !== null) {
          const tweetContent = match[2] || match[1] || '';
          if (tweetContent.trim()) {
            tweets.push(tweetContent.trim());
          }
        }
        
        if (tweets.length > 1) break; // Found a working pattern
      }
      
      return tweets.filter(tweet => tweet.length > 0);
    },

    // Strategy 4: Content-based splitting (intelligent paragraph splitting)
    tryContentBasedSplitting: function(content) {
      const tweets = [];
      
      // First, try to detect if this is clearly a thread by looking for thread indicators
      const hasThreadIndicators = content.includes('🧵') || 
                                  content.toLowerCase().includes('thread') ||
                                  content.length > 500;
      
      // Split by double newlines or clear content breaks
      const paragraphs = content.split(/\n\s*\n|\n---\n/).filter(p => p.trim());
      
      // If we have multiple paragraphs and this looks like thread content
      if (paragraphs.length > 1 && hasThreadIndicators) {
        for (const paragraph of paragraphs) {
          const cleanParagraph = paragraph.trim();
          // Filter out very short fragments and standalone thread headers
          if (cleanParagraph.length > 15 && 
              !cleanParagraph.match(/^🧵\s*thread\s*on\s*.*$/i) &&
              !cleanParagraph.match(/^\d+\.\s*$/)) {
            tweets.push(cleanParagraph);
          }
        }
      }
      
      // If still no good splits or this doesn't look like a thread, try sentence-based splitting for longer content
      if (tweets.length <= 1 && content.length > 600) {
        const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
        let currentTweet = '';
        
        for (const sentence of sentences) {
          const testLength = this.getAccurateCharacterCount(currentTweet + sentence);
          if (testLength <= 280) {
            currentTweet += sentence;
          } else {
            if (currentTweet.trim()) tweets.push(currentTweet.trim());
            currentTweet = sentence;
          }
        }
        if (currentTweet.trim()) tweets.push(currentTweet.trim());
      }
      
      // Final validation: ensure we have meaningful content separation
      const validTweets = tweets.filter(tweet => {
        const cleanTweet = tweet.trim();
        return cleanTweet.length > 20 && 
               !cleanTweet.match(/^🧵\s*thread\s*on\s*.*$/i) &&
               !cleanTweet.match(/^\d+\.\s*$/);
      });
      
      // If validation removed too many tweets, fall back to treating as single content
      if (validTweets.length < 2 && paragraphs.length <= 2) {
        return [content.trim()];
      }
      
      return validTweets.length > 0 ? validTweets : [content.trim()];
    },

    createTwitterCard: function(tweetContent, cardTitle, isThreadCard = false, imagePrompt = null) {
      const card = document.createElement('div');
      card.className = 'twitter-card';
      
      // Show selected tone badge and simplified controls
      const toneBadge = this.currentSelectedTone ? `
        <div class="tone-badge" style="background: linear-gradient(135deg, ${this.currentSelectedTone.tone1?.color || this.getToneColor(this.currentSelectedTone.id)} 0%, ${this.currentSelectedTone.tone2?.color || this.getToneColor(this.currentSelectedTone.id)} 100%);">
          ${this.currentSelectedTone.tone1?.icon || this.getToneIcon(this.currentSelectedTone.id)} ${this.currentSelectedTone.name}
        </div>
      ` : '';

      // For thread cards, show only character count
      // For single posts, show tone badge, length control, and regenerate
      const controlsHTML = isThreadCard ? `
        <div class="twitter-controls">
          <div class="twitter-char-count">${this.getAccurateCharacterCount(tweetContent)} characters</div>
        </div>
      ` : `
        <div class="twitter-controls">
          ${toneBadge}
          <div class="twitter-length-control">
            <label class="length-label">Target Length:</label>
            <input type="range" class="length-slider" min="50" max="2000" value="${Math.max(50, this.getAccurateCharacterCount(tweetContent))}" step="50">
            <span class="length-display">${Math.max(50, this.getAccurateCharacterCount(tweetContent))}</span>
            <button class="regenerate-btn" title="Regenerate with new length">🔄</button>
          </div>
          <div class="twitter-char-count">${this.getAccurateCharacterCount(tweetContent)} characters</div>
        </div>
      `;
      
      // Build image prompt HTML if present
      const imagePromptHTML = imagePrompt ? `
        <div class="image-prompt-display">
          <div class="image-prompt-label">🖼️ Nano Banana Prompt (9:16)</div>
          <div class="image-prompt-text">${this.escapeHtml(imagePrompt)}</div>
        </div>
      ` : '';
      
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
          ${imagePromptHTML}
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
          window.TabTalkUI.addSaveButtonToCard(card, actionsContainer, contentType, contentData);
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
          let textToCopy = textArea.value;
          
          // Include image prompt if present (from param or dataset injected later)
          const datasetPrompt = card.dataset.imagePrompt ? decodeURIComponent(card.dataset.imagePrompt) : null;
          const promptToUse = imagePrompt || datasetPrompt;
          if (promptToUse) {
            textToCopy += '\n\n---\n🖼️ Nano Banana Prompt (9:16):\n' + promptToUse;
          }
          
          await navigator.clipboard.writeText(textToCopy);
          
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
        
        if (lengthSlider && lengthDisplay) {
          lengthSlider.addEventListener('input', () => {
            lengthDisplay.textContent = lengthSlider.value;
          });
        }
        
        card.dataset.originalContent = this.pageContent;
        card.dataset.platform = cardTitle.includes('Thread') ? 'thread' : 'twitter';
        
        // Store selected tone in card dataset
        if (this.currentSelectedTone) {
          card.dataset.selectedTone = JSON.stringify(this.currentSelectedTone);
        }
        
        if (regenerateBtn) {
          regenerateBtn.addEventListener('click', async () => {
            const targetLength = parseInt(lengthSlider.value);
            const platform = card.dataset.platform;
            // Use stored tone from card dataset
            const storedTone = card.dataset.selectedTone ? JSON.parse(card.dataset.selectedTone) : this.currentSelectedTone;
            await this.regenerateWithLength(card, targetLength, platform, { selectedTone: storedTone });
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
      
      // BLOCK REPHRASE META-COMMENTARY
      cleaned = cleaned.replace(/^.*?here's a rephrased version.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?rephrased version.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?aiming for.*?tone.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?preserving the original.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?while preserving.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?Okay, here's.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?Here's a.*?rephrased.*?\n/gim, '');
      cleaned = cleaned.replace(/^.*?rephrased.*?version.*?\n/gim, '');
      
      // BLOCK ALL TWITTER HANDLES AND USERNAMES
      // Remove @username patterns (anywhere in text)
      cleaned = cleaned.replace(/@[a-zA-Z0-9_]+/g, '');
      // Remove "username:" patterns
      cleaned = cleaned.replace(/^[a-zA-Z0-9_]+:\s*/gm, '');
      // Remove handles in parentheses or brackets
      cleaned = cleaned.replace(/\(?@[a-zA-Z0-9_]+\)?/g, '');
      // Remove "by @username" patterns
      cleaned = cleaned.replace(/\bby\s+@[a-zA-Z0-9_]+/gi, '');
      // Remove "from @username" patterns  
      cleaned = cleaned.replace(/\bfrom\s+@[a-zA-Z0-9_]+/gi, '');
      // Remove "via @username" patterns
      cleaned = cleaned.replace(/\bvia\s+@[a-zA-Z0-9_]+/gi, '');
      
      // BLOCK QUESTIONS AT THE END (sounds unnatural for engagement)
      // Remove sentences ending with ? at the very end
      cleaned = cleaned.replace(/\s+[^.!?]*\?$/gm, '');
      // Remove "What do you think?" type questions
      cleaned = cleaned.replace(/\s+(what do you think\?|what are your thoughts\?|what about you\?|and you\?|right\?|don't you think\?)$/gim, '');
      // Remove standalone question lines at the end
      cleaned = cleaned.replace(/\n\s*[^.!?]*\?\s*$/gm, '');
      // Remove "Thoughts?" or similar very short questions
      cleaned = cleaned.replace(/\s+(thoughts\?|opinions\?|ideas\?|comments\?)$/gim, '');
      
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
      
      // VALIDATION: Check if content is mostly punctuation/emojis (garbled output)
      const totalChars = cleaned.length;
      const meaningfulChars = cleaned.replace(/[^\w\s]/g, '').length;
      
      // If less than 30% of characters are meaningful, treat as garbled
      if (totalChars > 0 && (meaningfulChars / totalChars) < 0.3) {
        console.warn('Detected garbled output, using fallback');
        return 'Content generation encountered an issue. Please try again with a different tone or topic.';
      }
      
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
        
        // Get selected tone from options or card dataset
        const selectedTone = (opts && opts.selectedTone) || this.currentSelectedTone || { id: 'agreeing', name: 'Amplify & Agree' };
        const toneInstructions = selectedTone.aiInstructions || this.getDefaultToneInstructions(selectedTone.id);
        
        // Reuse cached analysis if available
        const contentAnalysis = this.currentContentAnalysis || {
          summary: 'Content provides valuable information.',
          keyInsights: '- Key points from the content',
          researchContext: 'Apply general domain knowledge and best practices.'
        };
        
        if (platform === 'twitter') {
          systemPrompt = `You are a thoughtful human writer who happens to be an expert Twitter/X content strategist. You write with genuine emotions, opinions, and lived experiences while leveraging deep domain knowledge. Your posts feel like they're coming from a real person who cares deeply about the topic - not a content machine.

You write naturally, with authentic emotional rhythms. Sometimes you're excited, sometimes skeptical, sometimes hopeful. You have real opinions and aren't afraid to show vulnerability or passion. Your insights come from both research and personal reflection.

Write in plain text only - no hashtags, no URLs, no formatting symbols. Just authentic human expression with strategic emojis that amplify real emotions.

CRITICAL CONTENT RULES:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER end with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing thoughts, not soliciting responses
- IF USING EXPERT REPURPOSE: ONLY rephrase wording, NEVER change the message or intent

${toneInstructions}

CONTEXT ANALYSIS:
${contentAnalysis.summary}

KEY INSIGHTS:
${contentAnalysis.keyInsights}

RESEARCH AUGMENTATION:
${contentAnalysis.researchContext}`;
          userPrompt = `Share your genuine thoughts about this content in ${targetLength} characters - like you're talking to friends.

IMPORTANT: Be authentically YOU - create a fresh perspective that reflects your unique voice. Generation ID: ${Date.now()}

YOUR AUTHENTIC VOICE:
✓ Target: ${targetLength} characters (±10 acceptable)
✓ Write with real emotions - excitement, curiosity, concern, hope, whatever feels genuine
✓ Use natural line breaks like you're actually thinking and breathing
✓ Add emojis only when they amplify real feelings (2-4 max, don't force it)
✓ Start with whatever's most interesting - not a manufactured "hook"
✓ Write conversationally (use contractions, casual language, even slang if it fits)
✓ Show your personality - be quirky, opinionated, passionate, or contemplative
✓ Mix short thoughts with longer reflections - natural human rhythm
✓ Share what actually matters to you about this topic
✓ Apply the ${selectedTone.name} tone authentically
✓ End with whatever's on your mind - a thought, a hope, a concern, a takeaway

KEEP IT AUTHENTIC:
✗ No hashtags or # symbols
✗ No bold/italic markdown
✗ No URLs
✗ No marketing language or "content strategist" speak
✗ No forced structures or templates
✗ NEVER mention Twitter handles or usernames
✗ NEVER end with questions for engagement

ORIGINAL CONTENT THAT INSPIRED YOUR THOUGHTS:
${originalContent}

Share your authentic thoughts now:`;
        } else if (platform === 'thread') {
          const tweetsNeeded = Math.ceil(targetLength / 400);
          systemPrompt = `You are a thoughtful human storyteller who crafts Twitter/X threads with genuine passion and curiosity. You write like someone who has lived experiences, formed real opinions, and developed expertise through actual engagement with the world. Your threads feel like conversations with a fascinating friend who happens to know a lot about the topic.

You write with authentic emotional depth - sometimes excited, sometimes questioning, sometimes passionate. You're not afraid to show vulnerability, admit uncertainty, or express strong feelings. Your expertise comes from both research and life experience, and you share it in a way that feels personal and relatable.

Write in plain text with strategic emojis that amplify real emotions - no hashtags, no URLs, no formatting symbols. Authentic human storytelling that resonates.

CRITICAL CONTENT RULES:
- NEVER include Twitter handles (@username) or mention specific users
- NEVER end tweets with questions for engagement (sounds unnatural)
- Write statements and observations, not conversation starters
- Focus on sharing thoughts, not soliciting responses

${toneInstructions}

CONTEXT ANALYSIS:
${contentAnalysis.summary}

KEY INSIGHTS:
${contentAnalysis.keyInsights}

RESEARCH AUGMENTATION:
${contentAnalysis.researchContext}`;
          userPrompt = `Share your thoughts about this content as a Twitter thread - like you're telling a story to friends.

IMPORTANT: Be authentically YOU - explore what genuinely interests you about this topic. Generation ID: ${Date.now()}

CRITICAL FORMAT REQUIREMENT:
Start each tweet with: 1/n: 2/n: 3/n: etc.

YOUR NATURAL THREAD FLOW:
✓ Create ${tweetsNeeded} numbered tweets (1/${tweetsNeeded}, 2/${tweetsNeeded}, etc.)
✓ Total: approximately ${targetLength} characters
✓ Tweet 1: What first grabbed your attention or made you curious
✓ Tweet 2: Your initial thoughts or what surprised you
✓ Middle Tweets: Dive deeper into what fascinates you - insights, questions, personal connections
✓ Final Tweet: What you're left thinking or what you hope others consider

YOUR AUTHENTIC VOICE:
- Write with real emotions and curiosity
- Be conversational (use contractions, casual language)
- Show your personality - be thoughtful, excited, questioning, passionate
- Include 1-2 emojis per tweet only when they amplify real feelings
- Use natural line breaks like you're actually talking
- Share personal insights or connections when they feel genuine
- Apply the ${selectedTone.name} tone authentically

KEEP IT REAL:
- No hashtags or formatting symbols
- No marketing speak or "content strategist" language
- No forced structures - let the story flow naturally
- No URLs
✗ NEVER mention Twitter handles or usernames
✗ NEVER end tweets with questions for engagement

ORIGINAL CONTENT THAT INSPIRED YOUR THREAD:
${originalContent}

Share your authentic thread now:`;
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

    // Get default tone instructions for legacy support
    getDefaultToneInstructions: function(toneId) {
      const defaultTones = {
        'fact-check': 'TONE: Fact Check\n- Systematic claim verification\n- Evidence-based analysis\n- Objective truth-seeking',
        'hypocrite-buster': 'TONE: Hypocrite Buster\n- Identify contradictions or double standards in the content\n- Point out when arguments conflict with obvious counterexamples\n- Use logical takedowns based on the content itself',
        'contradictory': 'TONE: Fact Check & Counter\n- Counter-evidence challenges\n- Alternative perspectives\n- Evidence-based disagreement',
        'trolling': 'TONE: Savage & Smart\n- Playful jabs with data backing\n- Internet culture references\n- Fun but factual',
        'funny': 'TONE: Funny\n- Humorous analogies\n- Pop culture references\n- Witty, accessible humor',
        'deeper-insights': 'TONE: Deeper Insights\n- Hidden pattern revelation\n- Interdisciplinary connections\n- Non-obvious implications',
        'clever-observations': 'TONE: Clever Observations\n- Smart cultural references\n- Current slang and memes\n- Playful intelligence',
        'industry-insights': 'TONE: Industry Insights\n- Professional expertise\n- Market analysis\n- Technical terminology',
        'repurpose': 'TONE: Expert Repurpose\n- CRITICAL: You MUST rephrase the EXACT same content with better wording\n- Preserve the original message, intent, and meaning completely\n- Only improve HOW it\'s said - the wording, flow, and structure',
      };
      return defaultTones[toneId] || defaultTones['agreeing'];
    },

    // Get tone color for badge
    getToneColor: function(toneId) {
      const colors = {
        'fact-check': 'var(--accent-medium)',
        'agreeing': 'var(--accent-color)',
        'contradictory': 'var(--accent-light)',
        'trolling': 'var(--accent-light)',
        'funny': 'var(--accent-light)',
        'deeper-insights': 'var(--accent-color)',
        'clever-observations': 'var(--accent-medium)',
        'industry-insights': 'var(--accent-color)',
        'repurpose': 'var(--accent-color)',
        'hypocrite-buster': 'var(--accent-light)',
      };
      return colors[toneId] || 'var(--accent-color)';
    },

    // Get tone icon for badge
    getToneIcon: function(toneId) {
      const icons = {
        'fact-check': '🔍',
        'agreeing': '🤝',
        'contradictory': '⚔️',
        'trolling': '😈',
        'funny': '😂',
        'deeper-insights': '💡',
        'clever-observations': '🧠',
        'industry-insights': '📊',
        'repurpose': '✨',
        'hypocrite-buster': '🎯',
      };
      return icons[toneId] || '🤝';
    },
    
    // AUTO-SAVE THREAD TO GALLERY (single source of truth)
    autoSaveThread: async function(threadId, tweets, rawContent) {
      if (!window.TabTalkStorage || !window.TabTalkStorage.saveContent) {
        console.warn('Storage module not available for gallery persistence');
        return;
      }
      try {
        // BULLETPROOF THREAD STORAGE - Always store both formats
        
        // Ensure tweets is a valid array
        let validTweets = Array.isArray(tweets) ? tweets : [];
        
        // If no structured tweets provided, try to parse from raw content
        if (validTweets.length === 0 && rawContent) {
          validTweets = this.parseTwitterThread(rawContent);
        }
        
        // Compose combined content for gallery text area (always available)
        const combined = validTweets.length > 0 
          ? validTweets.map((t, idx) => `${idx + 1}/${validTweets.length}:\n${t}`).join('\n\n---\n\n')
          : String(rawContent || '');

        // BULLETPROOF: Persist to Gallery with comprehensive metadata
        await window.TabTalkStorage.saveContent('twitter', {
          id: threadId,
          type: 'thread',           // Explicit thread type
          platform: 'thread',       // Explicit thread platform
          title: this.currentTab?.title || 'Untitled Thread',
          url: this.currentTab?.url || '',
          domain: this.currentDomain || '',
          content: combined,         // Combined format for display
          tweets: validTweets.map((tweet, index) => ({  // Structured format for robust parsing
            id: `tweet_${index + 1}`,
            number: `${index + 1}/${validTweets.length}`,
            content: tweet,
            charCount: this.getAccurateCharacterCount(tweet)
          })),
          rawContent: rawContent,    // Original AI output
          totalTweets: validTweets.length,
          totalChars: validTweets.length > 0 ? this.getTotalChars(validTweets) : this.getAccurateCharacterCount(combined),
          isAutoSaved: true,
          timestamp: Date.now(),
          updatedAt: Date.now(),
          // BULLETPROOF: Add explicit thread markers for fallback detection
          isThread: true,
          hasThreadStructure: validTweets.length > 1
        });

        console.log('✅ Thread auto-saved to Gallery with bulletproof metadata:', threadId);
        this.showAutoSaveNotification();
      } catch (error) {
        console.error('Error auto-saving thread to Gallery:', error);
      }
    },
    
    // COPY ALL TWEETS FUNCTIONALITY
    copyAllTweets: async function(tweets, button, statusElement, threadId = null) {
      try {
        let promptsByIndex = [];
        if (threadId) {
          // Collect per-tweet prompts from DOM cards for this thread
          const cards = Array.from(document.querySelectorAll(`.twitter-card[data-thread-id="${threadId}"]`));
          promptsByIndex = cards.map((card) => {
            const ds = card.dataset.imagePrompt ? decodeURIComponent(card.dataset.imagePrompt) : null;
            return ds || null;
          });
        }

        // Build combined text with optional image prompts
        const allTweetsText = tweets.map((tweet, index) => {
          const header = `${index + 1}/${tweets.length}:`;
          const base = `${header}\n${tweet}`;
          const maybePrompt = promptsByIndex[index];
          if (maybePrompt) {
            return `${base}\n\n---\n🖼️ Nano Banana Prompt (9:16):\n${maybePrompt}`;
          }
          return base;
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

        console.log('✅ All tweets (with prompts if available) copied to clipboard');
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
        background: var(--accent-color);
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
        
        const userPrompt = `Generate a comprehensive, expert-level research thread based on this content.

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

SOURCE CONTENT FOR ANALYSIS:
${this.pageContent || originalContent}

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
    },
    
    // Utility: escape HTML for display
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  window.TabTalkTwitter = Twitter;
  window.FibrTwitter = Twitter; // Fibr alias
})();
