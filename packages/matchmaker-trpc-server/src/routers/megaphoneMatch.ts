import {
  MatchStatus,
  MegaphoneMatchMemberStatus,
  MemberStatus,
} from "@ieum/prisma";
import { subHours } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const megaphoneMatchRouter = createTRPCRouter({
  findActiveMatchesAsReceiverByMemberId: publicProcedure
    .input(z.object({ memberId: z.string() }))
    .query(({ ctx: { prisma }, input: { memberId } }) => {
      return prisma.megaphoneMatch.findMany({
        where: {
          status: MatchStatus.PENDING,
          receiverId: memberId,
          sentToReceiverAt: {
            gt: subHours(new Date(), 72),
          },
          receiverStatus: MegaphoneMatchMemberStatus.PENDING,
          receiver: {
            status: {
              in: [
                MemberStatus.PENDING,
                MemberStatus.ACTIVE,
                MemberStatus.INACTIVE,
              ],
            },
          },
          sender: {
            status: MemberStatus.ACTIVE,
          },
        },
        orderBy: {
          sentToReceiverAt: "desc",
        },
        select: {
          id: true,
          status: true,
          sentToReceiverAt: true,
          receiverStatus: true,
          receiverId: true,
        },
      });
    }),
});
