import { auth } from "@ieum/admin-auth";
import { appRouter, createTRPCContext } from "@ieum/trpc-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });

  return response;
}

const handler = auth(async (req) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext() {
      return createTRPCContext({
        auth: req.auth,
        req,
      });
    },
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  return response;
});

export { handler as GET, handler as POST };
