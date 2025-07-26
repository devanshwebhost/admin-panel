// eslint.config.mjs
import next from 'eslint-config-next';

export default [
  ...next(),
  {
    rules: {
      // Disable rules if needed
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
