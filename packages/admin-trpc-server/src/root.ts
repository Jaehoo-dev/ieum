import { basicMatchRouter } from "./routers/basicMatch";
import { basicMemberRouter } from "./routers/basicMember";
import { blindMatchRouter } from "./routers/blindMatch";
import { blindMemberRouter } from "./routers/blindMember";
import { adminMessageRouter } from "./routers/message";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  basicMemberRouter,
  basicMatchRouter,
  blindMemberRouter,
  blindMatchRouter,
  adminMessageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
