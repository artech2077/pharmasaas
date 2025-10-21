export type HealthResponse = {
  status: "ok";
  timestamp: string;
};

export const buildHealthResponse = (now: Date = new Date()): HealthResponse => ({
  status: "ok",
  timestamp: now.toISOString()
});
