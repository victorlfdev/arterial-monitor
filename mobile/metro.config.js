const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm as a common asset type
config.resolver.assetExts.push('wasm');

module.exports = config;
