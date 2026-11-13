// Minimal types for the request/response objects Vercel passes to the functions in /api.
// Vercel provides the real `@vercel/node` package at build time; this file exists only so
// `npm run typecheck` can check /api without adding that package (and its dependency tree)
// to the project. It is referenced by tsconfig.api.json and by nothing else.
declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'node:http'

  export type VercelRequest = IncomingMessage & {
    query: Record<string, string | string[]>
    cookies: Record<string, string>
    body: any
  }

  export type VercelResponse = ServerResponse & {
    status: (statusCode: number) => VercelResponse
    json: (body: unknown) => VercelResponse
    send: (body: unknown) => VercelResponse
    redirect: (statusOrUrl: string | number, url?: string) => VercelResponse
  }
}
