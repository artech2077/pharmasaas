import { describe, expect, it } from "vitest";

import { parseEnv } from "../src/env/schema.js";

describe("parseEnv", () => {
  it("parses valid URLs and defaults NODE_ENV to development", () => {
    const result = parseEnv({
      DATABASE_URL: "https://example.com/database",
      CONVEX_URL: "https://example.com/convex",
      API_PORT: "8080",
      API_HOST: "0.0.0.0"
    });

    expect(result.NODE_ENV).toBe("development");
    expect(result.DATABASE_URL).toBe("https://example.com/database");
    expect(result.CONVEX_URL).toBe("https://example.com/convex");
    expect(result.API_PORT).toBe(8080);
    expect(result.API_HOST).toBe("0.0.0.0");
  });

  it("throws for invalid URLs", () => {
    expect(() =>
      parseEnv({
        DATABASE_URL: "not-a-url"
      })
    ).toThrow();
  });

  it("throws for out-of-range API ports", () => {
    expect(() =>
      parseEnv({
        API_PORT: "99999"
      })
    ).toThrow();
  });
});
