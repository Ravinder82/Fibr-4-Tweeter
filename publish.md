# TabTalk AI – Chrome Web Store Publishing Guide

> Follow this doc **top-to-bottom** and you will have everything the Chrome Web Store asks for. Keep all assets in the `store/` folder (create it if it doesn't exist). Nothing here is extension-specific code, so it's safe for Git.

---
## 1  Pre-Submission Checklist

| Item | Status | Notes |
|---|---|---|
| Manifest v3 | ✅ | Already using `manifest_version": 3` |
| Store Listing Assets | ⬜ | Prepare screenshots, promo images, icons (see §2) |
| Privacy Policy URL | ⬜ | Publish a public markdown or web page – GitHub Pages is fine |
| Data-Use Declaration | ⬜ | Fill in in the dashboard (no personal data collected) |
| Extension ZIP | ⬜ | Build → compress only necessary files (see §3.3) |
| Testing on Chrome ≥ 88 | ✅ | Load unpacked & verify |
| Payment / Licensing | n/a | Free extension |

---
## 2  Visual Assets

Asset | WxH | Format | Quantity | Purpose
--- | --- | --- | --- | ---
Icon | 16×16, 32×32, 48×48, 128×128 | PNG | 1 each (already in `icons/`) | Browser UI & Store tile
Screenshot | ≥ 1280×800 (min 640×400) | PNG/JPG | 3–5 | Demonstrate core flows (see style guide below)
Promo Tile (small) | 440×280 | PNG/JPG | *Optional* | Appears in search listings
Promo Tile (large) | 920×680 | PNG/JPG | *Optional* | Featured banner
YouTube Demo | 16:9 | MP4 upload | *Optional* | Autoplays on listing page

### 2.1  Screenshot Style Guide
1. **One feature per screenshot** – avoid clutter.
2. Use a neutral tab background (light & dark mode variants). 
3. Highlight the extension UI with a subtle spotlight or 4-px rounded rectangle.
4. Annotate briefly (≤ 12 words) in top-left corner using the accent color `#3182ce`.
5. Export at 2× DPI (e.g. 2560×1600) so the store's down-scaling stays crisp.
6. Keep file names semantic: `screenshot-1-summary.png`, `screenshot-2-keypoints.png`, …

---
## 3  Package & Upload

### 3.1  Prepare the Code ZIP
```
TabTalkAI/
  background.js
  content.js
  html2pdf.bundle.min.js
  icons/*
  manifest.json
  marked.min.js
  popup.*
  publish.md   ← exclude
  store/       ← exclude
```
*Do not* include `.git`, `publish.md`, local experiments or large assets. From project root:
```bash
zip -r TabTalkAI-v1.1.zip \
  background.js content.js html2pdf.bundle.min.js icons \ 
  manifest.json marked.min.js popup.*
```

### 3.2  Upload Flow
1. Visit <https://chrome.google.com/webstore/devconsole>
2. Click **Create Item** → upload `TabTalkAI-v1.1.zip`.
3. After processing, fill listing details (see §4).
4. Add language(s), category: **Productivity → Developer Tools** (or choose News & Weather if content-centric).
5. Answer permissions & data-use questions:
   * ActiveTab → "Used to read and summarise the current tab's content."
   * Storage → "Stores chat history & Gemini API key locally."
   * Scripting/host permissions → "Injects read-only content script for summarisation."
6. Save Draft. Use **Preview** to see how screenshots render.
7. When ready → **Submit for Review**. Typical review time: 1–3 business days.

---
## 4  Store Listing Text

### 4.1  Title (max 45 chars)
```
TabTalk AI – Chat & Summaries for Any Webpage
```

### 4.2  Short Description (max 132 chars)
```
Use Google Gemini to chat with any webpage, get instant summaries, key points & AI answers without leaving your tab.
```

### 4.3  Full Description (Markdown allowed)
```
### 🚀 Why TabTalk AI?
Stop copying paragraphs into chatbots. TabTalk AI brings Google Gemini directly to the page you're reading.

**Features**
• 📝 One-click Summary & 🔑 Key Points
• Natural-language chat about the current article, docs or forum thread
• Dark-mode, export to PDF, clear-chat & more

**How it works**
1. Install the extension
2. Grab a free API key from ai.google.com/studio
3. Paste it into TabTalk AI → done!

We never send your key or browsing data anywhere except Google's Gemini API.

**Permissions explained**
ActiveTab – read page text for summarisation
Storage – save your API key & chat locally
Scripting – inject a lightweight, read-only content script

**Support & Privacy**
Privacy Policy: <https://github.com/yourname/TabTalkAI#privacy>
Questions? hello@yourdomain.com
```

---
## 5  Post-Publish
* Keep version numbers in `manifest.json` in sync with the Web Store.
* Store will auto-rollout to 100 % after a short staged rollout; you can pause if errors appear.
* Respond to user reviews within 48 h for credibility.

---
**Happy shipping!** 🎉 