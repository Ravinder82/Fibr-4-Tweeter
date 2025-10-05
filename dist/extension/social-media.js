(function() {
  const SocialMedia = {
    /**
     * Generate LinkedIn Post - Professional engagement-optimized content
     */
    generateLinkedInPost: async function(targetLength = null) {
      if (!this.pageContent || !this.apiKey) {
        this.addMessage('assistant', '❌ Please set up your Gemini API key first and ensure page content is loaded.');
        return;
      }

      this.setLoading(true, 'Generating LinkedIn post...');
      console.log('TabTalk AI: Generating LinkedIn Post for page:', this.currentTab?.title);

      try {
        this.showProgressBar('Crafting professional LinkedIn post...');

        // Length constraint guidance
        let lengthGuidance = '500-1500 characters optimal (you can go up to 3000)';
        if (targetLength) {
          const tolerance = Math.round(targetLength * 0.15); // 15% tolerance
          lengthGuidance = `TARGET LENGTH: ${targetLength} characters (±${tolerance} is acceptable). Adjust content density to hit this target.`;
        }

        const systemPrompt = `You are a LinkedIn content strategist specializing in professional posts that drive engagement. You understand LinkedIn's algorithm and what makes content perform well.

YOUR EXPERTISE:
- Hook-driven openings that stop the scroll
- Value-first content that educates or inspires
- Professional yet conversational tone
- Strategic use of line breaks for readability
- Thought-provoking questions that encourage comments

LINKEDIN BEST PRACTICES:
- First 2 lines are critical (preview text)
- Use line breaks every 1-2 sentences
- ${lengthGuidance}
- NO hashtags unless specifically requested
- NO emojis unless they add professional value
- End with a question or call-to-thought

YOUR TASK: Transform the content into a professional LinkedIn post.

STRUCTURE:
**Hook** (1-2 lines) - Attention-grabbing opening
[Line break]
**Context** (2-3 lines) - Set up the value
[Line break]
**Value/Insight** (3-5 lines) - Core message with insights
[Line break]
**Takeaway** (1-2 lines) - Key lesson or implication
[Line break]
**Engagement Question** - Thought-provoking question to drive comments

TONE: Professional but conversational. Thought leadership. Authentic.`;

        const userPrompt = `Transform this content into an engagement-optimized LinkedIn post:\n\n${this.pageContent}\n\nCreate a post that will resonate with professionals and drive meaningful engagement.`;

        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          console.log('TabTalk AI: LinkedIn Post generated, length:', response.length);
          const cleanedResponse = this.cleanSocialContent(response, 'linkedin');
          
          // Add as Twitter-style card with length control
          this.addLinkedInCard(cleanedResponse);

          if (this.addToHistory) {
            const record = {
              timestamp: new Date().toISOString(),
              url: this.currentTab?.url || '',
              title: this.currentTab?.title || '',
              domain: this.currentDomain || '',
              content: cleanedResponse,
              type: 'linkedin'
            };
            await this.addToHistory('linkedin', record);
          }

          this.hideProgressBar();
        }
      } catch (error) {
        console.error('Error generating LinkedIn Post:', error);
        this.addMessage('assistant', `❌ Error generating LinkedIn post: ${error.message}`);
        this.hideProgressBar();
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Generate Email Summary - Professional email draft for sharing content
     */
    generateEmailSummary: async function(context = 'colleague', targetLength = null) {
      if (!this.pageContent || !this.apiKey) {
        this.addMessage('assistant', '❌ Please set up your Gemini API key first and ensure page content is loaded.');
        return;
      }

      this.setLoading(true, 'Drafting email summary...');
      console.log('TabTalk AI: Generating Email Summary for page:', this.currentTab?.title);

      try {
        // Show progress bar (Twitter-style)
        this.showProgressBar('Creating professional email draft...');

        // Context-specific guidance
        let contextGuidance = '';
        let toneGuidance = '';
        let closingStyle = '';

        switch(context) {
          case 'colleague':
            contextGuidance = 'sharing valuable information with a colleague';
            toneGuidance = 'Professional but friendly. Conversational.';
            closingStyle = 'Let me know your thoughts!';
            break;
          case 'client':
            contextGuidance = 'sharing relevant insights with a client';
            toneGuidance = 'Professional and polished. Client-facing.';
            closingStyle = 'I\'d be happy to discuss this further.';
            break;
          case 'manager':
            contextGuidance = 'sharing important information with your manager';
            toneGuidance = 'Professional and concise. Executive-ready.';
            closingStyle = 'Please let me know if you need additional details.';
            break;
          case 'team':
            contextGuidance = 'sharing with your team';
            toneGuidance = 'Collaborative and action-oriented.';
            closingStyle = 'Looking forward to your input on this.';
            break;
          default:
            contextGuidance = 'sharing interesting content';
            toneGuidance = 'Professional and clear.';
            closingStyle = 'Thought you might find this interesting.';
        }

        // Length constraint guidance
        let lengthGuidance = 'Keep total length 150-300 words';
        if (targetLength) {
          const wordEstimate = Math.round(targetLength / 5.5); // ~5.5 chars per word average
          const tolerance = Math.round(wordEstimate * 0.15);
          lengthGuidance = `TARGET LENGTH: approximately ${wordEstimate} words (${targetLength} characters, ±${tolerance} words acceptable)`;
        }

        const systemPrompt = `You are a professional email writer specializing in clear, effective communication. You help people share valuable content efficiently.

CONTEXT: You're ${contextGuidance}.

YOUR TASK: Create a professional email draft that:
1. Has a compelling, specific subject line
2. Opens with brief context (why you're sharing)
3. Summarizes key points in scannable format
4. Ends with appropriate call-to-action or closing

TONE: ${toneGuidance}

EMAIL STRUCTURE:
**Subject:** [Specific, compelling subject line - 50 chars max]

Hi [Name],

[Opening - 1-2 sentences setting context]

[Key Points - 3-5 bullet points with the most important information]

[Closing - 1-2 sentences with takeaway and next step]

[Appropriate sign-off]

REQUIREMENTS:
- Subject line must be specific and actionable
- ${lengthGuidance}
- Use bullet points for scannability
- Include estimated reading time for linked content
- Make it immediately useful`;

        const userPrompt = `Create an email draft for ${contextGuidance} based on this content:\n\n${this.pageContent}\n\nMake it professional, concise, and immediately useful.`;

        const response = await this.callGeminiAPIWithSystemPrompt(systemPrompt, userPrompt);
        
        if (response) {
          console.log('TabTalk AI: Email Summary generated, length:', response.length);
          const cleanedResponse = this.cleanEmailContent(response);
          
          // Add as Twitter-style card with length control
          this.addEmailCard(cleanedResponse, context);

          if (this.addToHistory) {
            const record = {
              timestamp: new Date().toISOString(),
              url: this.currentTab?.url || '',
              title: this.currentTab?.title || '',
              domain: this.currentDomain || '',
              content: cleanedResponse,
              type: 'email',
              context: context
            };
            await this.addToHistory('communication', record);
          }

          this.hideProgressBar();
        }
      } catch (error) {
        console.error('Error generating Email Summary:', error);
        this.addMessage('assistant', `❌ Error generating email: ${error.message}`);
        this.hideProgressBar();
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Clean social media content (Twitter-style comprehensive cleaning)
     */
    cleanSocialContent: function(content, platform) {
      if (!content) return '';
      
      let cleaned = content.trim();
      
      // CRITICAL: Remove AI meta-commentary and prefaces (AGGRESSIVE MULTI-LINE REMOVAL)
      
      // Remove "Okay, here's..." patterns (new AI behavior)
      cleaned = cleaned.replace(/^(?:Okay,?\s+)?(?:Here'?s?\s+a\s+\w+\s+post\s+draft[^:\n]*:\s*)/im, '');
      cleaned = cleaned.replace(/^(?:Okay,?\s+)?(?:Here'?s?\s+a\s+professional\s+\w+\s+post[^:\n]*:\s*)/im, '');
      cleaned = cleaned.replace(/^(?:Okay,?\s+)?(?:Here'?s?\s+a\s+\w+\s+post[^:\n]*(?:designed|optimized|aligned)[^:\n]*:\s*)/im, '');
      
      // Remove structured format labels (Hook:, Context:, Value:, etc.)
      cleaned = cleaned.replace(/^(?:Hook|Context|Value\/Insight|Value|Insight|Takeaway|Engagement Question|Call to Action|CTA):\s*/gim, '');
      
      // Remove "optimized for engagement" and similar
      cleaned = cleaned.replace(/,?\s*optimized for (?:engagement|reach|visibility)[^:\n]*[,\s]*/gi, '');
      cleaned = cleaned.replace(/,?\s*aligned with (?:my|your) (?:expertise|brand|voice)[^:\n]*[,\s]*/gi, '');
      
      // Remove standard AI prefaces
      cleaned = cleaned.replace(/^(?:Here\s+(?:is|are)|Below\s+(?:is|are)|Certainly[,!]?|Sure[,!]?)\s+[^:\n]*:\s*/im, '');
      
      // Remove "based on the provided information" and similar phrases
      cleaned = cleaned.replace(/,?\s*based on the (?:provided|given|above) (?:information|content|article)[:\s]*/gi, '');
      cleaned = cleaned.replace(/,?\s*designed to (?:capture attention|spark conversation|drive engagement)[^:\n]*[:\s]*/gi, '');
      
      // Remove any remaining single-word labels followed by colon at start of lines
      cleaned = cleaned.replace(/^\w+:\s*/gm, (match) => {
        // Only remove if it's a structural label, not part of content
        const labels = ['hook', 'context', 'value', 'insight', 'takeaway', 'question', 'cta', 'action', 'opening', 'body', 'closing'];
        if (labels.includes(match.toLowerCase().replace(':', '').trim())) {
          return '';
        }
        return match;
      });
      
      // CRITICAL: Remove all # hashtag symbols
      cleaned = cleaned.replace(/#\w+/g, ''); // Remove hashtags like #example
      cleaned = cleaned.replace(/#/g, ''); // Remove remaining # symbols
      
      // CRITICAL: Remove all * asterisk symbols (markdown formatting)
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove **bold**
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove *italic*
      cleaned = cleaned.replace(/\*{2,}/g, ''); // Remove multiple asterisks
      
      // Remove underscores (markdown formatting)
      cleaned = cleaned.replace(/_{2,}([^_]+)_{2,}/g, '$1'); // Remove __bold__
      cleaned = cleaned.replace(/_([^_]+)_/g, '$1'); // Remove _italic_
      cleaned = cleaned.replace(/_{2,}/g, ''); // Remove multiple underscores
      
      // CRITICAL: Remove [line break] and (line break) placeholders
      cleaned = cleaned.replace(/\(line break\)/gi, '\n');
      cleaned = cleaned.replace(/\[line break\]/gi, '\n');
      
      // Normalize bullet points
      cleaned = cleaned.replace(/^[ \t]*[-*]\s+/gm, '• ');
      
      // Collapse excessive blank lines
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      
      // Remove excessive spaces
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
      
      // Remove markdown headers
      cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
      
      // Remove square brackets from text
      cleaned = cleaned.replace(/\[([^\]]+)\]/g, '$1');
      
      // Remove parentheses with formatting instructions
      cleaned = cleaned.replace(/\(([^)]+)\)/g, (match, p1) => {
        if (p1.includes('emphasis') || p1.includes('bold') || p1.includes('italic') || p1.includes('line break')) {
          return '';
        }
        return match;
      });
      
      // SPACING: Add proper spacing for readability
      // Add spacing after bullet points
      cleaned = cleaned.replace(/(•[^\n]+)\n(?!•|\n)/g, '$1\n\n');
      
      // Add spacing between distinct sections (paragraph breaks)
      cleaned = cleaned.replace(/([.!?])\n(?=[A-Z])/g, '$1\n\n');
      
      // Final cleanup
      cleaned = cleaned.replace(/(^|\n)\s*$/g, '').replace(/\n{3,}/g, '\n\n');
      
      return cleaned.trim();
    },

    /**
     * Clean email content (Twitter-style comprehensive cleaning)
     */
    cleanEmailContent: function(content) {
      if (!content) return '';
      
      let cleaned = content.trim();
      
      // CRITICAL: Remove AI meta-commentary and prefaces
      cleaned = cleaned.replace(/^(?:Here'?s?\s+an?\s+email\s+draft[^:\n]*:\s*)/i, '');
      cleaned = cleaned.replace(/^(?:Here'?s?\s+a\s+professional\s+email[^:\n]*:\s*)/i, '');
      cleaned = cleaned.replace(/^(?:Here\s+(?:is|are)|Below\s+(?:is|are)|Certainly[,!]?|Sure[,!]?)\s+[^:\n]*:\s*/i, '');
      cleaned = cleaned.replace(/,?\s*based on the (?:provided|given|above) (?:information|content|article)[:\s]*/gi, '');
      
      // CRITICAL: Remove all # hashtag symbols
      cleaned = cleaned.replace(/#\w+/g, '');
      cleaned = cleaned.replace(/#/g, '');
      
      // CRITICAL: Remove all * asterisk symbols
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
      cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
      cleaned = cleaned.replace(/\*{2,}/g, '');
      
      // Remove underscores
      cleaned = cleaned.replace(/_{2,}([^_]+)_{2,}/g, '$1');
      cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
      cleaned = cleaned.replace(/_{2,}/g, '');
      
      // CRITICAL: Remove [line break] placeholders
      cleaned = cleaned.replace(/\(line break\)/gi, '\n');
      cleaned = cleaned.replace(/\[line break\]/gi, '\n');
      
      // Normalize bullet points
      cleaned = cleaned.replace(/^[ \t]*[-*]\s+/gm, '• ');
      
      // Collapse excessive blank lines
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      
      // Remove excessive spaces
      cleaned = cleaned.replace(/[ \t]+/g, ' ');
      
      // Remove markdown headers
      cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
      
      // Remove square brackets from text (except placeholders)
      cleaned = cleaned.replace(/\[([^\]]+)\]/g, (match, p1) => {
        if (p1.includes('Name') || p1.includes('Recipient') || p1.includes('Your')) {
          return match; // Keep name placeholders
        }
        return p1;
      });
      
      // Remove parentheses with formatting instructions
      cleaned = cleaned.replace(/\(([^)]+)\)/g, (match, p1) => {
        if (p1.includes('emphasis') || p1.includes('bold') || p1.includes('italic') || p1.includes('line break')) {
          return '';
        }
        return match;
      });
      
      // SPACING: Add proper spacing for readability
      // Add spacing after bullet points
      cleaned = cleaned.replace(/(•[^\n]+)\n(?!•|\n)/g, '$1\n\n');
      
      // Add spacing between distinct sections (paragraph breaks)
      cleaned = cleaned.replace(/([.!?])\n(?=[A-Z])/g, '$1\n\n');
      
      // Final cleanup
      cleaned = cleaned.replace(/(^|\n)\s*$/g, '').replace(/\n{3,}/g, '\n\n');
      
      return cleaned.trim();
    },

    /**
     * Add LinkedIn card with Twitter-style UI and length control
     */
    addLinkedInCard: function(content) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container';
      
      const card = this.createSocialCard(content, 'LinkedIn Post', 'linkedin');
      contentContainer.appendChild(card);
      
      this.messagesContainer.appendChild(contentContainer);
      setTimeout(() => {
        this.messagesContainer.scrollTo({
          top: this.messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    },

    /**
     * Add Email card with Twitter-style UI and length control
     */
    addEmailCard: function(content, context) {
      const contentContainer = document.createElement('div');
      contentContainer.className = 'twitter-content-container';
      
      const card = this.createSocialCard(content, 'Email Summary', 'email', context);
      contentContainer.appendChild(card);
      
      this.messagesContainer.appendChild(contentContainer);
      setTimeout(() => {
        this.messagesContainer.scrollTo({
          top: this.messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    },

    /**
     * Create social media card following Twitter card pattern
     */
    createSocialCard: function(content, cardTitle, platform, context = null) {
      const card = document.createElement('div');
      card.className = 'twitter-card';
      
      // Determine if this platform needs length control
      const needsLengthControl = (platform === 'linkedin' || platform === 'email');
      const charCount = this.getAccurateCharacterCount ? this.getAccurateCharacterCount(content) : content.length;
      
      let controlsHTML = '';
      if (needsLengthControl) {
        const maxLength = platform === 'linkedin' ? 3000 : 500;
        const minLength = platform === 'linkedin' ? 500 : 150;
        
        controlsHTML = `
          <div class="twitter-controls">
            <div class="twitter-length-control">
              <label class="length-label">Target Length:</label>
              <input type="range" class="length-slider" min="${minLength}" max="${maxLength}" value="${Math.max(minLength, charCount)}" step="50">
              <span class="length-display">${Math.max(minLength, charCount)}</span>
              <button class="regenerate-btn" title="Regenerate with new length">🔄</button>
            </div>
            <div class="twitter-char-count">${charCount} characters</div>
          </div>
        `;
      }
      
      card.innerHTML = `
        <div class="twitter-card-header">
          <span class="twitter-card-title">${cardTitle}</span>
          <div class="twitter-header-actions">
            <button class="twitter-action-btn copy-btn" title="Copy content" aria-label="Copy content">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="twitter-card-content">
          <textarea class="twitter-text" placeholder="Edit your content...">${content}</textarea>
          ${controlsHTML}
        </div>
      `;
      
      // Add save button
      if (window.TabTalkUI && window.TabTalkUI.addSaveButtonToCard) {
        const contentData = {
          id: Date.now().toString(),
          content: content,
          title: cardTitle,
          context: context
        };
        const actionsContainer = card.querySelector('.twitter-header-actions');
        if (actionsContainer) {
          window.TabTalkUI.addSaveButtonToCard(actionsContainer, platform, contentData);
        }
      }
      
      // Copy button functionality
      const copyBtn = card.querySelector('.copy-btn');
      const textArea = card.querySelector('.twitter-text');
      const originalCopyIcon = copyBtn.innerHTML;
      
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(textArea.value);
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`;
          copyBtn.classList.add('success');
          setTimeout(() => {
            copyBtn.innerHTML = originalCopyIcon;
            copyBtn.classList.remove('success');
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
      });
      
      // Auto-resize textarea
      const autoResizeTextarea = () => {
        textArea.style.height = 'auto';
        textArea.style.height = Math.max(80, textArea.scrollHeight) + 'px';
      };
      setTimeout(autoResizeTextarea, 0);
      
      textArea.addEventListener('input', () => {
        autoResizeTextarea();
        if (needsLengthControl) {
          const charCountEl = card.querySelector('.twitter-char-count');
          const length = this.getAccurateCharacterCount ? this.getAccurateCharacterCount(textArea.value) : textArea.value.length;
          charCountEl.textContent = `${length} characters`;
        }
      });
      
      // Length control and regenerate functionality
      if (needsLengthControl) {
        const lengthSlider = card.querySelector('.length-slider');
        const lengthDisplay = card.querySelector('.length-display');
        const regenerateBtn = card.querySelector('.regenerate-btn');
        
        lengthSlider.addEventListener('input', () => {
          lengthDisplay.textContent = lengthSlider.value;
        });
        
        card.dataset.originalContent = this.pageContent;
        card.dataset.platform = platform;
        card.dataset.context = context || '';
        
        regenerateBtn.addEventListener('click', async () => {
          const targetLength = parseInt(lengthSlider.value);
          await this.regenerateSocialContent(card, targetLength, platform, context);
        });
      }
      
      return card;
    },

    /**
     * Regenerate social content with new length
     */
    regenerateSocialContent: async function(card, targetLength, platform, context = null) {
      const textArea = card.querySelector('.twitter-text');
      const regenerateBtn = card.querySelector('.regenerate-btn');
      
      regenerateBtn.disabled = true;
      regenerateBtn.textContent = '⏳';
      
      try {
        console.log(`TabTalk AI: Regenerating ${platform} with target length: ${targetLength}`);
        
        if (platform === 'linkedin') {
          await this.generateLinkedInPost(targetLength);
        } else if (platform === 'email') {
          await this.generateEmailSummary(context || 'colleague', targetLength);
        }
      } catch (error) {
        console.error('Error regenerating content:', error);
      } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.textContent = '🔄';
      }
    },

    /**
     * Show progress bar (Twitter-style implementation)
     */
    showProgressBar: function(message) {
      // Remove any existing progress bar
      this.hideProgressBar();
      
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      progressContainer.id = 'social-progress';
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
      
      // Animate progress bar
      setTimeout(() => {
        const fill = progressContainer.querySelector('.progress-fill');
        if (fill) fill.style.width = '100%';
      }, 100);
    },

    /**
     * Hide progress bar
     */
    hideProgressBar: function() {
      const existingProgress = document.getElementById('social-progress');
      if (existingProgress) existingProgress.remove();
    }
  };

  window.TabTalkSocialMedia = SocialMedia;
})();
