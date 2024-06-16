import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const basicMemberImageRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
        bucketPath: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberImage.create({
        data: {
          member: {
            connect: {
              id: input.memberId,
            },
          },
          bucketPath: input.bucketPath,
        },
      });
    }),
  delete: protectedAdminProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberImage.delete({
        where: {
          id: input.id,
        },
      });
    }),
  findByMemberId: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.memberImage.findMany({
        where: {
          memberId: input.memberId,
        },
        orderBy: {
          index: "asc",
        },
      });
    }),
});
