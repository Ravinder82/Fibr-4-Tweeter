#!/bin/bash

# This script is DEPRECATED and should not be used!
# The build script (npm run build:extension) already handles syncing from src to dist.
# Source of truth: src/extension/ -> Build output: dist/extension/

echo "❌ This script is deprecated!"
echo "✅ Use 'npm run build:extension' to sync from src to dist instead."
echo ""
echo "Directory structure:"
echo "  - src/extension/         (source files - edit these)"
echo "  - dist/extension/        (build output - generated)"
echo ""
exit 1
