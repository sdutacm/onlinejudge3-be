module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  // parser: '@typescript-eslint/parser',
  // plugins: ['@typescript-eslint', 'react'],
  // settings: {
  //   react: {
  //     version: 'detect',
  //   },
  // },
  rules: {
    // 'indent': [
    //     'error',
    //     2,
    //     {
    //         SwitchCase: 1,
    //         flatTernaryExpressions: true
    //     }
    // ],
    'no-case-declarations': 'off',
    // 'object-curly-spacing': [
    //   'error',
    //   'always',
    //   {
    //     arraysInObjects: true,
    //     objectsInObjects: true,
    //   }
    // ],
    // 'no-return-await': 'off',
    // 'no-unused-vars': 'warn',
    // 'comma-dangle': ['error', 'always-multiline'],
    // 'function-paren-newline': 'off',
    // 'no-useless-constructor': 'off',
    // 'no-undefined': 'off',
    'no-undef': 'off',
    // 'implicit-arrow-linebreak': 'off',
    // 'no-confusing-arrow': 'off',
    'no-param-reassign': 'off',
    'no-implicit-coercion': 'off',
    // 'guard-for-in': 'off',
    // 'spaced-comment': 'off',
    complexity: 'off',
    'no-unused-expressions': 'off',
    'max-depth': 'off',
    'max-params': 'off',
    'no-useless-constructor': 'off',
    'max-nested-callbacks': 'off',

    // TypeScript
    // '@typescript-eslint/indent': [
    //   'error',
    //   2,
    //   {
    //     SwitchCase: 1,
    //     flatTernaryExpressions: true
    //   }
    // ],
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    // '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    // '@typescript-eslint/prefer-function-type': 'off',
    // '@typescript-eslint/no-useless-constructor': 'off',
    // '@typescript-eslint/spaced-comment': 'off',
    // '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
  },
};
