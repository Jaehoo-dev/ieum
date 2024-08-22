import { appRouter, createTRPCContext } from "@ieum/admin-trpc-server";
import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "~/env.mjs";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});

export const config = {
  api: {
    responseLimit: "8mb",
  },
};
