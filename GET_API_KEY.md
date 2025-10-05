# How to Get a Valid Gemini API Key

## The Errors You're Seeing

Based on your error messages:
- ❌ "API Key not found. Please pass a valid API key."
- ❌ "API key expired. Please renew the API key."

This means you need to get a **valid, active Gemini API key** from Google.

## Step-by-Step: Get Your Free Gemini API Key

### 1. Go to Google AI Studio
Visit: **https://aistudio.google.com/app/apikey**

### 2. Sign In
- Use your Google account to sign in
- Accept the terms of service if prompted

### 3. Create API Key
- Click **"Create API Key"** button
- Select **"Create API key in new project"** (or choose an existing project)
- Your new API key will be generated

### 4. Copy Your API Key
- The API key will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Click the **Copy** button to copy it to clipboard
- **IMPORTANT**: Save this key somewhere safe - you won't be able to see it again!

### 5. Check API Key Format
Valid Gemini API keys:
- ✅ Start with `AIza`
- ✅ Are exactly 39 characters long
- ✅ Contain only alphanumeric characters (no spaces, dashes, or special chars)

### 6. Enable the API (if needed)
- Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- Click **"Enable"** if the API is not already enabled
- Wait a few moments for it to activate

## Using Your API Key in TabTalk AI

### Option 1: Setup Screen
1. Reload the TabTalk AI extension in Chrome
   - Go to `chrome://extensions/`
   - Find TabTalk AI
   - Click the refresh/reload icon 🔄
2. Open the extension popup
3. You should see the setup screen
4. **Paste your API key** (Ctrl+V or Cmd+V)
5. Click **"Test API Key"** button
6. Should show **"✓ Valid"** in green
7. Click **"Continue"** to start using the extension

### Option 2: Settings (if already set up)
1. Open TabTalk AI extension
2. Click the ⚙️ Settings icon
3. Paste your new API key
4. Click **"Save API Key"**

## Common Issues & Solutions

### Issue: "API key expired"
**Solution**: Your old API key has expired. Create a new one using the steps above.

### Issue: "Invalid API key format"
**Solution**: 
- Make sure you copied the **entire key** (39 characters)
- Remove any extra spaces before/after the key
- Key should start with `AIza`

### Issue: "API Key not found"
**Solution**:
- Double-check you copied the correct key
- Make sure the API is enabled in Google Cloud Console
- Try creating a fresh API key

### Issue: Still not working?
**Solution**:
1. Clear the old API key from storage:
   - Open Chrome DevTools (F12)
   - Go to Application tab → Storage → Local Storage
   - Clear TabTalk AI entries
2. Reload the extension
3. Enter the new API key from scratch

## Free Tier Limits

Google's Gemini API free tier includes:
- ✅ **60 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **1 million tokens per day**

This is more than enough for normal usage of TabTalk AI!

## Security Tips

🔒 **Keep Your API Key Safe:**
- Don't share it publicly
- Don't commit it to GitHub
- Don't post it in forums or chat
- If exposed, delete it and create a new one

## Need Help?

If you're still having issues:
1. Check the Chrome DevTools Console (F12) for detailed error messages
2. Make sure you're using the latest version of the extension
3. Try with a brand new API key
4. Verify the Gemini API is enabled in your Google Cloud project

---

## Quick Reference

**Get API Key**: https://aistudio.google.com/app/apikey

**Enable Gemini API**: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

**Valid Key Format**: `AIzaSy...` (39 characters, alphanumeric only)
