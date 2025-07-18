// Main entry point for the worker

import type {
  Env,
  ApiModuleDefaultHandler,
  ApiModuleOnRequestHandler,
} from "./components/types.ts";
import type {
  ExecutionContext,
  Request as CFRequest,
  Response as CFResponse,
} from "@cloudflare/workers-types";

export default {
  async fetch(
    request: CFRequest,
    env: Env,
    ctx: ExecutionContext
  ): Promise<CFResponse> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // If a request reaches the worker, Cloudflare has already checked for static assets.
    // We only need to handle API routes or return 404 for anything else.

    if (pathname.startsWith("/api/")) {
      const handlerName = pathname.substring("/api/".length);

      // Remove any trailing slash from handlerName if present, to match file names like 'user-trial' not 'user-trial/'
      const cleanHandlerName = handlerName.endsWith("/")
        ? handlerName.slice(0, -1)
        : handlerName;

      if (!cleanHandlerName) {
        return new Response("API endpoint not specified.", {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        });
      }

      try {
        // Dynamically import the handler. Esbuild will resolve this glob pattern at build time.
        const handlerModules = import.meta.glob<{
          default?: ApiModuleDefaultHandler;
          onRequest?: ApiModuleOnRequestHandler;
        }>("./api/*.ts");

        const handlerModuleKey = `./api/${cleanHandlerName}.ts`;
        const handlerModuleLoader = handlerModules[handlerModuleKey];

        if (!handlerModuleLoader) {
          console.log(`API module ./${cleanHandlerName}.ts not found.`);
          return new Response(`API endpoint '${cleanHandlerName}' not found.`, {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }

        const handlerModule = await handlerModuleLoader();

        if (handlerModule && typeof handlerModule.default === "function") {
          const handler = handlerModule.default as ApiModuleDefaultHandler;
          return await handler(request, env, ctx);
        } else if (
          handlerModule &&
          typeof (handlerModule as any).onRequest === "function"
        ) {
          const pagesHandler = (handlerModule as any)
            .onRequest as ApiModuleOnRequestHandler;
          // Construct a context for Pages-style onRequest handlers
          // TODO: Enhance params parsing if dynamic routes like /api/items/[id].ts are used.
          // For now, basic params.
          const routeParams: Record<string, string | string[]> = {};
          // Example: if your glob was functions/api/items/[id].ts and path was /api/items/123,
          // you'd want params: { id: "123" }. This requires more sophisticated routing.
          // For simple file names like /api/user-trial.ts, params will be empty.

          const pagesContext = {
            request,
            env,
            waitUntil: ctx.waitUntil.bind(ctx),
            params: routeParams,
            data: {}, // Placeholder for Pages data property
            next: async () =>
              new Response(
                "next() called in API, but no further handlers defined in this setup.",
                { status: 404, headers: { "Content-Type": "text/plain" } }
              ),
          };
          return await pagesHandler(pagesContext);
        } else {
          console.warn(
            `No default export or onRequest function found in API module: ${cleanHandlerName}.ts`
          );
          return new Response(
            `API endpoint '${cleanHandlerName}' is misconfigured.`,
            {
              status: 404, // Treat misconfigured as not found from a client perspective
              headers: { "Content-Type": "text/plain" },
            }
          );
        }
      } catch (e: any) {
        if (
          e.message?.includes("Cannot find module") ||
          e.message?.includes("module not found") ||
          e.code === "MODULE_NOT_FOUND"
        ) {
          console.log(`API module ./${cleanHandlerName}.ts not found.`);
          return new Response(`API endpoint '${cleanHandlerName}' not found.`, {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }
        console.error(
          `Error executing API handler for '${cleanHandlerName}':`,
          e
        );
        return new Response(
          `Error processing API endpoint '${cleanHandlerName}'.`,
          {
            status: 500,
            headers: { "Content-Type": "text/plain" },
          }
        );
      }
    }

    // If the request is not for /api/* and has reached the worker,
    // it means it didn't match any static asset. So, it's a 404.
    return new Response("Resource not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  },
};
