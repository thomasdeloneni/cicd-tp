module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  plugins: ["@eslint/js"],
  extends: ["@eslint/js/recommended"],
  rules: {
    "no-unused-vars": "warn",
    "prefer-const": "error",
    eqeqeq: "error",
    semi: ["error", "always"],
  },
};
