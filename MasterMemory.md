# MasterMemory - Fibr Project Knowledge Base

**Project:** Fibr - AI-Powered Twitter Content Generator  
**Version:** 2.0.0  
**Type:** Chrome Extension (Manifest V3)  
**License:** Apache-2.0  
**Last Updated:** 2025-01-XX (Shuffle tone card update)

---

## 🎯 PROJECT ESSENCE

Fibr is a Chrome extension that uses Google Gemini 2.0 Flash API to generate Twitter/X content from any webpage. Generates tweets, threads, reposts, and comments using 11 tone presets. Built with vanilla JavaScript (zero runtime dependencies), modular IIFE architecture, intelligent content sanitization, and robust retry logic with exponential backoff.

---

## 📁 CRITICAL FILE LOCATIONS

### Core Files
- **Service Worker:** `src/extension/background.js` - API calls, retry logic, rate limiting
- **Content Script:** `src/extension/content.js` - Webpage content extraction (IIFE wrapped)
- **Popup Entry:** `src/extension/popup.js` - Main UI logic (bundled via esbuild)
- **Popup HTML:** `src/extension/popup.html` - UI structure
- **Manifest:** `src/extension/manifest.json` - Extension configuration (V3)
- **Styles:** `popup.css` - Glassmorphism UI (5,700+ lines)

### Key Modules (`src/extension/modules/`)
- **`twitter.js`** (3,014 lines) - Main generation engine, 11 tones, caching, sanitization
- **`api.js`** - API wrapper with retry logic
- **`storage.js`** - Chrome Storage API wrapper
- **`gallery.js`** - Content gallery (50-item limit, virtual scrolling)
- **`repost-modal.js`** - Repost modal (5 reply tones)
- **`comments-modal.js`** - Comments modal (2 tones)
- **`thread-generator.js`** - Custom topic threads with AI knowledge base
- **`tone-selector.js`** - Tone selection UI
- **`navigation.js`** - View switching logic
- **`ui-render.js`** - DOM manipulation utilities
- **`validation.js`** - API key validation (5-min cache)

### Build Output
- **Extension Build:** `dist/extension/` - Load this folder in Chrome
- **Build Command:** `npm run build:extension`

---

## 🏗️ ARCHITECTURE PATTERNS

### Module System
- **Pattern:** IIFE (Immediately Invoked Function Expressions)
- **Loading:** Dynamic prototype augmentation
- **Isolation:** Each module wrapped in `(function() { ... })();`
- **Exposure:** `window.ModuleName = ModuleName;`

### Data Flow
```
User Action → Popup UI → Module Handler → API Module → Background Script → Gemini API
                                                           ↓
                                                      Response Processing
                                                           ↓
                                              Content Sanitization & Formatting
                                                           ↓
                                              UI Rendering (Cards/Threads)
                                                           ↓
                                              Storage (Optional Gallery Save)
```

### View System
- **Views:** welcome, api-setup, chat, gallery, settings, privacy
- **Navigation:** `showView(viewName)` - Hide all, show target
- **State:** Managed in Chrome Storage Local API

### Storage Keys
- `geminiApiKey` - User API key
- `apiKeySet` - Boolean flag
- `hasSeenWelcome` - Onboarding state
- `theme` - Theme preference (light/dark)
- `chatHistory_${domain}` - Per-domain history
- `savedContent` - Gallery items (array, max 50)
- `savedThreads` - Legacy (migrated to gallery)

---

## 🔧 TECHNICAL SPECIFICATIONS

### Dependencies
- **Runtime:** Zero (vanilla JavaScript)
- **Dev:** esbuild (^0.19.12), knip (^5.27.0), sharp (^0.33.5)

