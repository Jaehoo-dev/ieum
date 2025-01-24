import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../../trpc";

export const matchmakerBasicMemberRouter = createTRPCRouter({
  findByPhoneNumber: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      }),
    )
    .query(({ ctx, input: { phoneNumber } }) => {
      return ctx.prisma.basicMember.findUnique({
        where: {
          phoneNumber,
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      });
    }),
  getProfileById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMemberProfile.findUnique({
        where: {
          memberId: input.id,
        },
      });
    }),
});
