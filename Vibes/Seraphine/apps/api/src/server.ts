import http from "node:http";

import { handleRequest } from "./router.js";

export type ServerConfig = {
  /**
   * Port the API server listens on. Defaults to 0 to request an ephemeral port from the OS.
   */
  port?: number;
  /**
   * Hostname to bind to. Defaults to 127.0.0.1 to avoid elevated permission requirements.
   */
  hostname?: string;
};

export const createServer = (config: ServerConfig = {}) => {
  const server = http.createServer(handleRequest);
  const port = typeof config.port === "number" ? config.port : 0;
  const hostname = config.hostname ?? "127.0.0.1";
  return {
    server,
    listen: (onListen?: () => void) => server.listen(port, hostname, onListen),
    close: (onClose?: (err?: Error) => void) => server.close(onClose),
    getPort: () => {
      const address = server.address();
      if (address && typeof address === "object") {
        return address.port;
      }
      return port;
    },
    getHostname: () => hostname
  };
};
