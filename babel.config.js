module.exports = {
  presets: [
    ['@babel/preset-flow', {
      allowDeclareFields: true,
    }],
  ],
  plugins: [
    ['@babel/plugin-transform-flow-strip-types', {
      allowDeclareFields: true,
    }],
    '@babel/plugin-proposal-class-properties',
  ],
};
