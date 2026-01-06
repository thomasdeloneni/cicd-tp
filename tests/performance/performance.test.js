const request = require('supertest');
const app = require('../../src/server');

describe('Performance Tests', () => {
  describe('Response Time', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/');
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 50;
      const startTime = Date.now();
      
      const requests = Array(concurrentRequests).fill().map(() => 
        request(app).get('/')
      );
      
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Average response time should be reasonable
      const avgResponseTime = totalTime / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(500); // Average under 500ms
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks in repeated requests', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make many requests
      for (let i = 0; i < 100; i++) {
        await request(app).get('/');
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Load Testing', () => {
    it('should handle high load without degradation', async () => {
      const loadTest = async (concurrentUsers, requestsPerUser) => {
        const startTime = Date.now();
        
        const userPromises = Array(concurrentUsers).fill().map(async () => {
          const userRequests = Array(requestsPerUser).fill().map(() => 
            request(app).get('/')
          );
          return Promise.all(userRequests);
        });
        
        await Promise.all(userPromises);
        
        return Date.now() - startTime;
      };
      
      // Test with moderate load
      const moderateLoadTime = await loadTest(10, 10);
      expect(moderateLoadTime).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Test with higher load
      const highLoadTime = await loadTest(20, 20);
      expect(highLoadTime).toBeLessThan(15000); // Should complete within 15 seconds
    });
  });
});
