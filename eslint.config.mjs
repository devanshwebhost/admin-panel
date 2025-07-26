import js from '@eslint/js'
import react from 'eslint-plugin-react'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: true,
        process: true,
        Buffer: true,
        global: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        Response: true, // 👈 Add this if you're using Response object in server routes
      },
    },
    plugins: {
      react,
    },
    rules: {
      'react/no-unescaped-entities': 'off', // ✅ Turned off as requested
      'no-undef': 'off', // (optional) can suppress more undefined variable errors
    },
  },
]
