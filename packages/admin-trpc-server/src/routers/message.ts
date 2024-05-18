import { solapiMessageService } from "@ieum/solapi";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const adminMessageRouter = createTRPCRouter({
  sendMessage: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          phoneNumber: true,
        },
      });

      const result = await solapiMessageService.send({
        to: member.phoneNumber,
        from: process.env.ADMIN_PHONE_NUMBER,
        text: "테스트",
      });

      console.log(result);

      return true;
    }),
});
