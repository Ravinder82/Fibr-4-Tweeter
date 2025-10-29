// Image Prompt Generator Module: Nano Banana 9:16 super prompt generator
(function() {
  const ImagePromptGenerator = {
    // In-memory cache for generated prompts per contentId
    promptsCache: {},

    init() {
      // No global init needed; called per card
    },

    // Open/generate prompt for a specific card
    async generatePromptForCard(contentId, cardText) {
      if (!contentId || !cardText) {
        console.error('ImagePromptGenerator: contentId or cardText missing');
        return null;
      }

      // Check cache first
      if (this.promptsCache[contentId]) {
        return this.promptsCache[contentId];
      }

      const prompt = await this.callGeminiAPI(this.buildSuperPrompt(cardText));
      if (prompt) {
        this.promptsCache[contentId] = prompt;
      }
      return prompt;
    },

    // Retrieve cached prompt for a contentId (used by save/copy)
    getPromptForContentId(contentId) {
      return this.promptsCache[contentId] || null;
    },

    // Attach generated prompt to card's display and data
    attachPromptToCard(card, contentId, prompt) {
      if (!card || !prompt) return;

      // Store prompt in card dataset for persistence
      card.dataset.imagePrompt = encodeURIComponent(prompt);

      // Update card body to show prompt (below content, before footer)
      const body = card.querySelector('.twitter-card-content');
      if (body) {
        // Remove existing prompt display if present
        const existing = body.querySelector('.image-prompt-display');
        if (existing) existing.remove();

        const promptDisplay = document.createElement('div');
        promptDisplay.className = 'image-prompt-display';
        promptDisplay.innerHTML = `
          <div class="image-prompt-label">🖼️ Nano Banana Prompt (9:16)</div>
          <div class="image-prompt-text">${this.escapeHtml(prompt)}</div>
        `;
        body.appendChild(promptDisplay);
      }
    },

    // Super system prompt for Nano Banana 9:16 image generation
    buildSuperPrompt(cardText) {
      return `You are the world's best image prompt engineer for Google Nano Banana. Your task is to create a single, ultra-detailed prompt for a 9:16 vertical image that perfectly complements this Twitter post content.

CONTENT CONTEXT:
${cardText}

REQUIREMENTS:
- Generate ONLY the final prompt string. No explanations, no options, no commentary.
- Aspect ratio MUST be exactly 9:16 (vertical mobile format).
- Prompt should be visually rich, context-aware, and optimized for Nano Banana's capabilities.
- Include specific lighting, composition, color palette, and mood that matches the content.
- Add negative prompts if needed to improve quality.
- Ensure the image has visual impact and stands out in mobile feeds.
- Include style keywords relevant to the content (e.g., cinematic, photorealistic, illustration, infographic, meme, etc.)
- Focus on clarity and visual storytelling without embedded text.

PROMPT STRUCTURE:
1. Core subject/scene derived from the Twitter content
2. Composition and framing suitable for 9:16 vertical format
3. Lighting and atmosphere
4. Color scheme and style
5. Technical details (quality, rendering style)
6. Negative prompt (if applicable)

STYLE GUIDELINES:
- For data/statistics: clean infographics with clear visual hierarchy
- For tutorials: step-by-step visual narrative or instructional diagrams
- For controversial content: bold, high-contrast visuals with emotional impact
- For products: professional product shots with clean backgrounds
- For AI/tech: futuristic, sleek visuals with technological elements
- For memes: meme-structured templates with clear areas for text overlay

Generate the perfect Nano Banana 9:16 prompt now:`;
    },

    // Call Gemini API (reuse existing TabTalkAPI)
    async callGeminiAPI(prompt) {
      if (window.TabTalkAPI?.callGeminiAPI) {
        try {
          const result = await window.TabTalkAPI.callGeminiAPI(prompt);
          // Clean response to ensure only the prompt is returned
          return this.cleanPromptResponse(result);
        } catch (error) {
          console.error('ImagePromptGenerator: API call failed:', error);
          throw error;
        }
      }
      throw new Error('API not available');
    },

    // Clean API response to extract only the prompt
    cleanPromptResponse(response) {
      if (!response) return '';
      let text = String(response).trim();
      // Remove common AI prefaces and explanations
      text = text.replace(/^(?:Here is|Here's|This is|Below is)[^\n]*:\s*/i, '');
      text = text.replace(/^(?:Okay|Sure|Certainly)[^\n]*\n/i, '');
      // Remove any numbered options or explanations
      text = text.replace(/^\d+\.\s*/gm, '');
      text = text.replace(/^Explanation:.*$/gm, '');
      text = text.replace(/^Note:.*$/gm, '');
      // Ensure it's a single line or properly formatted
      text = text.replace(/\n{3,}/g, '\n\n');
      return text.trim();
    },

    // Utility: escape HTML for display
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Clear cache for a contentId (useful for regeneration)
    clearCacheForContentId(contentId) {
      delete this.promptsCache[contentId];
    },

    // Clear all cache
    clearAllCache() {
      this.promptsCache = {};
    }
  };

  // Expose globally
  window.TabTalkImagePromptGenerator = ImagePromptGenerator;
})();
