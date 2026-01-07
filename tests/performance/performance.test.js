const axios = require("axios");
const app = require("../../src/server");

describe("Performance Tests", () => {
  let server;
  let baseURL;

  beforeAll((done) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseURL = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("Response Time Tests", () => {
    it("GET /hello should respond within 100ms", async () => {
      const startTime = Date.now();
      const res = await axios.get(`${baseURL}/hello`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(res.status).toBe(200);
      expect(responseTime).toBeLessThan(100);
    });

    it("POST /hello should respond within 100ms", async () => {
      const startTime = Date.now();
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "Alice" }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(res.status).toBe(200);
      expect(responseTime).toBeLessThan(100);
    });

    it("GET with name parameter should respond within 100ms", async () => {
      const startTime = Date.now();
      const res = await axios.get(`${baseURL}/hello/TestUser`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(res.status).toBe(200);
      expect(responseTime).toBeLessThan(100);
    });

    it("should handle 100 sequential requests within reasonable time", async () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        await axios.get(`${baseURL}/hello`);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 100 requêtes devraient prendre moins de 10 secondes
      expect(totalTime).toBeLessThan(10000);
    }, 15000); // Timeout à 15s
  });

  describe("Concurrent Request Tests", () => {
    it("should handle 10 concurrent GET requests", async () => {
      const requests = [];

      for (let i = 0; i < 10; i++) {
        requests.push(axios.get(`${baseURL}/hello/User${i}`));
      }

      const results = await Promise.all(requests);

      results.forEach((res, index) => {
        expect(res.status).toBe(200);
        expect(res.data).toBe(`Hello world! From User${index}`);
      });
    });

    it("should handle 20 concurrent POST requests", async () => {
      const requests = [];

      for (let i = 0; i < 20; i++) {
        requests.push(
          axios.post(`${baseURL}/hello`, {}, {
            headers: { "x-name": `User${i}` }
          })
        );
      }

      const results = await Promise.all(requests);

      results.forEach((res, index) => {
        expect(res.status).toBe(200);
        expect(res.data).toBe(`Hello world! From User${index}`);
      });
    });

    it("should handle 50 concurrent mixed requests", async () => {
      const requests = [];

      for (let i = 0; i < 25; i++) {
        requests.push(axios.get(`${baseURL}/hello/User${i}`));
        requests.push(
          axios.post(`${baseURL}/hello`, {}, {
            headers: { "x-name": `PostUser${i}` }
          })
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      results.forEach((res) => {
        expect(res.status).toBe(200);
      });

      // 50 requêtes concurrentes devraient prendre moins de 2 secondes
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it("should handle 100 concurrent requests without errors", async () => {
      const requests = [];

      for (let i = 0; i < 100; i++) {
        requests.push(axios.get(`${baseURL}/hello`));
      }

      const results = await Promise.all(requests);

      expect(results).toHaveLength(100);
      results.forEach((res) => {
        expect(res.status).toBe(200);
        expect(res.data).toBe("Hello world!");
      });
    });
  });

  describe("Load Tests", () => {
    it("should handle sustained load of 200 requests", async () => {
      const batchSize = 20;
      const batches = 10;
      const startTime = Date.now();

      for (let batch = 0; batch < batches; batch++) {
        const requests = [];

        for (let i = 0; i < batchSize; i++) {
          requests.push(axios.get(`${baseURL}/hello/User${batch * batchSize + i}`));
        }

        const results = await Promise.all(requests);

        results.forEach((res) => {
          expect(res.status).toBe(200);
        });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 200 requêtes devraient prendre moins de 15 secondes
      expect(totalTime).toBeLessThan(15000);
    }, 20000); // Timeout à 20s

    it("should maintain performance under continuous load", async () => {
      const iterations = 50;
      const responseTimes = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await axios.get(`${baseURL}/hello`);
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      // Calcul de la moyenne
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / iterations;

      // La moyenne doit être inférieure à 50ms
      expect(avgResponseTime).toBeLessThan(50);

      // Le temps de réponse max ne doit pas dépasser 200ms
      const maxResponseTime = Math.max(...responseTimes);
      expect(maxResponseTime).toBeLessThan(200);
    }, 10000);
  });

  describe("Stress Tests", () => {
    it("should handle very long name parameter efficiently", async () => {
      const longName = "A".repeat(10000);
      const startTime = Date.now();

      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": longName }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(res.status).toBe(200);
      expect(res.data).toContain("From " + longName);
      // Même avec un nom très long, la réponse doit être rapide
      expect(responseTime).toBeLessThan(200);
    });

    it("should handle rapid-fire requests without degradation", async () => {
      const requests = [];
      const startTime = Date.now();

      // Lancer 50 requêtes aussi vite que possible
      for (let i = 0; i < 50; i++) {
        requests.push(axios.get(`${baseURL}/hello`));
      }

      const results = await Promise.all(requests);
      const endTime = Date.now();

      expect(results).toHaveLength(50);
      results.forEach((res) => {
        expect(res.status).toBe(200);
      });

      // Toutes les requêtes devraient être traitées en moins de 1 seconde
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe("Memory and Resource Tests", () => {
    it("should not leak memory with repeated requests", async () => {
      const iterations = 100;

      // Mesure de la mémoire avant
      if (global.gc) {
        global.gc();
      }
      const memBefore = process.memoryUsage().heapUsed;

      // Faire beaucoup de requêtes
      for (let i = 0; i < iterations; i++) {
        await axios.get(`${baseURL}/hello/User${i}`);
      }

      // Mesure de la mémoire après
      if (global.gc) {
        global.gc();
      }
      const memAfter = process.memoryUsage().heapUsed;

      const memIncrease = memAfter - memBefore;
      const memIncreaseInMB = memIncrease / 1024 / 1024;

      // L'augmentation de mémoire ne doit pas dépasser 10 MB
      expect(memIncreaseInMB).toBeLessThan(10);
    }, 15000);

    it("should handle special characters without performance impact", async () => {
      const specialChars = "Alice-Marie";
      const startTime = Date.now();

      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": specialChars }
      });

      const endTime = Date.now();

      expect(res.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle 404 errors quickly", async () => {
      const startTime = Date.now();

      try {
        await axios.get(`${baseURL}/nonexistent`);
      } catch (error) {
        const endTime = Date.now();
        expect(error.response.status).toBe(404);
        expect(endTime - startTime).toBeLessThan(100);
      }
    });

    it("should handle multiple 404s efficiently", async () => {
      const requests = [];

      for (let i = 0; i < 20; i++) {
        requests.push(
          axios.get(`${baseURL}/invalid${i}`).catch((err) => err.response)
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const endTime = Date.now();

      results.forEach((res) => {
        expect(res.status).toBe(404);
      });

      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe("Throughput Tests", () => {
    it("should handle batch of concurrent requests efficiently", async () => {
      const batchSize = 50;
      const requests = [];

      const startTime = Date.now();

      // Lancer 50 requêtes en parallèle
      for (let i = 0; i < batchSize; i++) {
        requests.push(axios.get(`${baseURL}/hello`));
      }

      await Promise.all(requests);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 50 requêtes devraient prendre moins de 1 seconde
      expect(duration).toBeLessThan(1000);

      // Calcul du throughput (req/s)
      const throughput = (batchSize / duration) * 1000;
      expect(throughput).toBeGreaterThan(50); // Au moins 50 req/s
    }, 5000);
  });
});
