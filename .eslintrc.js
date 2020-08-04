module.exports = {
  extends: '@kot-shrodingera-team/eslint-config-germes/.eslintrc',
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
          },
        ],
      },
    },
  ],
};
