const request = require('supertest');
const app = require('../../src/server');

describe('API Integration Tests', () => {
  describe('GET /', () => {
    it('should return a greeting', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });

    it('should have correct content-type header', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('GET /hello/:name?', () => {
    it('should return a greeting without name parameter', async () => {
      const response = await request(app).get('/hello');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });

    it('should return a greeting with name parameter', async () => {
      const response = await request(app).get('/hello/John');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world! From John');
    });

    it('should handle names with special characters', async () => {
      const response = await request(app).get('/hello/' + encodeURIComponent('Jean-François'));
      expect(response.status).toBe(200);
      expect(response.text).toContain('Jean-François');
    });

    it('should handle URL encoded names', async () => {
      const response = await request(app).get('/hello/John%20Doe');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world! From John Doe');
    });

    it('should handle empty name parameter with trailing slash', async () => {
      const response = await request(app).get('/hello/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });

    it('should handle very long names', async () => {
      const longName = 'A'.repeat(100);
      const response = await request(app).get(`/hello/${longName}`);
      expect(response.status).toBe(200);
      expect(response.text).toContain(longName);
    });

    it('should handle names with numbers', async () => {
      const response = await request(app).get('/hello/User123');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world! From User123');
    });
  });

  describe('POST /hello', () => {
    it('should return a greeting with x-name header', async () => {
      const response = await request(app)
        .post('/hello')
        .set('x-name', 'Jane');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world! From Jane');
    });

    it('should return a greeting without x-name header', async () => {
      const response = await request(app).post('/hello');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });

    it('should handle empty x-name header', async () => {
      const response = await request(app)
        .post('/hello')
        .set('x-name', '');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });

    it('should handle x-name header with special characters', async () => {
      const response = await request(app)
        .post('/hello')
        .set('x-name', 'Jean-François');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Jean-François');
    });

    it('should handle x-name header with whitespace', async () => {
      const response = await request(app)
        .post('/hello')
        .set('x-name', '   ');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });

    it('should handle very long x-name header', async () => {
      const longName = 'B'.repeat(100);
      const response = await request(app)
        .post('/hello')
        .set('x-name', longName);
      expect(response.status).toBe(200);
      expect(response.text).toContain(longName);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
    });

    it('should return 404 for PUT method on /', async () => {
      const response = await request(app).put('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for DELETE method on /', async () => {
      const response = await request(app).delete('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for PATCH method on /', async () => {
      const response = await request(app).patch('/');
      expect(response.status).toBe(404);
    });

    it('should return 404 for POST method on /', async () => {
      const response = await request(app).post('/');
      expect(response.status).toBe(404);
    });
  });

  describe('Content Negotiation', () => {
    it('should handle requests with Accept header', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'text/html');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world!');
    });

    it('should handle requests with multiple Accept headers', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'application/json, text/html');
      expect(response.status).toBe(200);
    });
  });
});
