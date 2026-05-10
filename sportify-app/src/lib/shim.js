// Pre-initialize global and process for safety
if (typeof global !== 'undefined') {
  global.process = global.process || { env: { NODE_ENV: 'production' } };
}

// This is a comprehensive shim for node.js modules that are not available in React Native
// It's used to satisfy static analysis during bundling (e.g. by Supabase/ws)
module.exports = {
  // Stream
  Readable: class {},
  Writable: class {},
  Duplex: class {},
  Transform: class {},
  PassThrough: class {},
  Stream: class {},

  // Crypto
  randomBytes: (size) => {
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i++) arr[i] = Math.floor(Math.random() * 256);
    return arr;
  },
  createHash: () => ({ update: () => ({ digest: () => '' }) }),
  createHmac: () => ({ update: () => ({ digest: () => '' }) }),

  // Process-like
  nextTick: (fn) => setTimeout(fn, 0),
  browser: true,
  env: { NODE_ENV: 'production' },

  // Buffer
  Buffer: typeof Buffer !== 'undefined' ? Buffer : class {},

  // URL
  URL: typeof URL !== 'undefined' ? URL : class {},
  parse: (url) => ({}),

  // Events
  EventEmitter: class {
    on() {}
    once() {}
    emit() {}
    removeListener() {}
  },

  // Path/FS (Empty)
  join: (...args) => args.join('/'),
  resolve: (...args) => args.join('/'),
  readFileSync: () => '',
  writeFile: () => {},
};
