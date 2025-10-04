# 🦊 TabTalk AI - Chrome Extension

**AI-Powered Webpage Analysis & Twitter Content Generation**

TabTalk AI is a sophisticated Chrome extension that enables intelligent conversations with webpage content using Google's Gemini 2.0 Flash model. Featuring a beautiful glassmorphism design, it specializes in creating clean, professional Twitter/X posts and threads ready for immediate copy-paste use.

## ✨ Features

### 🤖 **AI-Powered Content Analysis**
- **Intelligent Conversations**: Chat with any webpage content using Gemini 2.0 Flash
- **Smart Content Extraction**: Works with news sites, blogs, documentation, forums, and e-commerce
- **Context-Aware Responses**: AI understands and analyzes webpage context

### 🐦 **Twitter Content Generation**
- **Twitter/X Posts**: Generate single tweets (50-2000 characters) optimized for engagement
- **No Hashtags, No URLs, No CTAs**: Strictly prevents hashtags, links, and call-to-actions to avoid shadow bans
- **Copy-Paste Ready**: Clean output without formatting noise, asterisks, or markdown artifacts

### 🎨 **Beautiful Glassmorphism Design**
- **Modern UI**: Stunning glassmorphism effects with backdrop blur
- **Smooth Animations**: 60fps transitions and progress animations
- **Dark Mode Support**: Full light/dark theme compatibility
- **Responsive Layout**: Optimized for Chrome extension popup (400x600px)

### ⚡ **Advanced User Experience**
- **Animated Progress Bars**: Beautiful gradient progress with shimmer effects
- **Character Count Management**: Accurate Unicode and emoji character counting
- **Auto-Resize Text Areas**: Content-fitted containers with no scrollbars
- **Smart Content Cleaning**: Removes formatting noise and strips URLs automatically
- **Target Length Control**: Interactive slider to adjust content length (50-2000 characters)

## 🎉 Recent Updates

- **Twitter-Only Quick Action**: Focused on high-quality single tweets; removed deprecated quick actions
- **Anti-Shadowban Guardrails**: No hashtags, no URLs, and no CTA lines in generation and regeneration flows
- **Cleaner UI**: Glassmorphism retained; simplified navigation and history

## 🚀 Installation

### Method 1: Install from Chrome Web Store (Coming Soon)
*Extension will be available on Chrome Web Store after final testing*

### Method 2: Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/Ravinder82/TabTalkAI.git
   cd TabTalkAI
   ```

2. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist/extension` folder

3. **Set Up Your Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key (free tier available)
   - Copy your API key

4. **Configure the Extension**
   - Click the TabTalk AI extension icon
   - Enter your Gemini API key in the setup modal
   - Start analyzing web content!

## 📚 How to Use

### 1. **First-Time Setup**
- Install the extension and click the TabTalk AI icon
- You'll see the welcome screen with app introduction
- Click "Start" to begin the API key setup process
- Follow the 3-step guide to get your Google Gemini API key:
  1. Click "Open AI Studio" to visit Google AI Studio
  2. Create a new API key and copy it
  3. Paste your key in the input field and click "Test"
- Once validated, click "Continue" to access the main interface

### 2. **Analyze Current Webpage**
- Navigate to any webpage you want to analyze
- Click the TabTalk AI extension icon
- The extension automatically extracts page content
- You'll see the page title and loading status at the top
- Once loaded, you can start chatting about the content immediately
- Type your question in the input field and click the send button

### 3. **Generate Twitter Content**
- Click the Twitter/X Post button to create a single tweet
  - View your generated post in a clean card
  - Adjust length using the interactive slider
  - See real-time character count (e.g., "62 characters")
  - Click the copy icon to copy content to clipboard

<!-- Content analysis quick actions removed in this streamlined release -->

### 5. **Smart Content Features**
- **Target Length Control**: Adjust content length with the interactive slider
  - Slide left for shorter content (minimum 50 characters)
  - Slide right for longer content (up to 2000 characters)
  - See the target length number update in real-time
- **Regenerate**: Click the refresh icon to recreate content with different parameters
- **Character Counter**: Real-time Unicode-aware character counting in the input field
- **Auto-Resize**: Text areas expand automatically to fit content without scrollbars

### 6. **UI Navigation**
- **Dark Mode Toggle**: Click the moon/sun icon in the header to switch themes
- **Menu Button**: Access options via the hamburger menu
  - Gemini API Setup: Update your API key settings
  - Clear Chat: Reset the conversation history
- **Back Button**: Return to previous screens when navigating

<!-- Demo Mode section removed for this streamlined release -->

## 🔧 Technical Details

### Built With
- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No frameworks, maximum performance
- **CSS3 with Glassmorphism**: Modern UI with backdrop-filter effects
- **Google Gemini 2.0 Flash API**: Advanced AI model for content analysis
- **Chrome Storage API**: Secure local storage for settings
- **Modular Architecture**: Separate modules for API, UI, Twitter, and more

### UI Implementation
- **Multi-View System**: Separate views for welcome, API setup, chat, and settings
- **Component-Based Design**: Reusable UI components for messages, cards, and inputs
- **CSS Custom Properties**: Theme variables for consistent styling and dark mode
- **Responsive Containers**: Flexible layouts that adapt to content size
- **Interactive Elements**: Sliders, buttons, and inputs with proper state management

### Browser Compatibility
- **Chrome 88+**: Full feature support
- **Chromium-based browsers**: Edge, Brave, Opera, etc.

