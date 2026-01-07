const AllureReporter = require('allure-jest/node');

module.exports = {
  testEnvironment: 'allure-jest/node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};
