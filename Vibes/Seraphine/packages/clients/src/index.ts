import type { AuditLogEntry } from "@pharmasaas/domain";

export type RestClientConfig = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export class AuditLogClient {
  readonly #baseUrl: string;
  readonly #fetchImpl: typeof fetch;

  constructor({ baseUrl, fetchImpl = fetch }: RestClientConfig) {
    this.#baseUrl = baseUrl;
    this.#fetchImpl = fetchImpl;
  }

  async record(entry: AuditLogEntry) {
    await this.#fetchImpl(`${this.#baseUrl}/audit-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
  }
}