### Key Technologies
- **Service Worker**: Background script for API communication
- **Content Scripts**: Webpage content extraction
- **Chrome Extension APIs**: Storage, tabs, activeTab permissions
- **Unicode-aware Processing**: Proper emoji and special character handling
- **Progressive Enhancement**: Graceful degradation for older browsers

## 🔐 Privacy & Security

- **Local Storage Only**: API keys stored securely in Chrome's local storage
- **Zero Data Collection**: No personal data collected, stored, or transmitted
- **Direct API Communication**: All requests go directly to Google's Gemini API
- **No Third-Party Tracking**: No analytics, tracking, or external services
- **Open Source**: Complete code transparency and community auditing
- **Secure Permissions**: Minimal required permissions (activeTab, storage)

## 🛠️ Development

### Project Structure
```
TabTalkAI/
├── dist/
│   ├── extension/              # Production extension files
│   │   ├── manifest.json       # Chrome extension manifest (V3)
│   │   ├── popup.html         # Extension popup interface
│   │   ├── popup.js           # Main popup functionality
│   │   ├── popup.css          # Glassmorphism styling
│   │   ├── background.js      # Service worker for API calls
│   │   ├── content.js         # Content extraction script
│   │   ├── api.js            # Gemini API integration
│   │   ├── twitter.js        # Twitter content generation
│   │   ├── export.js         # Export functionality
│   │   ├── storage.js        # Storage management
│   │   ├── ui-render.js      # UI rendering components
│   │   ├── scroll.js         # Horizontal scrolling
│   │   ├── navigation.js     # View navigation
│   │   └── icons/            # Extension icons
│   └── web/                  # Web app build files
│       ├── app.js            # Web app JavaScript
│       ├── index.html        # Web app HTML
│       └── styles.css        # Web app styles
├── src/
│   ├── extension/             # Extension source code
│   │   ├── popup.js         # Extension popup source
│   │   ├── background.js    # Extension background source
│   │   ├── content.js       # Extension content source
│   │   └── manifest.json    # Extension manifest source
│   ├── shared/                # Shared components
│   │   ├── components/      # Reusable UI components
│   │   ├── core/            # Core business logic
│   │   └── styles/          # Shared styles
│   └── web-app/              # Standalone web version
├── icons/                     # Extension icons (16, 32, 48, 128px)
├── tests/                     # Test files
├── README.md                  # Project documentation
├── directory.md               # Directory architecture
├── REFACTORED.md              # Refactoring documentation
└── promptmemory.md           # Development context and AI prompts
```

### Local Development
1. **Clone Repository**
   ```bash
   git clone https://github.com/Ravinder82/TabTalkAI.git
   cd TabTalkAI
   ```

2. **Load Extension in Developer Mode**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → Select `dist/extension/`

3. **Development Workflow**
   ```bash
   # Edit files in src/extension/
   npm run build:extension   # builds to dist/extension/
   # Reload extension in chrome://extensions/
   ```

## ⚠️ Limitations

- **API Key Required**: Free Gemini API key needed for full functionality
- **Chrome Only**: Currently supports Chrome and Chromium-based browsers
- **Rate Limits**: Subject to Google's API rate limits (generous free tier: 15 requests/minute, 1500/day)
- **Content Length**: Very long pages truncated to stay within API context limits
- **Some Sites Protected**: Certain websites may block content extraction due to CORS policies

## 🔧 Troubleshooting

### Extension Issues

**Extension popup not opening/cut off vertically**
- Ensure you're using the `dist/extension/` folder, not root directory
- Check that `manifest.json` has proper popup dimensions
- Clear browser cache and reload extension

**"API request failed" error**
- Verify your Gemini API key is correct and active
- Check API quota remaining at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Wait a few moments if rate limited (15 requests/minute limit)

**"Cannot extract content from this page"**
- Some websites block automated content extraction
- Try refreshing the page and clicking the extension again
- Check if the website requires login or has anti-bot protection

**Twitter content generation issues**
- Ensure content is clean and properly formatted
- Check character count limits (50-2000 characters)
- Regenerate with different length settings if needed

### Development Issues

**Extension not loading in developer mode**
- Verify `manifest.json` syntax is correct
- Check browser console for JavaScript errors
- Ensure all required files are present in `dist/extension/`

## 🤝 Contributing

Contributions are welcome! Priority areas:
- **Enhanced Content Extraction**: Better parsing for complex websites
- **Additional AI Models**: Support for other AI providers
- **UI/UX Improvements**: Accessibility and user experience enhancements
- **Testing**: Comprehensive unit and integration tests
- **Documentation**: Examples and tutorials

### Development Guidelines
- Follow existing code style and structure
- Test on multiple websites before submitting
- Maintain the glassmorphism design consistency
- Ensure accessibility standards compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For help and support:

1. **Check Documentation**: Review this README and `promptmemory.md`
2. **Common Issues**: See troubleshooting section above
3. **API Issues**: Visit [Google AI Studio documentation](https://ai.google.dev/docs)
4. **Report Bugs**: Open an issue in the project repository
5. **Feature Requests**: Submit detailed proposals in issues

### Quick Links
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [Glassmorphism Design Principles](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)

---

**🚀 Ready to get started?** [Get your free Gemini API key](https://aistudio.google.com/app/apikey) and start creating professional Twitter content with AI assistance!