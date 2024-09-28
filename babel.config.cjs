module.exports = {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }], // Allows Jest to understand ES modules
      '@babel/preset-typescript', // Support for TypeScript
    ],
  };