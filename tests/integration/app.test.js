const request = require("supertest");
const app = require("../../src/server");

describe("GET /hello", () => {
  describe("without name parameter", () => {
    it("should return Hello world with status 200", async () => {
      const res = await request(app).get("/hello");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world!");
    });
  });

  describe("with name parameter in URL", () => {
    it("should return personalized greeting", async () => {
      const res = await request(app).get("/hello/Alice");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From Alice");
    });

    it("should handle names with spaces (URL encoded)", async () => {
      const res = await request(app).get("/hello/John%20Doe");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From John Doe");
    });

    it("should handle names with special characters", async () => {
      const res = await request(app).get("/hello/Marie-Claire");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From Marie-Claire");
    });

    it("should handle unicode characters (URL encoded)", async () => {
      const res = await request(app).get("/hello/%E5%B1%B1%E7%94%B0%E5%A4%AA%E9%83%8E");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From 山田太郎");
    });

    it("should handle numeric strings", async () => {
      const res = await request(app).get("/hello/123");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From 123");
    });
  });
});

describe("POST /hello", () => {
  describe("with x-name header", () => {
    it("should return personalized greeting with status 200", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "Alice");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From Alice");
    });

    it("should handle different names", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "Bob");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From Bob");
    });

    it("should handle names with spaces", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "John Doe");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From John Doe");
    });

    it("should handle names with special characters", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "Marie-Claire");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From Marie-Claire");
    });

    it("should handle accented characters", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "François");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From François");
    });

    it("should handle latin extended characters", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "Jose");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From Jose");
    });
  });

  describe("without x-name header", () => {
    it("should return default greeting", async () => {
      const res = await request(app).post("/hello");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world!");
    });
  });

  describe("edge cases", () => {
    it("should handle empty x-name header", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world!");
    });

    it("should handle very long names", async () => {
      const longName = "A".repeat(1000);
      const res = await request(app)
        .post("/hello")
        .set("x-name", longName);
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${longName}`);
    });

    it("should handle numeric strings in header", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "123");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world! From 123");
    });

    it("should handle whitespace-only header values (trimmed by HTTP)", async () => {
      const res = await request(app)
        .post("/hello")
        .set("x-name", "   ");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("Hello world!");
    });
  });
});

describe("Invalid routes", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown");
    expect(res.statusCode).toBe(404);
  });

  it("should return 404 for POST to unknown routes", async () => {
    const res = await request(app).post("/unknown");
    expect(res.statusCode).toBe(404);
  });
});
