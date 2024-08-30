import { basicMatchRouter } from "./routers/basicMatch";
import { basicMemberRouter } from "./routers/basicMember";
import { basicMemberAudioRouter } from "./routers/basicMemberAudio";
import { basicMemberImageRouter } from "./routers/basicMemberImage";
import { basicMemberVideoRouter } from "./routers/basicMemberVideo";
import { blindMatchRouter } from "./routers/blindMatch";
import { blindMemberRouter } from "./routers/blindMember";
import { draftBasicMemberRouter } from "./routers/draftBasicMember";
import { indexingApiRouter } from "./routers/indexingApi";
import { megaphoneMatchRouter } from "./routers/megaphoneMatch";
import { adminMessageRouter } from "./routers/message";
import { reviewRouter } from "./routers/review";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  draftBasicMemberRouter,
  basicMemberRouter,
  basicMemberImageRouter,
  basicMemberVideoRouter,
  basicMemberAudioRouter,
  basicMatchRouter,
  megaphoneMatchRouter,
  blindMemberRouter,
  blindMatchRouter,
  adminMessageRouter,
  indexingApiRouter,
  reviewRouter,
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
