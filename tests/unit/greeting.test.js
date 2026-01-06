const { getGreeting } = require('../../src/greeting');

describe('getGreeting', () => {
  it('should return a greeting', () => {
    const greeting = getGreeting();
    expect(greeting).toBe('Hello world!');
  });

  it('should return a greeting with name', () => {
    const greeting = getGreeting('John');
    expect(greeting).toBe('Hello world! From John');
  });
});
