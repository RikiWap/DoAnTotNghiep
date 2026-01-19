module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["react", "@typescript-eslint", "react-hooks"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "off",
  },
};
