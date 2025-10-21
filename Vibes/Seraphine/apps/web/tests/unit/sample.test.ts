import { describe, expect, it } from "vitest";

import { GET } from "../../src/app/api/health/route.js";

describe("GET /api/health", () => {
  it("responds with an ok status", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload).toEqual({ status: "ok" });
  });
});
