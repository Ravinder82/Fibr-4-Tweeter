# TabTalk AI - Web Application

A static web application that replicates the functionality and design of the TabTalk AI Chrome extension. This version allows you to chat with webpage content using Google's Gemini AI directly in your browser.

## Features

- 🤖 **AI-Powered Conversations**: Chat with webpage content using Google Gemini
- 📄 **URL Analysis**: Enter any webpage URL to extract and analyze content
- 💬 **Intuitive Interface**: Clean, modern UI matching the original extension design
- ⚡ **Quick Actions**: One-click summarization, key points, analysis, and FAQ generation
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 🔒 **Privacy-Focused**: Your API key is stored locally in your browser
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 💾 **Export Chat**: Download your conversations as JSON files

## Getting Started

### 1. Set Up Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key (free tier available)
4. Copy your API key

### 2. Use the Application

1. Open the web application
2. Click "Setup API Key" in the demo modal
3. Enter your Gemini API key and save
4. Start chatting with webpage content!

## How to Use

### Analyze a Webpage
1. Click the menu button (☰) and select "Enter URL"
2. Paste any webpage URL
3. Click "Analyze Page" to extract content
4. Start asking questions about the content

### Quick Actions
Use the quick action buttons for common tasks:
- **📝 Summary**: Get a concise summary
- **🔑 Key Points**: Extract main points
- **📊 Analysis**: Detailed content analysis
- **❓ FAQ**: Generate frequently asked questions

### Chat Features
- Type questions naturally about the content
- Use markdown formatting in responses
- Export your chat history
- Clear chat to start fresh
- Toggle dark mode for comfortable viewing

## Demo Mode

If you don't have an API key yet, you can try the demo mode to explore the interface with simulated responses. This gives you a feel for how the application works before setting up your API key.

## Technical Details

### Built With
- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, maximum compatibility
- **Google Gemini API**: AI-powered content analysis
- **Marked.js**: Markdown parsing for rich text display

### Browser Compatibility
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Features
- Progressive Web App (PWA) capabilities
- Service Worker for offline functionality
- Local storage for settings and API keys
- Responsive design for all screen sizes
- Keyboard shortcuts and accessibility support

## Privacy & Security

- **Local Storage**: Your API key is stored locally in your browser
- **No Data Collection**: We don't collect or store any of your data
- **Direct API Calls**: Communications go directly to Google's servers
- **Open Source**: All code is available for inspection

## Development

### Local Development
1. Clone or download the project files
2. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

### File Structure
```
tabtalk-ai-webapp/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js             # Main application logic
├── sw.js              # Service worker for PWA
├── manifest.json      # PWA manifest
└── README.md          # This file
```

## Limitations

- **API Key Required**: You need your own free Gemini API key for full functionality
- **CORS Restrictions**: Some websites may block content extraction due to CORS policies
- **Rate Limits**: Subject to Google's API rate limits (generous free tier)
- **Content Length**: Very long pages are truncated to stay within API limits

## Troubleshooting

### Common Issues

**"API request failed" error**
- Check that your API key is correct
- Ensure you have API quota remaining
- Try again after a few moments if rate limited

**"Cannot analyze this URL" error**
- Some websites block automated content extraction
- Try copying and pasting the content directly instead

**Interface not loading properly**
- Ensure JavaScript is enabled in your browser
- Try refreshing the page
- Check browser console for error messages

## Contributing

Contributions are welcome! Areas for improvement:
- Enhanced content extraction methods
- Additional AI model support
- UI/UX enhancements
- Mobile app version
- Browser extension port

## License

This project is licensed under the MIT License - see the original project for details.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the [Google AI Studio documentation](https://ai.google.dev/docs)
3. Open an issue in the project repository

---

**Note**: This web application requires a free Google Gemini API key. Google provides a generous free tier for personal use. Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to get started.