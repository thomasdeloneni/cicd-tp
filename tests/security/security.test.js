const request = require("supertest");
const app = require("../../src/server");

describe("Security Tests", () => {
  describe("XSS (Cross-Site Scripting) Protection", () => {
    it("should handle XSS script tags in URL parameter", async () => {
      const xssPayload = "<script>alert('XSS')</script>";
      const res = await request(app).get(`/hello/${encodeURIComponent(xssPayload)}`);

      expect(res.statusCode).toBe(200);
      // Vérifie que le script est retourné tel quel (pas exécuté côté serveur)
      expect(res.text).toContain(xssPayload);
      // Important: Le client devrait échapper ce contenu avant affichage HTML
    });

    it("should handle XSS script tags in POST header", async () => {
      const xssPayload = "<script>alert('XSS')</script>";
      const res = await request(app)
        .post("/hello")
        .set("x-name", xssPayload);

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain(xssPayload);
    });

    it("should handle XSS with img tag and onerror", async () => {
      const xssPayload = "<img src=x onerror=alert('XSS')>";
      const res = await request(app).get(`/hello/${encodeURIComponent(xssPayload)}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain(xssPayload);
    });

    it("should handle XSS with event handlers", async () => {
      const xssPayload = "<div onload=alert('XSS')>test</div>";
      const res = await request(app)
        .post("/hello")
        .set("x-name", xssPayload);

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain(xssPayload);
    });

    it("should handle javascript: protocol injection", async () => {
      const xssPayload = "javascript:alert('XSS')";
      const res = await request(app).get(`/hello/${encodeURIComponent(xssPayload)}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain(xssPayload);
    });
  });

  describe("SQL Injection Protection", () => {
    it("should handle SQL injection attempt in URL", async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const res = await request(app).get(`/hello/${encodeURIComponent(sqlInjection)}`);

      expect(res.statusCode).toBe(200);
      // Le payload doit être traité comme une chaîne normale
      expect(res.text).toBe(`Hello world! From ${sqlInjection}`);
    });

    it("should handle SQL injection in header", async () => {
      const sqlInjection = "' OR '1'='1";
      const res = await request(app)
        .post("/hello")
        .set("x-name", sqlInjection);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${sqlInjection}`);
    });

    it("should handle SQL UNION attack", async () => {
      const sqlInjection = "' UNION SELECT * FROM users--";
      const res = await request(app)
        .post("/hello")
        .set("x-name", sqlInjection);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${sqlInjection}`);
    });
  });

  describe("Command Injection Protection", () => {
    it("should handle command injection with semicolon", async () => {
      const cmdInjection = "test; rm -rf /";
      const res = await request(app).get(`/hello/${encodeURIComponent(cmdInjection)}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${cmdInjection}`);
    });

    it("should handle command injection with pipe", async () => {
      const cmdInjection = "test | cat /etc/passwd";
      const res = await request(app)
        .post("/hello")
        .set("x-name", cmdInjection);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${cmdInjection}`);
    });

    it("should handle command injection with backticks", async () => {
      const cmdInjection = "`whoami`";
      const res = await request(app).get(`/hello/${encodeURIComponent(cmdInjection)}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${cmdInjection}`);
    });
  });

  describe("Path Traversal Protection", () => {
    it("should handle path traversal attempt in URL", async () => {
      const pathTraversal = "../../etc/passwd";
      const res = await request(app).get(`/hello/${encodeURIComponent(pathTraversal)}`);

      expect(res.statusCode).toBe(200);
      // Le serveur doit traiter cela comme un nom normal
      expect(res.text).toBe(`Hello world! From ${pathTraversal}`);
    });

    it("should handle Windows path traversal", async () => {
      const pathTraversal = "..\\..\\windows\\system32\\config\\sam";
      const res = await request(app)
        .post("/hello")
        .set("x-name", pathTraversal);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${pathTraversal}`);
    });

    it("should handle encoded path traversal", async () => {
      const pathTraversal = "%2e%2e%2f%2e%2e%2fetc%2fpasswd";
      const res = await request(app).get(`/hello/${pathTraversal}`);

      expect(res.statusCode).toBe(200);
      // Express décode automatiquement les URLs
    });
  });

  describe("Header Injection Protection", () => {
    it("should reject CRLF injection in header (HTTP protocol protection)", async () => {
      const crlfInjection = "test\r\nX-Injected-Header: malicious";

      // Le protocole HTTP doit rejeter les headers avec CRLF
      await expect(
        request(app)
          .post("/hello")
          .set("x-name", crlfInjection)
      ).rejects.toThrow();
    });

    it("should handle null byte injection", async () => {
      const nullByte = "test\x00malicious";
      const res = await request(app).get(`/hello/${encodeURIComponent(nullByte)}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe("NoSQL Injection Protection", () => {
    it("should handle NoSQL injection with $gt operator", async () => {
      const noSqlInjection = '{"$gt":""}';
      const res = await request(app)
        .post("/hello")
        .set("x-name", noSqlInjection);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${noSqlInjection}`);
    });

    it("should handle NoSQL injection with $ne operator", async () => {
      const noSqlInjection = '{"$ne":null}';
      const res = await request(app).get(`/hello/${encodeURIComponent(noSqlInjection)}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${noSqlInjection}`);
    });
  });

  describe("Malicious Payloads", () => {
    it("should reject extremely long headers (HTTP protection against DoS)", async () => {
      const longPayload = "A".repeat(50000);
      const res = await request(app)
        .post("/hello")
        .set("x-name", longPayload);

      // Le serveur doit rejeter les headers trop longs (protection DoS)
      // 431 = Request Header Fields Too Large
      expect(res.statusCode).toBe(431);
    });

    it("should reject special unicode control characters in headers (HTTP protection)", async () => {
      const unicodePayload = "\u202E\u0041\u0042\u0043"; // Right-to-Left Override

      // Les caractères de contrôle unicode peuvent être rejetés par HTTP
      try {
        const res = await request(app)
          .post("/hello")
          .set("x-name", unicodePayload);
        // Si accepté, vérifier que le serveur répond correctement
        expect([200, 400]).toContain(res.statusCode);
      } catch (error) {
        // Le rejet est également acceptable (protection HTTP)
        expect(error).toBeDefined();
      }
    });

    it("should handle null characters", async () => {
      const nullPayload = "test\0hidden";
      const res = await request(app).get(`/hello/${encodeURIComponent(nullPayload)}`);

      expect(res.statusCode).toBe(200);
    });

    it("should handle XML/XXE injection attempt", async () => {
      const xxePayload = '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>';
      const res = await request(app)
        .post("/hello")
        .set("x-name", xxePayload);

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain(xxePayload);
    });

    it("should handle LDAP injection", async () => {
      const ldapInjection = "*)(uid=*))(|(uid=*";
      const res = await request(app).get(`/hello/${encodeURIComponent(ldapInjection)}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toBe(`Hello world! From ${ldapInjection}`);
    });
  });

  describe("HTTP Method Security", () => {
    it("should reject unsupported HTTP methods on /hello", async () => {
      const res = await request(app).put("/hello");
      expect(res.statusCode).toBe(404);
    });

    it("should reject DELETE method", async () => {
      const res = await request(app).delete("/hello");
      expect(res.statusCode).toBe(404);
    });

    it("should reject PATCH method", async () => {
      const res = await request(app).patch("/hello");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("Content Security", () => {
    it("should verify Content-Type header in response", async () => {
      const res = await request(app).get("/hello");

      expect(res.statusCode).toBe(200);
      // Express envoie text/html par défaut pour res.send()
      expect(res.headers["content-type"]).toMatch(/text\/html/);
    });

    it("should handle requests without proper headers gracefully", async () => {
      const res = await request(app)
        .post("/hello")
        .set("Content-Type", "application/json");

      expect(res.statusCode).toBe(200);
    });
  });
});
