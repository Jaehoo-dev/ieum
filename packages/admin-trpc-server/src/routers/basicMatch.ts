import { MatchStatus, MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
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

      return ctx.prisma.basicMatchV2.findMany({
        where: {
          AND: [
            {
              status: 상태_필터가_있는가 ? { in: statuses } : undefined,
              OR: 이름_필터가_있는가
                ? [
                    { pendingByV2: { some: { name: { equals: name } } } },
                    { rejectedByV2: { some: { name: { equals: name } } } },
                    { acceptedByV2: { some: { name: { equals: name } } } },
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
          pendingByV2: {
            include: {
              idealType: true,
              pendingMatches: true,
              rejectedMatches: true,
              acceptedMatches: true,
              profile: true,
              images: {
                orderBy: {
                  index: "asc",
                },
              },
            },
          },
          rejectedByV2: {
            include: {
              idealType: true,
              pendingMatches: true,
              rejectedMatches: true,
              acceptedMatches: true,
              profile: true,
              images: {
                orderBy: {
                  index: "asc",
                },
              },
            },
          },
          acceptedByV2: {
            include: {
              idealType: true,
              pendingMatches: true,
              rejectedMatches: true,
              acceptedMatches: true,
              profile: true,
              images: {
                orderBy: {
                  index: "asc",
                },
              },
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
        member1Id: z.string(),
        member2Id: z.string(),
        initialStatus: z.nativeEnum({
          [MatchStatus.BACKLOG]: MatchStatus.BACKLOG,
          [MatchStatus.PREPARING]: MatchStatus.PREPARING,
        }),
      }),
    )
    .mutation(
      async ({ ctx, input: { member1Id, member2Id, initialStatus } }) => {
        return ctx.prisma.basicMatchV2.create({
          data: {
            status: initialStatus,
            pendingByV2: {
              connect: [{ id: member1Id }, { id: member2Id }],
            },
          },
        });
      },
    ),
  findByMemberId: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
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

        return ctx.prisma.basicMatchV2.findMany({
          where: {
            AND: [
              {
                status: 상태_필터가_있는가 ? { in: statuses } : undefined,
                OR: [
                  { pendingByV2: { some: { id: memberId } } },
                  { rejectedByV2: { some: { id: memberId } } },
                  { acceptedByV2: { some: { id: memberId } } },
                ],
              },
            ],
            updatedAt: {
              gte: startOfDay(from),
              lte: endOfDay(to),
            },
          },
          include: {
            pendingByV2: {
              include: {
                idealType: true,
                pendingMatches: true,
                rejectedMatches: true,
                acceptedMatches: true,
                profile: true,
                images: {
                  orderBy: {
                    index: "asc",
                  },
                },
              },
            },
            rejectedByV2: {
              include: {
                idealType: true,
                pendingMatches: true,
                rejectedMatches: true,
                acceptedMatches: true,
                profile: true,
                images: {
                  orderBy: {
                    index: "asc",
                  },
                },
              },
            },
            acceptedByV2: {
              include: {
                idealType: true,
                pendingMatches: true,
                rejectedMatches: true,
                acceptedMatches: true,
                profile: true,
                images: {
                  orderBy: {
                    index: "asc",
                  },
                },
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
        id: z.string(),
        status: z.nativeEnum({
          [MatchStatus.BACKLOG]: MatchStatus.BACKLOG,
          [MatchStatus.PREPARING]: MatchStatus.PREPARING,
          [MatchStatus.BROKEN_UP]: MatchStatus.BROKEN_UP,
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.basicMatchV2.update({
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
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { id } }) => {
      const match = await prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          pendingByV2: {
            include: {
              profile: true,
            },
          },
        },
      });

      assert(
        match.pendingByV2.length === 2 &&
          match.pendingByV2[0]?.profile != null &&
          match.pendingByV2[1]?.profile != null,
        "Match must have 2 pending members with profiles.",
      );

      return prisma.$transaction([
        prisma.basicMemberV2.updateMany({
          where: {
            id: {
              in: match.pendingByV2.map((member) => {
                return member.id;
              }),
            },
          },
          data: {
            lastMatchedAt: new Date(),
          },
        }),
        prisma.basicMatchV2.update({
          where: {
            id,
          },
          data: {
            status: MatchStatus.PENDING,
            sentAt: new Date(),
          },
        }),
      ]);
    }),
  bulkShiftPreparingToPending: protectedAdminProcedure.mutation(
    async ({ ctx: { prisma } }) => {
      const preparingMatches = await prisma.basicMatchV2.findMany({
        where: {
          status: MatchStatus.PREPARING,
        },
        select: {
          id: true,
          pendingByV2: {
            select: {
              id: true,
              profile: true,
              status: true,
            },
          },
        },
      });

      preparingMatches.forEach((match) => {
        assert(
          match.pendingByV2.length === 2 &&
            match.pendingByV2[0]?.status === MemberStatus.ACTIVE &&
            match.pendingByV2[1]?.status === MemberStatus.ACTIVE &&
            match.pendingByV2[0].profile != null &&
            match.pendingByV2[1].profile != null,
          "Match must have 2 active members with profiles.",
        );
      });

      const memberIds = new Set(
        preparingMatches.flatMap((match) => {
          return match.pendingByV2.map((member) => {
            return member.id;
          });
        }),
      );

      return prisma.$transaction([
        prisma.basicMatchV2.updateMany({
          where: {
            id: {
              in: preparingMatches.map((match) => {
                return match.id;
              }),
            },
          },
          data: {
            status: MatchStatus.PENDING,
            sentAt: new Date(),
          },
        }),
        prisma.basicMemberV2.updateMany({
          where: {
            id: {
              in: Array.from(memberIds),
            },
          },
          data: {
            lastMatchedAt: new Date(),
          },
        }),
      ]);
    },
  ),
  rejectBy: protectedAdminProcedure
    .input(
      z.object({
        actionMemberId: z.string(),
        matchId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { actionMemberId, matchId } }) => {
      const match = await ctx.prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          rejectedByV2: true,
          acceptedByV2: true,
        },
      });

      const hasOtherReplied =
        match.rejectedByV2.some((member) => {
          return member.id !== actionMemberId;
        }) ||
        match.acceptedByV2.some((member) => {
          return member.id !== actionMemberId;
        });

      return ctx.prisma.basicMatchV2.update({
        where: {
          id: matchId,
        },
        data: {
          status: hasOtherReplied ? MatchStatus.REJECTED : undefined,
          pendingByV2: {
            disconnect: {
              id: actionMemberId,
            },
          },
          rejectedByV2: {
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
        actionMemberId: z.string(),
        matchId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { actionMemberId, matchId } }) => {
      const match = await ctx.prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          rejectedByV2: true,
          acceptedByV2: true,
        },
      });

      function getNewStatus() {
        const hasOtherAccepted = match.acceptedByV2.some((member) => {
          return member.id !== actionMemberId;
        });
        const hasOtherReplied =
          hasOtherAccepted ||
          match.rejectedByV2.some((member) => {
            return member.id !== actionMemberId;
          });

        if (!hasOtherReplied) {
          return undefined;
        }

        return hasOtherAccepted ? MatchStatus.ACCEPTED : MatchStatus.REJECTED;
      }

      return ctx.prisma.basicMatchV2.update({
        where: { id: matchId },
        data: {
          status: getNewStatus(),
          pendingByV2: {
            disconnect: {
              id: actionMemberId,
            },
          },
          acceptedByV2: {
            connect: {
              id: actionMemberId,
            },
          },
        },
      });
    }),
  delete: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.basicMatchV2.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getPendingMatchMembers: protectedAdminProcedure.query(async ({ ctx }) => {
    const matches = await ctx.prisma.basicMatchV2.findMany({
      where: {
        status: MatchStatus.PENDING,
      },
      select: {
        pendingByV2: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            // pendingMatches: true,
          },
        },
      },
    });

    const result = new Map();

    matches.forEach((match) => {
      match.pendingByV2.forEach((member) => {
        if (result.has(member.id)) {
          return;
        }

        result.set(member.id, member);
      });
    });

    return Array.from(result.values());
  }),
});
