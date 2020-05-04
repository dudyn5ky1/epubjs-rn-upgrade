declare module 'react-native-static-server' {
  class StaticServer {
    constructor(
      port?: string,
      root?: string,
      options?: { localOnly?: boolean; keepAlive?: boolean },
    );
    start(): Promise<string>;
    stop(): void;
    kill(): void;
    get origin(): string;
    isRunning(): Promise<boolean>;
  }

  export default StaticServer;
}
