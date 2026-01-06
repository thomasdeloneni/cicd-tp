const request = require('supertest');
const app = require('../../src/server');

describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should handle SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const response = await request(app)
        .get('/')
        .query({ name: maliciousInput });
      
      expect(response.status).toBe(200);
      expect(response.text).not.toContain('DROP TABLE');
    });

    it('should handle XSS attempts', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const response = await request(app)
        .get('/')
        .query({ name: maliciousInput });
      
      expect(response.status).toBe(200);
      expect(response.text).not.toContain('<script>');
    });

    it('should handle long input strings', async () => {
      const longInput = 'A'.repeat(10000);
      const response = await request(app)
        .get('/')
        .query({ name: longInput });
      
      expect(response.status).toBe(200);
      expect(response.text).toBeDefined();
    });
  });

  describe('HTTP Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['strict-transport-security']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const requests = Array(10).fill().map(() => request(app).get('/'));
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
