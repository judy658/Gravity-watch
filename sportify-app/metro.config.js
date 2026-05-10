const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Definite mapping for Node.js modules to our local shim
const SHIM_PATH = path.resolve(__dirname, 'src', 'lib', 'shim.js');

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: SHIM_PATH,
  stream: SHIM_PATH,
  buffer: SHIM_PATH,
  process: SHIM_PATH,
  url: SHIM_PATH,
  path: SHIM_PATH,
  events: SHIM_PATH,
  http: SHIM_PATH,
  https: SHIM_PATH,
  os: SHIM_PATH,
  fs: SHIM_PATH,
  zlib: SHIM_PATH,
  constants: SHIM_PATH,
  net: SHIM_PATH,
  tls: SHIM_PATH,
};

module.exports = config;
