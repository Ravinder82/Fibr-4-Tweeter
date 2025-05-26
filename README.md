# TabTalk AI: Conversational Web Assistant

A Chrome extension that allows you to chat with any webpage using Google's Gemini AI. Ask questions, get summaries, and understand content more efficiently.

## Features

- 🤖 **AI-Powered Conversations**: Chat with webpage content using Google Gemini
- 📄 **Smart Content Extraction**: Automatically extracts and processes main content from web pages
- 💬 **Intuitive Interface**: Clean, modern UI inspired by OpenAI's design principles
- ⚡ **Quick Actions**: One-click summarization and key points extraction
- 🔒 **Privacy-Focused**: Your API key is stored locally, no data is sent to external servers
- 🎯 **Context-Aware**: AI understands the specific page you're viewing

## Installation

### Method 1: Install from Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store soon.

### Method 2: Developer Installation

1. **Download the Extension**
   - Clone this repository or download the ZIP file
   - Extract all files to a folder on your computer

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing the extension files

3. **Get Your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key (free tier available)

4. **Configure the Extension**
   - Click the TabTalk AI extension icon in your browser toolbar
   - Click the settings gear icon
   - Enter your Gemini API key and save

## Usage

1. **Navigate to Any Webpage**
   - Visit any article, blog post, news site, or content page

2. **Open TabTalk AI**
   - Click the extension icon in your toolbar
   - The extension will automatically analyze the page content

3. **Start Chatting**
   - Type your question in the chat input
   - Use quick actions for common tasks:
     - "Summarize" - Get a concise summary
     - "Key Points" - Extract main points
     - "Simplify" - Explain in simple terms

4. **Example Questions**
   - "What is this article about?"
   - "Summarize the main arguments"
   - "What are the key statistics mentioned?"
   - "Explain this technical concept in simple terms"
   - "What conclusions does the author draw?"

## File Structure

```
tabtalk-ai/
├── manifest.json          # Extension configuration
├── popup.html            # Main interface HTML
├── popup.css            # Styling for the interface
├── popup.js             # Main popup functionality
├── background.js        # Background service worker
├── content.js          # Content script for page analysis
├── icons/              # Extension icons (16x16, 32x32, 48x48, 128x128)
└── README.md           # This file
```

## Features Explained

### Content Extraction
- Intelligently identifies main content areas
- Filters out navigation, ads, and irrelevant elements
- Handles various page layouts and structures
- Supports both static and dynamic content

### AI Integration
- Uses Google Gemini Pro model
- Context-aware responses based on page content
- Handles long content through intelligent chunking
- Safety filters and content moderation

### User Interface
- Responsive design that works on all screen sizes
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Auto-resizing input field
- Conversation history within current session
- Clear chat functionality

## Privacy & Security

- **Local Storage**: Your API key is stored locally in Chrome's secure storage
- **No Data Collection**: We don't collect or store any of your browsing data
- **Direct API Calls**: Communications go directly from your browser to Google's servers
- **Open Source**: All code is available for inspection

## Limitations

- **API Key Required**: You need your own free Gemini API key
- **Content Length**: Very long pages are truncated to stay within API limits
- **Browser Pages**: Cannot access chrome:// or extension pages for security reasons
- **Dynamic Content**: Some heavily dynamic sites may require page refresh

## Troubleshooting

### Extension Not Working
- Ensure you've entered a valid Gemini API key
- Check that the page has loaded completely
- Try refreshing the page and reopening the extension

### No Content Extracted
- Some pages may have content that's difficult to extract
- Try scrolling down to load more content (for infinite scroll pages)
- Check if the page requires login or has access restrictions

### API Errors
- **Invalid API Key**: Double-check your API key in settings
- **Quota Exceeded**: You may have hit the free tier limits
- **Rate Limiting**: Wait a few moments and try again

## Development

### Setup Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd tabtalk-ai

# Load in Chrome for testing
# Go to chrome://extensions/
# Enable Developer mode
# Click "Load unpacked" and select the directory
```

### Making Changes
- Edit the source files
- Click the refresh button in chrome://extensions/ for your extension
- Reload the extension popup to see changes

### API Integration
The extension uses Google's Gemini Pro API with the following endpoint:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Areas for Contribution
- Improved content extraction for specific site types
- Additional language support
- UI/UX enhancements
- Performance optimizations
- Bug fixes and testing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Visit the [Google AI Studio documentation](https://ai.google.dev/docs)
3. Open an issue in this repository

## Future Enhancements

- Multi-tab conversations
- Persistent chat history
- Voice input/output
- Document upload support
- Custom AI personas
- Integration with note-taking apps

---

**Note**: This extension requires a free Google Gemini API key. Google provides a generous free tier for personal use. Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get started.

