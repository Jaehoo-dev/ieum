import { MatchStatus, MemberStatus } from "@ieum/prisma";
import { sendMessageToMatchResultChannel } from "@ieum/slack";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { subDays, subHours } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const basicMatchRouter = createTRPCRouter({
  findActiveMatchesByMemberId: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: { id: memberId, status: MemberStatus.ACTIVE },
        select: {
          pendingMatches: {
            where: {
              status: MatchStatus.PENDING,
              updatedAt: {
                gt: subHours(new Date(), 25),
              },
            },
          },
        },
      });

      return member.pendingMatches;
    }),
  findPastMatchesByMemberId: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: {
          id: memberId,
          status: MemberStatus.ACTIVE,
        },
        select: {
          rejectedMatches: {
            where: {
              status: {
                in: [MatchStatus.PENDING, MatchStatus.REJECTED],
              },
              pendingBy: {
                every: {
                  status: MemberStatus.ACTIVE,
                },
              },
              rejectedBy: {
                every: {
                  status: MemberStatus.ACTIVE,
                },
              },
              acceptedBy: {
                every: {
                  status: MemberStatus.ACTIVE,
                },
              },
              updatedAt: {
                gt: subDays(new Date(), 7),
              },
            },
          },
          acceptedMatches: {
            where: {
              status: {
                in: [
                  MatchStatus.PENDING,
                  MatchStatus.REJECTED,
                  MatchStatus.ACCEPTED,
                ],
              },
              pendingBy: {
                every: {
                  status: MemberStatus.ACTIVE,
                },
              },
              rejectedBy: {
                every: {
                  status: MemberStatus.ACTIVE,
                },
              },
              acceptedBy: {
                every: {
                  status: {
                    in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
                  },
                },
              },
              updatedAt: {
                gt: subDays(new Date(), 7),
              },
            },
          },
        },
      });

      return [...member.rejectedMatches, ...member.acceptedMatches].sort(
        (a, b) => {
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        },
      );
    }),
  getMatchById: publicProcedure
    .input(
      z.object({
        matchId: z.number(),
      }),
    )
    .query(async ({ ctx, input: { matchId } }) => {
      return ctx.prisma.basicMatch.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingBy: {
            where: { status: MemberStatus.ACTIVE },
            select: { id: true },
          },
          rejectedBy: {
            where: { status: MemberStatus.ACTIVE },
            select: { id: true },
          },
          acceptedBy: {
            where: { status: MemberStatus.ACTIVE },
            select: { id: true },
          },
        },
      });
    }),
  getMatchTargetMemberProfile: publicProcedure
    .input(
      z.object({
        selfMemberId: z.number(),
        matchId: z.number(),
      }),
    )
    .query(async ({ ctx, input: { selfMemberId, matchId } }) => {
      const match = await ctx.prisma.basicMatch.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: {
              profile: {
                include: {
                  member: {
                    select: {
                      images: {
                        orderBy: {
                          index: "asc",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          rejectedBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: {
              profile: {
                include: {
                  member: {
                    select: {
                      images: {
                        orderBy: {
                          index: "asc",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          acceptedBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: {
              profile: {
                include: {
                  member: {
                    select: {
                      images: {
                        orderBy: {
                          index: "asc",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      assert(
        match.status === MatchStatus.PENDING ||
          match.status === MatchStatus.ACCEPTED,
        new TRPCError({
          message: "Match must be PENDING or ACCEPTED",
          code: "FORBIDDEN",
        }),
      );

      const matchMembers = [
        ...match.pendingBy,
        ...match.rejectedBy,
        ...match.acceptedBy,
      ];

      assert(
        matchMembers.length === 2,
        new TRPCError({
          message: "Match must have exactly 2 members",
          code: "INTERNAL_SERVER_ERROR",
        }),
      );
      assert(
        matchMembers.some((member) => {
          return member.id === selfMemberId;
        }),
        new TRPCError({
          message: "member requesting must be one of the match members",
          code: "FORBIDDEN",
        }),
      );

      const targetMember = matchMembers.find((member) => {
        return member.id !== selfMemberId;
      });

      assert(
        targetMember != null,
        new TRPCError({
          message: "target member must exist",
          code: "INTERNAL_SERVER_ERROR",
        }),
      );
      assert(
        targetMember.profile != null,
        new TRPCError({
          message: "target member profile must exist",
          code: "INTERNAL_SERVER_ERROR",
        }),
      );

      return targetMember.profile;
    }),
  reject: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        matchId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, matchId } }) => {
      const match = await ctx.prisma.basicMatch.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
          },
          rejectedBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
          },
          acceptedBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
          },
        },
      });

      const members = [
        ...match.pendingBy,
        ...match.rejectedBy,
        ...match.acceptedBy,
      ];

      assert(
        members.length === 2 && members[0] != null && members[1] != null,
        new TRPCError({
          message: "Match must have exactly 2 members",
          code: "INTERNAL_SERVER_ERROR",
        }),
      );

      assert(
        members.some((member) => {
          return member.id === memberId;
        }),
        new TRPCError({
          message: "requesting member must be one of the match members",
          code: "FORBIDDEN",
        }),
      );

      assert(
        match.pendingBy.some((member) => {
          return member.id === memberId;
        }),
        new TRPCError({
          message: "requesting member must be in pendingBy",
          code: "BAD_REQUEST",
        }),
      );

      const hasOtherReplied =
        match.rejectedBy.some((member) => {
          return member.id !== memberId;
        }) ||
        match.acceptedBy.some((member) => {
          return member.id !== memberId;
        });

      const result = await ctx.prisma.basicMatch.update({
        where: {
          id: matchId,
        },
        data: {
          status: hasOtherReplied ? MatchStatus.REJECTED : undefined,
          pendingBy: {
            disconnect: {
              id: memberId,
            },
          },
          rejectedBy: {
            connect: {
              id: memberId,
            },
          },
        },
        include: {
          rejectedBy: true,
          acceptedBy: true,
        },
      });

      if (hasOtherReplied) {
        void sendMessageToMatchResultChannel(
          `[제안 실패]${
            result.acceptedBy.length > 0
              ? `\n수락: ${result.acceptedBy
                  .map((member) => member.name)
                  .join(", ")}`
              : ""
          }${
            result.rejectedBy.length > 0
              ? `\n거절: ${result.rejectedBy
                  .map((member) => member.name)
                  .join(", ")}`
              : ""
          }
          `,
        );
      }

      return true;
    }),
  accept: publicProcedure
    .input(z.object({ memberId: z.number(), matchId: z.number() }))
    .mutation(async ({ ctx, input: { memberId, matchId } }) => {
      const match = await ctx.prisma.basicMatch.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: { profile: true },
          },
          rejectedBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: { profile: true },
          },
          acceptedBy: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: { profile: true },
          },
        },
      });

      const members = [
        ...match.pendingBy,
        ...match.rejectedBy,
        ...match.acceptedBy,
      ];

      assert(
        members.length === 2 && members[0] != null && members[1] != null,
        new TRPCError({
          message: "Match must have exactly 2 members",
          code: "INTERNAL_SERVER_ERROR",
        }),
      );
      assert(
        members.some((member) => {
          return member.id === memberId;
        }),
        new TRPCError({
          message: "requesting member must be one of the match members",
          code: "FORBIDDEN",
        }),
      );

      assert(
        match.pendingBy.some((member) => {
          return member.id === memberId;
        }),
        new TRPCError({
          message: "requesting member must be in pendingBy",
          code: "BAD_REQUEST",
        }),
      );

      const hasOtherAccepted = match.acceptedBy.some((member) => {
        return member.id !== memberId;
      });
      const hasOtherReplied =
        hasOtherAccepted ||
        match.rejectedBy.some((member) => {
          return member.id !== memberId;
        });
      const newStatus = !hasOtherReplied
        ? undefined
        : hasOtherAccepted
        ? MatchStatus.ACCEPTED
        : MatchStatus.REJECTED;

      await ctx.prisma.basicMatch.update({
        where: {
          id: matchId,
        },
        data: {
          status: newStatus,
          pendingBy: {
            disconnect: {
              id: memberId,
            },
          },
          acceptedBy: {
            connect: {
              id: memberId,
            },
          },
        },
      });

      if (hasOtherReplied) {
        void sendMessageToMatchResultChannel(
          `[제안 ${hasOtherAccepted ? "성공" : "실패"}] ${members[0].name} - ${
            members[1].name
          }${hasOtherAccepted ? " 🙌" : ""}`,
        );
      }

      return true;
    }),
});
