import { MatchStatus, MegaphoneMatchMemberStatus } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const megaphoneMatchRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        senderId: z.string(),
        receiverId: z.string(),
        initialStatus: z.nativeEnum({
          [MatchStatus.BACKLOG]: MatchStatus.BACKLOG,
          [MatchStatus.PREPARING]: MatchStatus.PREPARING,
        }),
      }),
    )
    .mutation(
      async ({ ctx, input: { senderId, receiverId, initialStatus } }) => {
        return ctx.prisma.megaphoneMatch.create({
          data: {
            status: initialStatus,
            senderId,
            receiverId,
            senderStatus: MegaphoneMatchMemberStatus.PENDING,
          },
        });
      },
    ),
});
