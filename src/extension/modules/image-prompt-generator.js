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

    // Expert graphics designer level system prompt for Nano Banana 9:16 image generation
    buildSuperPrompt(cardText) {
      return `You are an award-winning graphics designer and creative director with 15+ years of experience in visual storytelling, branding, and digital art. You have designed for Fortune 500 companies, startups, and viral social media campaigns. Your expertise spans typography, layout theory, color psychology, composition, and visual hierarchy.

Your task is to create a single, ultra-detailed prompt for a 9:16 vertical image that perfectly complements this Twitter post content. This prompt will be used by Google Nano Banana to generate a professional-grade visual.

CONTENT CONTEXT:
${cardText}

DESIGN EXCELLENCE REQUIREMENTS:
- Generate ONLY the final prompt string. No explanations, no options, no commentary.
- Aspect ratio MUST be exactly 9:16 (vertical mobile format optimized for social media).
- Create visually stunning, context-aware graphics that stand out in mobile feeds.
- Apply professional design principles: visual hierarchy, balance, contrast, and flow.
- Include specific typography treatments, color palettes, and compositional guidelines.
- Consider readability, brand consistency, and emotional impact.
- Add negative prompts to ensure professional quality output.

EXPERT DESIGN ELEMENTS TO INCLUDE:
1. **Layout & Composition**: Grid-based design, rule of thirds, visual hierarchy, focal points
2. **Typography**: Font styles, hierarchy (headlines, body text), text treatments, kerning, leading
3. **Color Scheme**: Primary/secondary colors, gradients, psychological color associations
4. **Visual Style**: Photorealistic, illustration, infographic, minimalist, bold, etc.
5. **Graphics & Icons**: Custom icons, illustrations, data visualizations, decorative elements
6. **Text Integration**: How text interacts with images, overlay techniques, readability
7. **Lighting & Atmosphere**: Mood lighting, shadows, depth, dimension
8. **Technical Quality**: Resolution, rendering style, post-processing effects

CONTENT-SYPE DESIGN STRATEGIES:
- **Data/Statistics**: Clean infographics with clear data visualization, charts, graphs
- **Tutorials**: Step-by-step visual guides with numbered steps, icons, progress indicators
- **Controversial Content**: Bold typography, high-contrast colors, impactful imagery
- **Products**: Lifestyle shots, clean backgrounds, feature highlights, benefit visualization
- **AI/Tech**: Futuristic aesthetics, circuit patterns, holographic elements, sleek interfaces
- **Business/Finance**: Professional charts, growth visualizations, trust indicators
- **Health/Wellness**: Calming colors, organic shapes, inspirational imagery

ADVANCED PROMPT STRUCTURE:
1. Primary visual concept and subject matter
2. Layout composition and framing (9:16 optimized)
3. Typography hierarchy and text treatment
4. Color palette and psychological associations
5. Graphic elements and visual metaphors
6. Lighting, atmosphere, and mood
7. Technical specifications and rendering style
8. Negative prompts for quality control

PROFESSIONAL FORMATTING GUIDELINES:
- Use design terminology: "leading", "kerning", "visual hierarchy", "negative space"
- Specify composition: "golden ratio", "rule of thirds", "symmetrical balance"
- Include color specifics: "monochromatic with accent", "complementary colors", "gradient overlay"
- Define typography: "sans-serif headline", "body text readability", "text hierarchy"
- Add rendering details: "photorealistic", "vector illustration", "3D rendering", "cinematic lighting"

Generate the expert-level graphics design prompt now:`;
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