### API Details
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/`
- **Primary Model:** `gemini-2.0-flash:generateContent`
- **Fallback Model:** `gemini-1.5-flash:generateContent`
- **Rate Limits:** 15 req/min, 1500/day (free tier)

### Browser APIs
- `chrome.runtime` - Message passing (popup ↔ background)
- `chrome.storage.local` - Persistent storage
- `chrome.scripting` - Content script injection
- `chrome.tabs` - Tab information

### Manifest Permissions
```json
["activeTab", "scripting", "storage", "tabs"]
```

---

## 🎨 FEATURE MATRIX

### Content Generation (5 Types)
1. **Post** - Single tweets, 6 tones, custom mixing, 50-2000 chars
2. **Repost** - Reply generation, 5 tones, optional image prompts
3. **Comments** - Strategic comments, 2 tones (Praise/Ask)
4. **Thread (Page)** - Multi-tweet threads from webpage content
5. **Thread (Custom)** - Custom topic threads with AI knowledge base

### Tone Presets
- **Post Tones (6):** Funny, Deeper Insights, Clever Observations, Industry Insights, Expert Repurpose, Shuffle
- **Reply Tones (5):** Fact Check, Amplify & Agree, Fact Check & Counter, Savage & Smart, Hypocrite Buster
- **Comment Tones (2):** Praise, Ask
- **Custom Mixing:** Combine any two tones

### UI Features
- Glassmorphism design with backdrop blur
- Dark/light theme toggle
- 400x600px popup default size
- Virtual scrolling for gallery
- Progress indicators and toast notifications

---

## 💻 CODE PATTERNS & CONVENTIONS

### 1. Module Pattern (IIFE)
```javascript
(function() {
  const ModuleName = {
    method: function() { /* ... */ }
  };
  window.ModuleName = ModuleName;
})();
```

### 2. Prototype Augmentation
```javascript
// In popup.js after DOMContentLoaded
window.TabTalkAPI && Object.assign(l.prototype, window.TabTalkAPI);
window.TabTalkTwitter && Object.assign(l.prototype, window.TabTalkTwitter);
```

### 3. Defensive Programming
```javascript
if (this.pageContent && this.pageContent.length > 0) {
  // proceed
} else {
  // fallback with error handling
}
```

### 4. Retry Logic (Exponential Backoff)
```javascript
const baseDelay = Math.min(16000, 1000 * Math.pow(2, attempt));
const jitter = baseDelay * 0.25 * Math.random();
const delay = baseDelay + jitter;
// Retry on: 503, 500, UNAVAILABLE
// Don't retry on: 429 (rate limit - show user message)
```

### 5. Content Sanitization Pipeline
```javascript
ContentSanitizer.cleanDOM(element)
  → ContentSanitizer.cleanText(text)
  → ContentSanitizer.prepareForAI(text, maxLength=8000)
```

### 6. Caching Strategy
- **Analysis Cache:** 30-minute TTL (`twitter.js`)
- **Validation Cache:** 5-minute TTL (`validation.js`)
- **Storage:** Chrome Storage Local API (persistent)

### 7. Service Worker Communication
```javascript
chrome.runtime.sendMessage({
  action: 'callGeminiAPI',
  payload: { contents: conversation },
  apiKey: this.apiKey
}, response => {
  if (response.success) { /* handle */ }
});
```

### 8. Content Extraction (Multi-Strategy)
1. Site-specific (Twitter/X status pages)
2. Article element (`main article`, `article`)
3. Content selectors (`.post-content`, `.article-content`)
4. Largest text container
5. Full body (last resort)

---

## 🚀 DEVELOPMENT WORKFLOW

### Setup
```bash
npm install                    # Install dev dependencies
npm run build:extension       # Build extension
# Load dist/extension/ in Chrome (chrome://extensions/)
```

### Development
```bash
npm run dev:extension         # Watch mode (auto-rebuild)
npm run build:extension      # Manual build
npm test                      # Run test suite
npm run knip                  # Dead code detection
```

### File Modification
1. Edit files in `src/extension/`
2. Run build command
3. Reload extension in Chrome (`chrome://extensions/` → reload icon)

### Testing
- Test files: `tests/twitter-helpers.test.js`, `tests/structured-helpers.test.js`, `tests/navigation-helpers.test.js`
- Run: `npm test`

---

## ⚠️ CRITICAL KNOWLEDGE

### Error Handling
- **Extension Context Invalidation:** Common during dev reloads - handle gracefully
- **Rate Limits:** 429 errors return `{ rateLimited: true, retryAfter: ms }`
- **Network Errors:** Retry with exponential backoff (max 3 attempts)
- **API Errors:** Parse error JSON, provide user-friendly messages

### Content Extraction
- **Twitter/X:** Extract main tweet only (not replies/timeline)
- **Content Limit:** Truncate at 8000 chars with intelligent cutoff
- **Sanitization:** Remove scripts, ads, navigation, engagement metrics
- **Site Detection:** Automatic (news, blogs, docs, forums, ecommerce)

### API Optimization
- **Request Scheduler:** Prevents duplicate concurrent calls
- **Caching:** Analysis (30min), Validation (5min)
- **Image Prompts:** Manual only (not automatic) to save API calls
- **Topic Enhancer:** Disabled (was causing extra API calls)

