module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    jest: true,
  },
  overrides: [
    {
      files: [
        '**/__tests__/**/*',
        '**/*.test.*',
        '**/*.spec.*',
        'jest.setup.js',
      ],
      env: {
        jest: true,
      },
      globals: {
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
      },
    },
  ],
};
