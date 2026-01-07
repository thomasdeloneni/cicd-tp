const axios = require("axios");
const app = require("../../src/server");
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

describe("E2E GET /hello", () => {
  describe("without name parameter", () => {
    it("responds with Hello world", async () => {
      const res = await axios.get(`${baseURL}/hello`);
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world!");
    });
  });

  describe("with name parameter", () => {
    it("responds with personalized greeting", async () => {
      const res = await axios.get(`${baseURL}/hello/Alice`);
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From Alice");
    });

    it("handles names with spaces", async () => {
      const res = await axios.get(`${baseURL}/hello/John Doe`);
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From John Doe");
    });

    it("handles special characters", async () => {
      const res = await axios.get(`${baseURL}/hello/Marie-Claire`);
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From Marie-Claire");
    });

    it("handles unicode characters (URL encoded)", async () => {
      const res = await axios.get(`${baseURL}/hello/${encodeURIComponent("山田太郎")}`);
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From 山田太郎");
    });
  });
});

describe("E2E POST /hello", () => {
  describe("with x-name header", () => {
    it("responds with personalized greeting", async () => {
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "Alice" }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From Alice");
    });

    it("handles different names", async () => {
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "Bob" }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From Bob");
    });

    it("handles names with spaces", async () => {
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "John Doe" }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From John Doe");
    });

    it("handles special characters", async () => {
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "François" }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From François");
    });

    it("handles latin extended characters", async () => {
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "Jose" }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From Jose");
    });
  });

  describe("without x-name header", () => {
    it("responds with default greeting", async () => {
      const res = await axios.post(`${baseURL}/hello`);
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world!");
    });
  });

  describe("edge cases", () => {
    it("handles empty x-name header", async () => {
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "" }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world!");
    });

    it("handles very long names", async () => {
      const longName = "A".repeat(1000);
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": longName }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe(`Hello world! From ${longName}`);
    });

    it("handles numeric strings", async () => {
      const res = await axios.post(`${baseURL}/hello`, {}, {
        headers: { "x-name": "123" }
      });
      expect(res.status).toBe(200);
      expect(res.data).toBe("Hello world! From 123");
    });
  });
});

describe("E2E Error scenarios", () => {
  it("returns 404 for unknown GET routes", async () => {
    try {
      await axios.get(`${baseURL}/unknown`);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  it("returns 404 for unknown POST routes", async () => {
    try {
      await axios.post(`${baseURL}/unknown`);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
});

describe("E2E Full workflow scenarios", () => {
  it("can handle multiple sequential GET requests", async () => {
    const res1 = await axios.get(`${baseURL}/hello/Alice`);
    const res2 = await axios.get(`${baseURL}/hello/Bob`);
    const res3 = await axios.get(`${baseURL}/hello`);

    expect(res1.data).toBe("Hello world! From Alice");
    expect(res2.data).toBe("Hello world! From Bob");
    expect(res3.data).toBe("Hello world!");
  });

  it("can handle multiple sequential POST requests", async () => {
    const res1 = await axios.post(`${baseURL}/hello`, {}, {
      headers: { "x-name": "Alice" }
    });
    const res2 = await axios.post(`${baseURL}/hello`, {}, {
      headers: { "x-name": "Bob" }
    });
    const res3 = await axios.post(`${baseURL}/hello`);

    expect(res1.data).toBe("Hello world! From Alice");
    expect(res2.data).toBe("Hello world! From Bob");
    expect(res3.data).toBe("Hello world!");
  });

  it("can handle mixed GET and POST requests", async () => {
    const res1 = await axios.get(`${baseURL}/hello/Alice`);
    const res2 = await axios.post(`${baseURL}/hello`, {}, {
      headers: { "x-name": "Bob" }
    });
    const res3 = await axios.get(`${baseURL}/hello`);
    const res4 = await axios.post(`${baseURL}/hello`, {}, {
      headers: { "x-name": "Charlie" }
    });

    expect(res1.data).toBe("Hello world! From Alice");
    expect(res2.data).toBe("Hello world! From Bob");
    expect(res3.data).toBe("Hello world!");
    expect(res4.data).toBe("Hello world! From Charlie");
  });
});
