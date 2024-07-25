import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const basicMemberVideoRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
        bucketPath: z.string(),
        index: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberVideoV2.create({
        data: {
          member: {
            connect: {
              id: input.memberId,
            },
          },
          bucketPath: input.bucketPath,
          index: input.index,
        },
      });
    }),
  delete: protectedAdminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberVideoV2.delete({
        where: {
          id: input.id,
        },
      });
    }),
  updateIndex: protectedAdminProcedure
    .input(
      z.object({
        id: z.string(),
        index: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberVideoV2.update({
        where: {
          id: input.id,
        },
        data: {
          index: input.index,
        },
      });
    }),
  findByMemberId: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.memberVideoV2.findMany({
        where: {
          memberId: input.memberId,
        },
        orderBy: {
          index: "asc",
        },
      });
    }),
});
