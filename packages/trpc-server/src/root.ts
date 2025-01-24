import { adminBasicMatchRouter } from "./routers/admin/basicMatch";
import { adminBasicMemberRouter } from "./routers/admin/basicMember";
import { adminBlindMatchRouter } from "./routers/admin/blindMatch";
import { adminBlindMemberRouter } from "./routers/admin/blindMember";
import { adminMessageRouter } from "./routers/admin/message";
import { matchmakerBasicMatchRouter } from "./routers/matchmaker/basicMatch";
import { matchmakerBasicMemberRouter } from "./routers/matchmaker/basicMember";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  adminBasicMemberRouter,
  adminBasicMatchRouter,
  adminBlindMemberRouter,
  adminBlindMatchRouter,
  adminMessageRouter,
  matchmakerBasicMemberRouter,
  matchmakerBasicMatchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
