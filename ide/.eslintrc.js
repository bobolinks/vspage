module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    '@tencent/eslint-config-tencent',
    '@tencent/eslint-config-tencent/ts',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/base',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-len': ['error', { code: 240 }],
  },
  parser: '@typescript-eslint/parser',
};
