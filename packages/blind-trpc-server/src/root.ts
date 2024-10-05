import { blindMatchRouter } from "./routers/blindMatch";
import { blindMemberRouter } from "./routers/blindMember";
import { otpRouter } from "./routers/otp";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  blindMatchRouter,
  blindMemberRouter,
  otpRouter,
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
