#!/bin/bash

# Create modules directory if it doesn't exist
mkdir -p src/extension/modules

# Copy all JavaScript module files
cp dist/extension/api.js src/extension/modules/
cp dist/extension/twitter.js src/extension/modules/
cp dist/extension/export.js src/extension/modules/
cp dist/extension/storage.js src/extension/modules/
cp dist/extension/ui-render.js src/extension/modules/
cp dist/extension/scroll.js src/extension/modules/
cp dist/extension/navigation.js src/extension/modules/

# Copy library files
cp dist/extension/html2pdf.bundle.min.js src/extension/modules/
cp dist/extension/marked.min.js src/extension/modules/

# Copy helper files if they exist
if [ -f dist/extension/history-helpers-node.js ]; then
  cp dist/extension/history-helpers-node.js src/extension/modules/
fi

if [ -f dist/extension/navigation-helpers-node.js ]; then
  cp dist/extension/navigation-helpers-node.js src/extension/modules/
fi

if [ -f dist/extension/sanitizer-node.js ]; then
  cp dist/extension/sanitizer-node.js src/extension/modules/
fi

if [ -f dist/extension/structured-helpers-node.js ]; then
  cp dist/extension/structured-helpers-node.js src/extension/modules/
fi

if [ -f dist/extension/twitter-helpers-node.js ]; then
  cp dist/extension/twitter-helpers-node.js src/extension/modules/
fi

# Copy CSS files
cp dist/extension/variables.css src/extension/modules/
cp dist/extension/components.css src/extension/modules/

# Copy main files
cp dist/extension/popup.js src/extension/
cp dist/extension/popup.html src/extension/
cp dist/extension/popup.css ./

echo "All module files synced from dist/extension to src/extension/modules!"
