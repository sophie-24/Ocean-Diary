const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// The shared catalog lives at the repository root so the API can seed from the same source.
config.watchFolders = [path.resolve(__dirname, "../..")];

module.exports = config;
