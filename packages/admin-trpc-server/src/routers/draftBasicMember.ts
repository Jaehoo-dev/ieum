import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const draftBasicMemberRouter = createTRPCRouter({
  getAll: protectedAdminProcedure.query(({ ctx }) => {
    return ctx.prisma.draftBasicMember.findMany({
      select: {
        id: true,
        createdAt: true,
        name: true,
        phoneNumber: true,
        gender: true,
      },
    });
  }),
  findOne: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.draftBasicMember.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
    }),
});
