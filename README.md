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
- **Twitter Threads**: Create multi-tweet threads (3-8 tweets) with proper flow
- **Individual Cards**: Each thread tweet displayed in separate, copyable cards
- **Zero Hashtag Policy**: Clean, professional content that protects your Twitter account
- **Copy-Paste Ready**: No formatting noise, asterisks, or markdown artifacts

### 🎨 **Beautiful Glassmorphism Design**
- **Modern UI**: Stunning glassmorphism effects with backdrop blur
- **Smooth Animations**: 60fps transitions and progress animations
- **Dark Mode Support**: Full light/dark theme compatibility
- **Responsive Layout**: Optimized for Chrome extension popup (400x600px)

### ⚡ **Advanced User Experience**
- **Animated Progress Bars**: Beautiful gradient progress with shimmer effects
- **Character Count Management**: Accurate Unicode and emoji character counting
- **Auto-Resize Text Areas**: Content-fitted containers with no scrollbars
- **Smart Content Cleaning**: Removes formatting noise automatically

## 🚀 Installation

### Method 1: Install from Chrome Web Store (Coming Soon)
*Extension will be available on Chrome Web Store after final testing*

### Method 2: Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-username/TabTalkAI.git
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

## 📖 How to Use

### 1. **Analyze Current Webpage**
- Navigate to any webpage
- Click the TabTalk AI extension icon
- The extension automatically extracts page content
- Start chatting about the content immediately

### 2. **Generate Twitter Content**
- **🐦 Twitter/X Post**: Creates single, engaging tweets (50-2000 characters)
- **🧵 Twitter Thread**: Generates multi-tweet threads (3-8 tweets)
- Each thread tweet appears in a separate glassmorphism card
- Click 📋 to copy individual tweets directly to clipboard

### 3. **Smart Content Features**
- **Length Control**: Adjust tweet length with slider (50-2000 characters)
- **Regenerate**: Click 🔄 to recreate content with different parameters
- **Character Counter**: Real-time Unicode-aware character counting
- **Auto-Resize**: Text areas expand automatically to fit content

### 4. **Chat with AI**
- Ask questions about the webpage content
- Get detailed analysis and insights
- Receive markdown-formatted responses
- Access chat history and export functionality

## 💡 Demo Mode

If you don't have an API key yet, you can try the demo mode to explore the interface with simulated responses. This gives you a feel for how the extension works before setting up your API key.

## 🔧 Technical Details

### Built With
- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No frameworks, maximum performance
- **CSS3 with Glassmorphism**: Modern UI with backdrop-filter effects
- **Google Gemini 2.0 Flash API**: Advanced AI model for content analysis
- **Chrome Storage API**: Secure local storage for settings

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
├── dist/extension/              # Production extension files
│   ├── manifest.json           # Chrome extension manifest (V3)
│   ├── popup.html             # Extension popup interface
│   ├── popup.js               # Main popup functionality
│   ├── popup.css              # Glassmorphism styling
│   ├── background.js          # Service worker for API calls
│   └── content.js             # Content extraction script
├── src/                       # Source files
│   ├── extension/             # Extension source code
│   ├── shared/                # Shared components
│   └── web-app/              # Standalone web version
├── icons/                     # Extension icons (16, 32, 48, 128px)
├── README.md                  # Project documentation
└── promptmemory.md           # Development context and AI prompts
```

### Local Development
1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/TabTalkAI.git
   cd TabTalkAI
   ```

2. **Load Extension in Developer Mode**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → Select `dist/extension/`

3. **Development Workflow**
   ```bash
   # Make changes to files in dist/extension/
   # Reload extension in chrome://extensions/
   # Test functionality on various websites
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