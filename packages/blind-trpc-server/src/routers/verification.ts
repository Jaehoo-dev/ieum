import { sendSlackMessage, SLACK_MANAGER1_ID_MENTION } from "@ieum/slack";
import { z } from "zod";

import { createTRPCRouter, protectedBlindProcedure } from "../trpc";

export const verificationRouter = createTRPCRouter({
  registerMany: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
        bucketPaths: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId, bucketPaths } }) => {
      const [member] = await Promise.all([
        prisma.blindMember.findUniqueOrThrow({
          where: {
            id: memberId,
          },
          select: {
            nickname: true,
            phoneNumber: true,
          },
        }),
        prisma.blindVerificationDocument.createMany({
          data: bucketPaths.map((bucketPath) => {
            return {
              memberId,
              bucketPath,
            };
          }),
        }),
      ]);

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `${member.nickname}(${member.phoneNumber}) 인증 자료 제출 ${SLACK_MANAGER1_ID_MENTION}`,
      });

      return true;
    }),
});
