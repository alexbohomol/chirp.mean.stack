const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: ['node_modules', 'dist', 'coverage', 'build', '*.min.js'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': [
        'warn',
        {
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 100,
          useTabs: false,
          bracketSpacing: true,
          arrowParens: 'always',
          endOfLine: 'lf',
          quoteProps: 'as-needed',
          jsxSingleQuote: true,
        },
      ],
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      'prefer-arrow-callback': 'warn',
      'func-style': ['warn', 'expression', { allowArrowFunctions: true }],
    },
  },
];
