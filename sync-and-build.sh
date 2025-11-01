#!/bin/bash

echo "🔨 Building extension from src to dist..."
npm run build:extension

echo "📋 Syncing privacy policy to gh-pages..."
git checkout gh-pages
git pull origin gh-pages
cp website/privacy-policy.html privacy-policy.html
git add privacy-policy.html
git commit -m "Sync latest privacy policy" || echo "No changes to privacy policy"
git push origin gh-pages
git checkout main

echo "✅ Done! Extension built and privacy policy synced."
echo ""
echo "Remember:"
echo "  - Edit files in: src/extension/"
echo "  - Build with: npm run build:extension"
echo "  - Output goes to: dist/extension/"
echo "  - Privacy policy: https://ravinder82.github.io/Fibr-4-Tweeter/privacy-policy.html"
