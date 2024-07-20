import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const basicMemberVideoRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
        bucketPath: z.string(),
        index: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberVideo.create({
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
        id: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberVideo.delete({
        where: {
          id: input.id,
        },
      });
    }),
  updateIndex: protectedAdminProcedure
    .input(
      z.object({
        id: z.number(),
        index: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.memberVideo.update({
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
        memberId: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.memberVideo.findMany({
        where: {
          memberId: input.memberId,
        },
        orderBy: {
          index: "asc",
        },
      });
    }),
});
