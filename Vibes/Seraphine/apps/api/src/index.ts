import { parseEnv } from "@pharmasaas/config";

import { createServer } from "./server.js";

const main = () => {
  const env = parseEnv({
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT,
    API_HOST: process.env.API_HOST
  });

  const { listen, getPort, getHostname } = createServer({
    port: env.API_PORT ?? 0,
    hostname: env.API_HOST
  });

  listen(() => {
    console.log(
      `@pharmasaas/api running in ${env.NODE_ENV} mode on http://${getHostname()}:${getPort()}`
    );
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
