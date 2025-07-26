// eslint.config.mjs

import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import next from 'eslint-config-next';

export default [
  ...next,
  {
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      // Disable unescaped entities warning
      'react/no-unescaped-entities': 'off',
      // Allow JSX syntax parsing
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/react-in-jsx-scope': 'off',
    },
  },
];
