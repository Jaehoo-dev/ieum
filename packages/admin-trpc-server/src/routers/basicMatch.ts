import { assert } from "@ieum/utils";
import { MatchStatus } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const basicMatchRouter = createTRPCRouter({
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

      return ctx.prisma.basicMatch.findMany({
        where: {
          AND: [
            {
              status: 상태_필터가_있는가 ? { in: statuses } : undefined,
              OR: 이름_필터가_있는가
                ? [
                    { pendingBy: { some: { name: { equals: name } } } },
                    { rejectedBy: { some: { name: { equals: name } } } },
                    { acceptedBy: { some: { name: { equals: name } } } },
                  ]
                : undefined,
            },
          ],
          OR: [
            {
              createdAt: {
                gte: startOfDay(from),
                lte: endOfDay(to),
              },
            },
            {
              updatedAt: {
                gte: startOfDay(from),
                lte: endOfDay(to),
              },
            },
          ],
        },
        include: {
          pendingBy: {
            include: {
              pendingMatches: true,
              rejectedMatches: true,
              acceptedMatches: true,
              profile: true,
            },
          },
          rejectedBy: {
            include: {
              pendingMatches: true,
              rejectedMatches: true,
              acceptedMatches: true,
              profile: true,
            },
          },
          acceptedBy: {
            include: {
              pendingMatches: true,
              rejectedMatches: true,
              acceptedMatches: true,
              profile: true,
            },
          },
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
        initialStatus: z
          .nativeEnum({
            [MatchStatus.BACKLOG]: MatchStatus.BACKLOG,
            [MatchStatus.PREPARING]: MatchStatus.PREPARING,
          })
          .optional(),
      }),
    )
    .mutation(
      async ({ ctx, input: { member1Id, member2Id, initialStatus } }) => {
        return ctx.prisma.basicMatch.create({
          data: {
            status: initialStatus ?? MatchStatus.BACKLOG,
            pendingBy: {
              connect: [{ id: member1Id }, { id: member2Id }],
            },
          },
        });
      },
    ),
  findByMemberId: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
        params: z.object({
          statuses: z.array(z.nativeEnum(MatchStatus)).optional(),
          from: z.string(),
          to: z.string(),
        }),
      }),
    )
    .query(
      ({
        ctx,
        input: {
          memberId,
          params: { statuses, from, to },
        },
      }) => {
        const 상태_필터가_있는가 =
          statuses != null &&
          statuses.length > 0 &&
          statuses.length < Object.values(MatchStatus).length;

        return ctx.prisma.basicMatch.findMany({
          where: {
            AND: [
              {
                status: 상태_필터가_있는가 ? { in: statuses } : undefined,
                OR: [
                  { pendingBy: { some: { id: memberId } } },
                  { rejectedBy: { some: { id: memberId } } },
                  { acceptedBy: { some: { id: memberId } } },
                ],
              },
            ],
            updatedAt: {
              gte: startOfDay(from),
              lte: endOfDay(to),
            },
          },
          include: {
            pendingBy: {
              include: {
                pendingMatches: true,
                rejectedMatches: true,
                acceptedMatches: true,
                profile: true,
              },
            },
            rejectedBy: {
              include: {
                pendingMatches: true,
                rejectedMatches: true,
                acceptedMatches: true,
                profile: true,
              },
            },
            acceptedBy: {
              include: {
                pendingMatches: true,
                rejectedMatches: true,
                acceptedMatches: true,
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      },
    ),
  updateStatus: protectedAdminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.nativeEnum({
          [MatchStatus.BACKLOG]: MatchStatus.BACKLOG,
          [MatchStatus.PREPARING]: MatchStatus.PREPARING,
          [MatchStatus.BROKEN_UP]: MatchStatus.BROKEN_UP,
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.basicMatch.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    }),
  shiftToPending: protectedAdminProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { id } }) => {
      const match = await ctx.prisma.basicMatch.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          pendingBy: {
            include: {
              profile: true,
            },
          },
        },
      });

      assert(
        match.pendingBy[0]?.profile != null &&
          match.pendingBy[1]?.profile != null,
        "Match must have 2 pending members with profiles.",
      );

      return ctx.prisma.basicMatch.update({
        where: {
          id,
        },
        data: {
          status: MatchStatus.PENDING,
        },
      });
    }),
  rejectBy: protectedAdminProcedure
    .input(
      z.object({
        actionMemberId: z.number(),
        matchId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { actionMemberId, matchId } }) => {
      const match = await ctx.prisma.basicMatch.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          rejectedBy: true,
          acceptedBy: true,
        },
      });

      const hasOtherReplied =
        match.rejectedBy.some((member) => {
          return member.id !== actionMemberId;
        }) ||
        match.acceptedBy.some((member) => {
          return member.id !== actionMemberId;
        });

      return ctx.prisma.basicMatch.update({
        where: {
          id: matchId,
        },
        data: {
          status: hasOtherReplied ? MatchStatus.REJECTED : undefined,
          pendingBy: {
            disconnect: {
              id: actionMemberId,
            },
          },
          rejectedBy: {
            connect: {
              id: actionMemberId,
            },
          },
        },
      });
    }),
  acceptBy: protectedAdminProcedure
    .input(
      z.object({
        actionMemberId: z.number(),
        matchId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { actionMemberId, matchId } }) => {
      const match = await ctx.prisma.basicMatch.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          rejectedBy: true,
          acceptedBy: true,
        },
      });

      function getNewStatus() {
        const hasOtherAccepted = match.acceptedBy.some((member) => {
          return member.id !== actionMemberId;
        });
        const hasOtherReplied =
          hasOtherAccepted ||
          match.rejectedBy.some((member) => {
            return member.id !== actionMemberId;
          });

        if (!hasOtherReplied) {
          return undefined;
        }

        return hasOtherAccepted ? MatchStatus.ACCEPTED : MatchStatus.REJECTED;
      }

      return ctx.prisma.basicMatch.update({
        where: { id: matchId },
        data: {
          status: getNewStatus(),
          pendingBy: {
            disconnect: {
              id: actionMemberId,
            },
          },
          acceptedBy: {
            connect: {
              id: actionMemberId,
            },
          },
        },
      });
    }),
  delete: protectedAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.basicMatch.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
