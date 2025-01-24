import { z } from "zod";
import { createTRPCRouter, protectedAdminProcedure } from "../../trpc";
import { solapiMessageService } from "~/utils/solapi";

export const adminMessageRouter = createTRPCRouter({
  sendMessage: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.db.basicMember.findUniqueOrThrow({
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
