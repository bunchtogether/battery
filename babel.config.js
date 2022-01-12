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
    '@babel/plugin-proposal-class-properties'
  ],
  "env": {
    "test": {
      "plugins": [ "istanbul" ]
    },
    "esm": {},
    "cjs": {
      "presets": [
        ["@babel/env", { 
          "modules": "commonjs", 
          "targets": "> 0.25%, not dead",
          "exclude": ["transform-regenerator"]
        }]
      ],
      "exclude": "@babel/plugin-transform-regenerator"
    }
  }
};
