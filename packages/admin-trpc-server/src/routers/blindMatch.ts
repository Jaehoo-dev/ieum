import { MatchStatus } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const blindMatchRouter = createTRPCRouter({
  findAll: protectedAdminProcedure
    .input(
      z.object({
        statuses: z.array(z.nativeEnum(MatchStatus)).optional(),
        from: z.string(),
        to: z.string(),
      }),
    )
    .query(({ ctx, input: { statuses, from, to } }) => {
      const 상태_필터가_있는가 =
        statuses != null &&
        statuses.length > 0 &&
        statuses.length < Object.values(MatchStatus).length;

      return ctx.prisma.blindMatch.findMany({
        where: {
          status: 상태_필터가_있는가 ? { in: statuses } : undefined,
          createdAt: {
            gte: startOfDay(from),
            lte: endOfDay(to),
          },
        },
        include: {
          members: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  create: protectedAdminProcedure
    .input(
      z.object({
        member1Id: z.number(),
        member2Id: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.blindMatch.create({
        data: {
          members: {
            connect: [{ id: input.member1Id }, { id: input.member2Id }],
          },
          status: "PREPARING",
        },
      });
    }),
  findByMemberId: protectedAdminProcedure
    .input(z.number())
    .query(({ ctx, input: memberId }) => {
      return ctx.prisma.blindMatch.findMany({
        where: {
          members: {
            some: {
              id: memberId,
            },
          },
        },
        include: {
          members: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),
  updateStatus: protectedAdminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.nativeEnum(MatchStatus),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.blindMatch.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    }),
});
