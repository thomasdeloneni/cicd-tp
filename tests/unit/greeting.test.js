const { getGreeting } = require('../../src/greeting');

describe('getGreeting', () => {
  describe('without name parameter', () => {
    it('should return a greeting without name', () => {
      const greeting = getGreeting();
      expect(greeting).toBe('Hello world!');
    });

    it('should return a greeting when undefined is passed', () => {
      const greeting = getGreeting(undefined);
      expect(greeting).toBe('Hello world!');
    });

    it('should return a greeting when null is passed', () => {
      const greeting = getGreeting(null);
      expect(greeting).toBe('Hello world!');
    });

    it('should return a greeting when empty string is passed', () => {
      const greeting = getGreeting('');
      expect(greeting).toBe('Hello world!');
    });

    it('should return a greeting when only whitespace is passed', () => {
      const greeting = getGreeting('   ');
      expect(greeting).toBe('Hello world! From    ');
    });
  });

  describe('with valid name parameter', () => {
    it('should return a greeting with name', () => {
      const greeting = getGreeting('John');
      expect(greeting).toBe('Hello world! From John');
    });

    it('should handle names with special characters', () => {
      const greeting = getGreeting('Jean-François');
      expect(greeting).toBe('Hello world! From Jean-François');
    });

    it('should handle names with numbers', () => {
      const greeting = getGreeting('User123');
      expect(greeting).toBe('Hello world! From User123');
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(1000);
      const greeting = getGreeting(longName);
      expect(greeting).toBe(`Hello world! From ${longName}`);
    });

    it('should handle names with emojis', () => {
      const greeting = getGreeting('John 👋');
      expect(greeting).toBe('Hello world! From John 👋');
    });

    it('should handle single character names', () => {
      const greeting = getGreeting('J');
      expect(greeting).toBe('Hello world! From J');
    });
  });

  describe('with invalid types', () => {
    it('should handle number input', () => {
      const greeting = getGreeting(123);
      expect(greeting).toBe('Hello world! From 123');
    });

    it('should handle boolean input', () => {
      const greeting = getGreeting(true);
      expect(greeting).toBe('Hello world! From true');
    });

    it('should handle object input', () => {
      const greeting = getGreeting({ name: 'John' });
      expect(greeting).toBe('Hello world! From [object Object]');
    });

    it('should handle array input', () => {
      const greeting = getGreeting(['John', 'Doe']);
      expect(greeting).toBe('Hello world! From John,Doe');
    });
  });
});
