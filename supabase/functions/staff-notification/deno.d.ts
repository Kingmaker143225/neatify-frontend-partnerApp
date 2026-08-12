declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
  export function serve(
    options: {
      port?: number;
      hostname?: string;
      onListen?: (localAddr: { hostname: string; port: number }) => void;
      onError?: (error: unknown) => Response | Promise<Response>;
    },
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}
