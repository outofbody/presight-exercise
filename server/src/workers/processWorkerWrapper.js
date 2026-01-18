// Wrapper to load TypeScript worker in development mode
// In production, this file is not needed as processWorker.js exists

const path = require('path');
const { existsSync } = require('fs');

const tsPath = path.join(__dirname, 'processWorker.ts');
const jsPath = path.join(__dirname, 'processWorker.js');

if (existsSync(tsPath) && !existsSync(jsPath)) {
  // Development mode: use tsx to load TypeScript
  // Register tsx loader for TypeScript files
  require('tsx/cjs/api').register();
  require(tsPath);
} else {
  // Production mode: load compiled JavaScript
  require(jsPath);
}
