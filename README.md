# Fibr - AI-Powered Twitter Content Generator

## Table of Contents

- [✨ What is Fibr?](#-what-is-fibr)
- [🚀 Key Features](#-key-features)
- [📸 Screenshots](#-screenshots)
- [🛠️ Installation](#️-installation)
- [⚙️ Setup & Configuration](#️-setup--configuration)
- [🎯 How to Use](#-how-to-use)
- [🎨 UI Navigation](#-ui-navigation)
- [🔧 Technical Details](#-technical-details)
- [🔐 Privacy & Security](#-privacy--security)
- [📁 Project Structure](#-project-structure)
- [🚀 Development](#-development)
- [⚠️ Limitations & Known Issues](#️-limitations--known-issues)
- [🔧 Troubleshooting](#-troubleshooting)
- [🛒 Chrome Web Store Launch Kit](#-chrome-web-store-launch-kit)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🆘 Support & Community](#-support--community)

## ✨ What is Fibr?

**Fibr** is a cutting-edge Chrome extension that revolutionizes how you create Twitter content. Using advanced AI powered by Google's Gemini 2.0 Flash API, Fibr automatically analyzes any webpage and generates:

- **🎯 Single Tweets** - Perfect 280-character posts
- **🧵 Twitter Threads** - Multi-part stories with numbered cards
- **📊 Content Analysis** - Summaries, key points, FAQs, and fact-checking
- **💬 AI Chat** - Interactive conversations about any content
- **📝 Smart Formatting** - Professional content with proper hashtags and mentions

Transform lengthy articles, blog posts, or research into engaging Twitter content in seconds. No more struggling with character limits or boring content!

## 🚀 Key Features

### 🎨 **Beautiful Glassmorphism UI**
- Modern frosted glass design with backdrop blur effects
- Smooth dark/light mode toggle
- Responsive design that adapts to any screen size
- Intuitive navigation with horizontal scrolling action bar

### ⚡ **One-Tap Quick Actions**
- Quick access buttons for Post, Repost, Comments, Thread, and Create
- **Post**: Generate single tweets with 6 original tone presets and custom tone mixing
- **Repost**: Dedicated modal with 5 reply tones, image prompt toggle, and instant generation
- **Comments**: Strategic comment generation with Praise and Ask tones
- **Thread**: Generate threads from current page content with tone customization
- **Create**: Generate threads on any custom topic using AI knowledge base

### 🤖 **Advanced AI Content Generation**
- **Twitter Posts**: Generate single tweets with 6 original tone presets (Funny, Deeper Insights, Clever Observations, Industry Insights, Expert Repurpose, Shuffle)
- **Reply Content**: 5 reply tones for Repost (Fact Check, Amplify & Agree, Fact Check & Counter, Savage & Smart, Hypocrite Buster)
- **Comment Responses**: 2 strategic comment tones (Praise, Ask)
- **Twitter Threads**: Create numbered thread cards with automatic gallery save and per-tweet image prompts
- **Custom Topic Threads**: Generate threads on any subject using AI knowledge base
- **Custom Tone Mixing**: Combine two tones for unique voice combinations
- **Smart Content Analysis**: AI-powered research context and key insights for every generation
- **Unicode-Aware**: Proper emoji and special character handling for clean publishing

### 💡 **Intelligent Features**
- **11 Tone Presets**: 6 original post tones, 5 reply tones, and custom mixing capability
- **AI Research Augmentation**: Every generation includes fresh research context and domain expertise
- **Real-time Character Counter**: Unicode-aware counting with emoji support
- **Content Sanitization**: Removes AI artifacts, meta-commentary, and formatting noise
- **Automatic Gallery Save**: Threads auto-save to gallery for easy access
- **Image Prompt Generation**: Optional 9:16 Nano Banana prompts for visual content
- **Progress Indicators**: Visual feedback during AI processing

### 🔧 **Professional Tools**
- **Quick Actions**: One-click generation for Post, Repost, Comments, Thread, and Create flows
- **Individual Card Copy**: Copy each tweet or thread card separately
- **Rich Gallery System**: Save, search, sort, view, and delete generated content (50-item limit)
- **Virtual Scrolling**: Smooth performance with large content libraries
- **Thread Cards**: Beautiful numbered cards for multi-part threads with character counts
- **Smart Filtering**: Search and sort by updated date, created date, or content length
- **Bulk Management**: Delete all saved items by category
- **Settings Management**: Persistent preferences, API key storage, and light/dark theme toggle
- **Privacy Policy**: Built-in privacy & security documentation

## 📸 Screenshots

*Coming soon - Screenshots of the beautiful Fibr interface showing Twitter content generation, thread creation, and AI analysis features.*

## 🛠️ Installation

### From Source Code (Development)
1. **Clone the Repository**
   ```bash
   git clone https://github.com/Ravinder82/Fibr-4-Tweeter.git
   cd Fibr-4-Tweeter
   ```

2. **Build the Extension**
   ```bash
   npm install
   npm run build:extension
   ```

3. **Load in Chrome**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" → Select `dist/extension/` folder

### From Chrome Web Store (Coming Soon)
*Extension submission in progress*

## ⚙️ Setup & Configuration

### 1. **Get Your Gemini API Key**
Fibr requires a free Google Gemini API key to function. Get yours at:
👉 **[Google AI Studio](https://aistudio.google.com/app/apikey)**

### 2. **Configure the Extension**
- Click the Fibr extension icon in your browser toolbar
- Follow the setup wizard or click "API Key Setup"
- Enter your Gemini API key
- Test the connection

### 3. **Start Creating Content**
- Navigate to any webpage with interesting content
- Click the Fibr extension icon
- Choose your desired action (Twitter, Summary, Analysis, etc.)
- Let AI work its magic!

## 🎯 How to Use

### Basic Twitter Content Generation
1. **Open any webpage** with content you want to tweet about
2. **Click the Fibr extension icon**
3. **Select "Post"** from the quick actions
4. **Choose your tone** from 6 original post styles or create a custom mix
5. **Generate and copy** your ready-to-post content

### Repost & Reply Generation
1. **Navigate to content** you want to repost or reply to
2. **Select "Repost"** from quick actions
3. **Choose your reply tone**: Fact Check, Amplify & Agree, Fact Check & Counter, Savage & Smart, or Hypocrite Buster
4. **Optional**: Toggle image prompt generation
5. **Generate authentic reply** content

### Comment Creation
1. **Open content** you want to comment on
2. **Select "Comments"** from quick actions
3. **Choose tone**: Praise (celebrate wins) or Ask (technical questions)
4. **Generate strategic comment** backed by AI analysis

### Thread Generation
- **Thread**: Create multi-tweet thread from current webpage content
- **Create**: Generate thread on any custom topic with AI knowledge base
- Optional per-tweet image prompts (9:16 format)
- Automatic save to gallery

### Advanced Features
- **Gallery Management**: Save up to 50 items with search, sort, and delete functionality
- **Custom Tone Mixing**: Combine any two tones for unique voice combinations
- **AI Research Augmentation**: Domain expertise and fresh insights (October 2024 knowledge)
- **Image Prompt Generation**: Optional 9:16 Nano Banana prompts for visual content
- **Dark/Light Themes**: Smooth theme toggle with system preference detection
- **Unicode Processing**: Proper handling of emojis and special characters

## 🎨 UI Navigation

### Main Interface
- **Header**: Logo, dark mode toggle, menu button
- **Quick Actions Bar**: Horizontal scrolling buttons for different actions
- **Content Area**: Dynamic views for generation results
- **Footer**: Status indicators and action buttons

### Navigation Elements
- **Dark Mode Toggle**: Moon/sun icon for theme switching
- **Menu Button**: Hamburger menu for settings and options
  - Gemini API Setup: Update your API key
  - Clear Chat: Reset conversation history
  - Settings: Customize extension behavior
- **Back Button**: Return to previous screens

### Interactive Components
- **Progress Bars**: Animated indicators during AI processing
- **Character Counters**: Real-time Twitter limit tracking
- **Length Sliders**: Adjustable content length controls
- **Copy Buttons**: One-click content copying
- **Rich Text Modals**: Professional viewer and editor for saved content
- **Regenerate Buttons**: Quick content refinement

## 🔧 Technical Details

### Built With
- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No frameworks, maximum performance
- **CSS3 with Glassmorphism**: Modern UI with backdrop-filter effects
- **Google Gemini 2.0 Flash API**: Advanced AI model for content generation
- **Chrome Storage API**: Secure local storage for settings
- **Modular Architecture**: Separate modules for enhanced maintainability

### Architecture
- **Service Worker**: Background processing for API communication
- **Content Scripts**: Intelligent webpage content extraction
- **Modular Design**: Separate modules for API, UI, Twitter, analysis, and more
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Rich Text Modal System**: Bulletproof modal architecture with atomic operations

### Browser Compatibility
- **Chrome 88+**: Full feature support
- **Chromium-based browsers**: Edge, Brave, Opera, Vivaldi

### Key Technologies
- **Unicode Processing**: Proper emoji and special character handling
- **Responsive Design**: Adapts to any popup/container size
- **Async/Await**: Modern JavaScript for smooth user experience
- **CSS Custom Properties**: Dynamic theming and dark mode support
- **Modal Architecture**: Single-instance, conflict-free modal management
- **Compliance Testing**: Automated Chrome Web Store compliance verification

## 🔐 Privacy & Security

- **Local Storage Only**: API keys stored securely in Chrome's local storage
- **Zero Data Collection**: No personal data collected, stored, or transmitted
- **Direct API Communication**: All requests go directly to Google's Gemini API
- **No Third-Party Tracking**: No analytics, tracking, or external services
- **Open Source**: Complete code transparency and community auditing
- **Minimal Permissions**: Only required permissions (activeTab, storage, scripting)

### Chrome Web Store Compliance

Fibr is fully compliant with Chrome Web Store requirements:

- ✅ **Privacy Policy:** Hosted at [https://ravinder82.github.io/Fibr-4-Tweeter/privacy-policy.html](https://ravinder82.github.io/Fibr-4-Tweeter/privacy-policy.html)
- ✅ **Content Security Policy:** Explicit CSP defined in manifest
- ✅ **Manifest V3:** Fully compliant with latest standards
- ✅ **Automated Testing:** Compliance testing framework available

**Compliance Testing Framework:**
```bash
# Run compliance tests
node chrome-policy-compliance-tests/test-runner.js

# View detailed report
cat chrome-policy-compliance-tests/COMPLIANCE_REPORT.md
```

**Current Status:** ✅ 10/10 tests passing - Ready for Chrome Web Store submission

### Privacy Policy Hosting

The privacy policy is automatically synced to GitHub Pages. To update:

```bash
# Use the sync script
./sync-and-build.sh

# Or manually sync
git checkout gh-pages
cp website/privacy-policy.html privacy-policy.html
git add privacy-policy.html
git commit -m "Update privacy policy"
git push origin gh-pages
git checkout main
```

**Privacy Policy URL:** [https://ravinder82.github.io/Fibr-4-Tweeter/privacy-policy.html](https://ravinder82.github.io/Fibr-4-Tweeter/privacy-policy.html)

## 📁 Project Structure

```
Fibr-4-Tweeter/
├── dist/
│   └── extension/              # Production extension files
│       ├── manifest.json       # Chrome extension manifest (V3)
│       ├── popup.html         # Extension popup interface
│       ├── popup.js           # Main popup functionality
│       ├── popup.css          # Glassmorphism styling
│       ├── background.js      # Service worker for API calls
│       ├── content.js         # Content extraction script
│       ├── modules/          # Modular components
│       │   ├── api.js            # Gemini API integration
│       │   ├── twitter.js        # Twitter content generation
│       │   ├── storage.js         # Storage management
│       │   ├── ui-render.js      # UI rendering components
│       │   ├── navigation.js     # View navigation
│       │   ├── gallery.js        # Gallery system with virtual scrolling
│       │   ├── tone-selector.js  # Tone selection modal (11 tones)
│       │   ├── repost-modal.js   # Repost modal with 5 reply tones
│       │   ├── comments-modal.js # Comments modal with 2 tones
│       │   ├── thread-generator.js # Custom topic thread generation
│       │   ├── image-prompt-generator.js # 9:16 image prompts
│       │   ├── privacy-policy.js # Privacy documentation
│       │   └── bottom-nav.js     # Floating navigation
│       └── icons/            # Extension icons
├── src/
│   └── extension/             # Source code
│       ├── modules/          # Modular components
│       ├── popup.html       # Source HTML
│       ├── popup.js         # Source JavaScript
│       └── manifest.json    # Source manifest
├── icons/                     # Extension icons (16, 32, 48, 128px)
├── scripts/                   # Build scripts
├── tests/                     # Test files
├── docs/                      # Documentation
│   └── development/          # Development docs
├── chrome-policy-compliance-tests/  # Compliance testing framework
│   ├── test-runner.js        # Automated test execution
│   ├── COMPLIANCE_REPORT.md  # Detailed compliance report
│   └── README.md            # Testing framework guide
├── README.md                  # Project documentation
├── package.json              # Dependencies and scripts
└── manifest.json             # Root manifest
```

## 🚀 Development

### Prerequisites
- Node.js 16+
- Google Chrome or Chromium browser
- Free Google Gemini API key

### Local Development
1. **Clone Repository**
   ```bash
   git clone https://github.com/Ravinder82/Fibr-4-Tweeter.git
   cd Fibr-4-Tweeter
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Workflow**
   ```bash
   # Edit files in src/extension/
   npm run build:extension   # Builds to dist/extension/
   # Reload extension in chrome://extensions/
   ```

4. **Testing**
   ```bash
   npm test  # Run test suite
   node chrome-policy-compliance-tests/test-runner.js  # Run compliance tests
   ```

## ⚠️ Limitations & Known Issues

- **API Key Required**: Free Gemini API key needed for full functionality
- **Chrome Only**: Currently supports Chrome and Chromium-based browsers
- **Rate Limits**: Subject to Google's API rate limits (15 requests/minute, 1500/day)
- **Content Length**: Very long pages may be truncated for API context limits
- **Protected Sites**: Some websites may block content extraction due to CORS policies

## 🔧 Troubleshooting

### Common Issues

**Extension popup not opening or cut off**
- Ensure using `dist/extension/` folder, not root directory
- Check `manifest.json` has proper popup dimensions
- Clear browser cache and reload extension

**"API request failed" error**
- Verify Gemini API key is correct and active
- Check quota at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Wait if rate limited (15 requests/minute limit)

**"Cannot extract content"**
- Some websites block automated extraction
- Try refreshing page and clicking extension again
- Check if site requires login or has anti-bot protection

**Twitter generation issues**
- Ensure content is properly formatted
- Check character limits (50-2000 characters)
- Try different length settings

### Development Issues

**Extension not loading in developer mode**
- Verify `manifest.json` syntax is correct
- Check browser console for JavaScript errors
- Ensure all required files present in `dist/extension/`

## 🛒 Chrome Web Store Launch Kit

Use this section when preparing your Chrome Web Store listing or marketing assets.

### 1. Listing Snapshot
- **Tagline (short description):** "Turn any page into scroll-stopping Twitter posts in one tap."
- **Long description starter:**
  > Fibr is a speed-first AI copilot for X/Twitter creators. Capture insights from any article, video, or research page and instantly generate ready-to-post tweets, threads, or repost replies. Powered by Google Gemini, Fibr keeps your voice authentic, adds expert research, and ships publish-ready content in seconds.
- **Primary call-to-action:** "Generate viral-ready posts from any webpage."
- **Key value pillars:** Speed-first workflow • Authentic tone presets • Research-backed outputs • Rich Text Gallery • Works with free Gemini API key

### 2. Feature Bullets for Store Listing
1. ✍️ **6 Original Post Tones** – Funny, Deeper Insights, Clever Observations, Industry Insights, Expert Repurpose, Shuffle—plus custom mixing.
2. 🔁 **5 Reply Tones for Repost** – Fact Check, Amplify & Agree, Fact Check & Counter, Savage & Smart, Hypocrite Buster.
3. 💬 **Strategic Comments** – Praise and Ask tones for meaningful engagement.
4. 🧵 **Thread on Anything** – Generate from current page or create on custom topics with AI knowledge base.
5. 🗂️ **Rich Gallery** – Save, search, sort 50 items with virtual scrolling and bulk management.

### 3. Screenshot & Video Storyboard
Capture these states (light & dark themes) for 1280×800 screenshots:
1. **Home + quick actions** – Show glassmorphism UI with 5 action buttons (Post, Repost, Comments, Thread, Create).
2. **Tone selector** – Highlight 6 original post tones and custom mix builder.
3. **Repost modal** – Showcase 5 reply tones, image prompt toggle, and "Generate" button.
4. **Comments modal** – Display Praise and Ask tones with descriptions.
5. **Gallery view** – Demonstrate search, sort, saved cards, and bulk management.
Optional promo video (30–45s) should walk through Post → Repost → Gallery flow.

### 4. Asset Checklist
- 128×128 icon (already provided in `icons/`).
- Screenshots (at least 3, max 5) in PNG/JPG.
- Optional 920×680 promotional tile using the same rebrand color palette.
- Privacy statement referencing the "Privacy & Security" section below.
- Support contact: link to GitHub issues or dedicated email.

### 5. Categories, Keywords & Compliance
- **Category:** Productivity → Blogging or Social & Communication.
- **Keywords:** AI Twitter writer, X thread generator, repost assistant, comment generator, tone presets, Gemini AI, social media automation.
- **Permissions to list:** `activeTab`, `storage`, `scripting`, `tabs` (explain usage in submission form).
- **Data disclosure:** No personal data collected; API key stored locally; only communicates with Google Gemini via user-provided key.

### 6. FAQ Snippets for Listing
- **Does Fibr store my data?** No, content stays on your device. Gemini API calls run using your key.
- **Do I need to pay for Gemini?** Free-tier Gemini key works out of the box.
- **Can I customize tone?** Yes—original post presets, reply/repost presets, and custom tone mixes are built in.

## 🤝 Contributing

Contributions welcome! Priority areas:
- **Enhanced Content Extraction**: Better parsing for complex websites
- **Additional AI Models**: Support for other AI providers
- **UI/UX Improvements**: Accessibility and user experience enhancements
- **Testing**: Comprehensive unit and integration tests
- **Documentation**: Examples and tutorials

### Development Guidelines
- Follow existing code style and modular structure
- Test on multiple websites before submitting
- Maintain glassmorphism design consistency
- Ensure accessibility standards compliance
- Update documentation for new features

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

For help and support:

1. **Check Documentation**: Review this README and development files
2. **Common Issues**: See troubleshooting section above
3. **API Issues**: Visit [Google AI Studio documentation](https://ai.google.dev/docs)
4. **Report Bugs**: Open an issue in the project repository
5. **Feature Requests**: Submit detailed proposals in issues

### Quick Links
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [Fibr GitHub Repository](https://github.com/Ravinder82/Fibr-4-Tweeter)

---

**🚀 Ready to revolutionize your Twitter content creation?** [Get your free Gemini API key](https://aistudio.google.com/app/apikey) and start creating professional Twitter threads with Fibr!

*Built with ❤️ for content creators, marketers, and social media professionals.*
