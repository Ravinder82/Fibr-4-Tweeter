#!/bin/bash

echo "🔨 Building extension from src to dist..."
npm run build:extension

echo "✅ Done! Your dist directory has been rebuilt from src."
echo ""
echo "Remember:"
echo "  - Edit files in: src/extension/"
echo "  - Build with: npm run build:extension"
echo "  - Output goes to: dist/extension/"
