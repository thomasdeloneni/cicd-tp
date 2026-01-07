const { getGreeting } = require("../../src/greeting");

describe("getGreeting", () => {
  describe("without a name parameter", () => {
    it("returns the hello world message", () => {
      expect(getGreeting()).toBe("Hello world!");
    });
  });

  describe("with a name parameter", () => {
    it("returns a personalized greeting with a simple name", () => {
      expect(getGreeting("Alice")).toBe("Hello world! From Alice");
    });

    it("returns a personalized greeting with a different name", () => {
      expect(getGreeting("Bob")).toBe("Hello world! From Bob");
    });

    it("returns a personalized greeting with a name containing spaces", () => {
      expect(getGreeting("John Doe")).toBe("Hello world! From John Doe");
    });

    it("returns a personalized greeting with a name containing special characters", () => {
      expect(getGreeting("Marie-Claire")).toBe("Hello world! From Marie-Claire");
    });

    it("returns a personalized greeting with accented characters", () => {
      expect(getGreeting("François")).toBe("Hello world! From François");
    });

    it("returns a personalized greeting with unicode characters", () => {
      expect(getGreeting("山田太郎")).toBe("Hello world! From 山田太郎");
    });
  });

  describe("edge cases", () => {
    it("returns default greeting when name is an empty string", () => {
      expect(getGreeting("")).toBe("Hello world!");
    });

    it("returns default greeting when name is null", () => {
      expect(getGreeting(null)).toBe("Hello world!");
    });

    it("returns default greeting when name is undefined", () => {
      expect(getGreeting(undefined)).toBe("Hello world!");
    });

    it("returns default greeting when name is 0", () => {
      expect(getGreeting(0)).toBe("Hello world!");
    });

    it("returns default greeting when name is false", () => {
      expect(getGreeting(false)).toBe("Hello world!");
    });

    it("handles very long names", () => {
      const longName = "A".repeat(1000);
      expect(getGreeting(longName)).toBe(`Hello world! From ${longName}`);
    });

    it("handles names with only whitespace (truthy string)", () => {
      expect(getGreeting("   ")).toBe("Hello world! From    ");
    });

    it("handles numeric strings as names", () => {
      expect(getGreeting("123")).toBe("Hello world! From 123");
    });

    it("handles names with newline characters", () => {
      expect(getGreeting("Alice\nBob")).toBe("Hello world! From Alice\nBob");
    });

    it("handles names with tabs", () => {
      expect(getGreeting("Alice\tBob")).toBe("Hello world! From Alice\tBob");
    });
  });
});
