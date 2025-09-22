#!/bin/bash

echo "🔄 Syncing module files from dist to src..."
./sync-modules.sh

echo "🔨 Building extension..."
npm run build:extension

echo "✅ Done! Your src and dist directories are now in sync."
echo "📝 Remember to always run this script after making changes to ensure everything stays in sync."
