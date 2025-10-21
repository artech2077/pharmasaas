import type { IncomingMessage, ServerResponse } from "node:http";

import { describe, expect, it, vi } from "vitest";

import { handleRequest } from "../src/router.js";
import { createServer } from "../src/server.js";

const createMockResponse = () => {
  let body = "";
  const headers = new Map<string, string>();
  const res: Partial<ServerResponse> & { statusCode: number } = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value.toString());
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase()) ?? null;
    },
    end(chunk?: any) {
      if (chunk) {
        body = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");
      }
      return res as ServerResponse;
    }
  };

  return {
    res: res as ServerResponse,
    getBody: () => body,
    getStatusCode: () => res.statusCode,
    getHeaders: () => headers
  };
};

const createMockRequest = (options: Partial<IncomingMessage>): IncomingMessage => {
  return {
    method: "GET",
    url: "/",
    ...options
  } as IncomingMessage;
};

describe("router.handleRequest", () => {
  it("responds to /health with status ok", () => {
    const { res, getBody, getStatusCode } = createMockResponse();
    const req = createMockRequest({ url: "/health" });

    handleRequest(req, res);

    expect(getStatusCode()).toBe(200);
    expect(JSON.parse(getBody())).toEqual(
      expect.objectContaining({
        status: "ok"
      })
    );
  });

  it("returns 404 for unknown routes", () => {
    const { res, getStatusCode } = createMockResponse();
    const req = createMockRequest({ url: "/missing" });

    handleRequest(req, res);

    expect(getStatusCode()).toBe(404);
  });
});

describe("createServer", () => {
  it("invokes listen with provided hostname and port and can be closed", async () => {
    const instance = createServer({ port: 8080, hostname: "127.0.0.1" });
    const listenSpy = vi.spyOn(instance.server, "listen").mockImplementation(
      ((port?: any, host?: any, cb?: any) => {
        const callback = typeof port === "function" ? port : typeof host === "function" ? host : cb;
        if (typeof callback === "function") {
          callback();
        }
        return instance.server;
      }) as unknown as typeof instance.server.listen
    );
    const closeSpy = vi.spyOn(instance.server, "close").mockImplementation(
      ((cb?: any) => {
        if (typeof cb === "function") {
          cb();
        }
        return instance.server;
      }) as unknown as typeof instance.server.close
    );
    const addressSpy = vi
      .spyOn(instance.server, "address")
      .mockReturnValue({ port: 8080, address: "127.0.0.1", family: "IPv4" });

    await new Promise<void>((resolve) => {
      instance.listen(() => resolve());
    });

    expect(listenSpy).toHaveBeenCalledWith(8080, "127.0.0.1", expect.any(Function));
    expect(instance.getPort()).toBe(8080);
    expect(instance.getHostname()).toBe("127.0.0.1");

    await new Promise<void>((resolve) => {
      instance.close(() => resolve());
    });

    expect(closeSpy).toHaveBeenCalled();

    listenSpy.mockRestore();
    closeSpy.mockRestore();
    addressSpy.mockRestore();
  });
});
