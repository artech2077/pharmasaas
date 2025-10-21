export type ConnectionConfig = {
  url: string;
};

export const createConnection = (config: ConnectionConfig): ConnectionConfig => {
  return config;
};
