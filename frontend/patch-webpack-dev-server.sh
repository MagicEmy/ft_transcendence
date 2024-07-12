#!/bin/sh

echo "Starting webpack-dev-server patch script"

SEARCH_DIR="/app/node_modules/webpack-dev-server"

echo "Searching for deprecated options..."
grep -r "onAfterSetupMiddleware" "$SEARCH_DIR"
grep -r "onBeforeSetupMiddleware" "$SEARCH_DIR"

echo "Patching files..."
find "$SEARCH_DIR" -type f -exec sed -i 's/onAfterSetupMiddleware/setupMiddlewares/g' {} +
find "$SEARCH_DIR" -type f -exec sed -i 's/onBeforeSetupMiddleware/setupMiddlewares/g' {} +

echo "Patch applied. Checking results..."
grep -r "setupMiddlewares" "$SEARCH_DIR"

echo "webpack-dev-server patched successfully"