import { sendSlackMessage } from "@ieum/slack";
import { formatUniqueMemberName } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, protectedMatchmakerProcedure } from "../trpc";

export const blindRouter = createTRPCRouter({
  preRegister: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId } }) => {
      const member = await prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      });

      await prisma.blindPreRegisteredMember.create({
        data: {
          name: member.name,
          phoneNumber: member.phoneNumber,
        },
      });

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `${formatUniqueMemberName(member)} - 이음 블라인드 사전 신청`,
      });

      return true;
    }),
  hasPreRegistered: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx: { prisma }, input: { memberId } }) => {
      const member = await prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          phoneNumber: true,
        },
      });

      const preRegisteredMember =
        await prisma.blindPreRegisteredMember.findUnique({
          where: {
            phoneNumber: member.phoneNumber,
          },
          select: {
            id: true,
          },
        });

      return preRegisteredMember != null;
    }),
});
