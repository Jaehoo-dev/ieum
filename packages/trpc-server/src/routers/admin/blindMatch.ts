import { z } from "zod";
import { createTRPCRouter, protectedAdminProcedure } from "../../trpc";
import { MatchStatus } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

export const adminBlindMatchRouter = createTRPCRouter({
  findAll: protectedAdminProcedure
    .input(
      z.object({
        statuses: z.array(z.nativeEnum(MatchStatus)).optional(),
        name: z.string().optional(),
        from: z.string(),
        to: z.string(),
      }),
    )
    .query(({ ctx, input: { statuses, name, from, to } }) => {
      const 상태_필터가_있는가 =
        statuses != null &&
        statuses.length > 0 &&
        statuses.length < Object.values(MatchStatus).length;
      const 이름_필터가_있는가 = name != null && name !== "";

      return ctx.db.blindMatch.findMany({
        where: {
          status: 상태_필터가_있는가 ? { in: statuses } : undefined,
          members: 이름_필터가_있는가
            ? { some: { name: { equals: name } } }
            : undefined,
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
      return ctx.db.$transaction(async (tx) => {
        await tx.blindMatch.create({
          data: {
            members: {
              connect: [{ id: input.member1Id }, { id: input.member2Id }],
            },
            status: "PREPARING",
          },
        });

        await Promise.all([
          tx.blindMember.update({
            where: {
              id: input.member1Id,
            },
            data: {
              matchesLeft: {
                decrement: 1,
              },
            },
          }),
          tx.blindMember.update({
            where: {
              id: input.member2Id,
            },
            data: {
              matchesLeft: {
                decrement: 1,
              },
            },
          }),
        ]);
      });
    }),
  findByMemberId: protectedAdminProcedure
    .input(z.number())
    .query(({ ctx, input: memberId }) => {
      return ctx.db.blindMatch.findMany({
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
      return ctx.db.blindMatch.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    }),
});
