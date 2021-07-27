module.exports = {
  parser: "babel-eslint",
  extends: [
    "bunchtogether",
    "plugin:jasmine/recommended"
  ],
  plugins: [
    "jasmine",
    "import"
  ],
  env: {
    jest: true,
    browser: true,
    jasmine: true
  }
}