### Character Counting
- **Unicode-Aware:** Use `[...text].length` for grapheme-aware counting
- **Twitter Limit:** 280 characters (Unicode-aware)
- **Range:** 50-2000 characters for generation

### UI State Management
- **Views:** Hidden/show with `.hidden` class
- **Loading:** `setLoading(true/false)` with status text
- **Progress:** `showProgressBar(message)` / `hideProgressBar()`
- **Toast:** `showToast(message, duration)`

---

## 🔍 QUICK REFERENCE

### Finding Code
- **Twitter Generation:** `src/extension/modules/twitter.js` (line 1-3014)
- **API Calls:** `src/extension/background.js` (line 113-224)
- **Content Extraction:** `src/extension/content.js` (line 186-225)
- **Storage Operations:** `src/extension/modules/storage.js`
- **View Navigation:** `src/extension/modules/navigation.js`

### Common Tasks
- **Add New Tone:** Modify `twitter.js` tone definitions
- **Change UI:** Edit `popup.html` and `popup.css`
- **Add Feature:** Create new module in `src/extension/modules/`
- **Fix API Error:** Check `background.js` retry logic
- **Debug Content:** Check `content.js` sanitization pipeline

### Known Issues
- Some modules reference "TabTalkAI" (legacy naming)
- `topic-enhancer.js` disabled but code present
- Large files: `twitter.js` (3,014 lines), `popup.css` (5,700+ lines)
- No TypeScript/JSDoc type annotations

---

## 📊 IMPORTANT CONSTANTS

### Cache TTLs
- Analysis Cache: `30 * 60 * 1000` (30 minutes)
- Validation Cache: `5 * 60 * 1000` (5 minutes)

### Content Limits
- Max Content Length: `8000` characters
- Gallery Max Items: `50`
- Character Range: `50-2000` (generation)

### Retry Configuration
- Max Attempts: `3`
- Base Delays: `1s, 2s, 4s, 8s, 16s` (exponential)
- Max Delay: `16000ms`
- Jitter: `25%` random variation

### UI Dimensions
- Popup Size: `400x600px`
- Theme: Light (default), Dark (optional)

---

## 🎯 IMPROVEMENT PRIORITIES

### High Priority
1. Test coverage enhancement (content sanitization, API retry logic)
2. Error boundary implementation (module loading, API parsing)
3. Performance optimization (code splitting, tree shaking)
4. API rate limiting client (proactive queue management)

### Medium Priority
5. Content quality improvements (A/B testing, feedback system)
6. Accessibility enhancements (keyboard nav, screen readers)
7. Analytics & monitoring (error tracking, performance)
8. Internationalization (i18n support)

### Low Priority
9. Advanced features (batch generation, scheduled posting)
10. Documentation improvements (API docs, tutorials)
11. Build system enhancements (source maps, CI/CD)
12. Security audit (API key storage, CSP review)

---

## 🔐 SECURITY NOTES

- **API Keys:** Stored in Chrome Storage Local API (encrypted by browser)
- **No External Tracking:** Zero analytics, no third-party services
- **Direct API Calls:** All requests go directly to Google Gemini API
- **Permissions:** Minimal (activeTab, scripting, storage, tabs)
- **Content Security:** XSS prevention via sanitization pipeline

---

## 📝 FILE NAMING CONVENTIONS

- **Modules:** `kebab-case.js` (e.g., `repost-modal.js`)
- **Views:** `{view-name}-view` (e.g., `chat-view`, `gallery-view`)
- **Storage Keys:** `camelCase` (e.g., `geminiApiKey`)
- **CSS Classes:** `kebab-case` (e.g., `quick-actions-container`)

---

## 🧪 TESTING STRATEGY

- **Test Files:** `tests/` directory
- **Test Runner:** `tests/run-all.js`
- **Coverage Areas:** Twitter helpers, structured helpers, navigation helpers
- **Missing Tests:** Content sanitization, API retry logic, character counting

---

## 🔄 VERSION HISTORY

- **2.0.0** - Current version (rebranded from TabTalkAI)
- Manifest V3 migration complete
- API optimization implemented
- Gallery system with virtual scrolling
- 11 tone presets system

---

**Memory Version:** 1.0  
**Optimized For:** AI Code Assistance & Quick Reference  
**Maintained By:** Fibr Team

