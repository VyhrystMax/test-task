module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: { 
    "no-unused-vars": "off",
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended'
  ],
};
