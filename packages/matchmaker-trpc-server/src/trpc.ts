/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import { getAuth } from "@ieum/firebase-admin";
import { prisma } from "@ieum/prisma";
import { initTRPC, TRPCError } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

interface CreateContextOptions {
  session: null;
  headers: CreateNextContextOptions["req"]["headers"];
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextOptions) {
  return {
    headers: opts.headers,
    session: opts.session,
    prisma,
  };
}

export async function createTRPCContext({ req }: CreateNextContextOptions) {
  return await createContextInner({
    session: null,
    headers: req.headers,
  });
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.headers.authorization;

  if (authHeader == null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const token = authHeader.split(" ")[1];

  if (token == null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);

    return next({
      ctx: {
        ...ctx,
        session: {
          user: decodedToken,
        },
      },
    });
  } catch (err) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

export const protectedProcedure = t.procedure.use(authMiddleware);
