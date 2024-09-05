import { MatchStatus, MemberStatus } from "@ieum/prisma";
import { sendSlackMessage, SLACK_USER_ID_MENTION } from "@ieum/slack";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { subDays, subHours } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const basicMatchRouter = createTRPCRouter({
  getDisplayStatus: publicProcedure
    .input(
      z.object({
        matchId: z.string(),
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { matchId, memberId } }) => {
      const match = await ctx.prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          acceptedByV2: true,
          pendingByV2: true,
          rejectedByV2: true,
        },
      });

      const isRejectedByMember = match.rejectedByV2.some((member) => {
        return member.id === memberId;
      });

      if (isRejectedByMember) {
        return MatchStatus.REJECTED;
      }

      return match.status;
    }),
  findActiveMatchesByMemberId: publicProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
          status: {
            in: [
              MemberStatus.PENDING,
              MemberStatus.ACTIVE,
              MemberStatus.INACTIVE,
            ],
          },
        },
        select: {
          pendingMatches: {
            where: {
              status: MatchStatus.PENDING,
              sentAt: {
                gt: subHours(new Date(), 25),
              },
            },
            orderBy: {
              sentAt: "desc",
            },
            select: {
              id: true,
              sentAt: true,
            },
          },
        },
      });

      return member.pendingMatches;
    }),
  findPastMatchesByMemberId: publicProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
          status: {
            in: [
              MemberStatus.PENDING,
              MemberStatus.ACTIVE,
              MemberStatus.INACTIVE,
            ],
          },
        },
        select: {
          rejectedMatches: {
            where: {
              status: {
                in: [MatchStatus.PENDING, MatchStatus.REJECTED],
              },
              pendingByV2: {
                every: {
                  status: {
                    in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
                  },
                },
              },
              rejectedByV2: {
                every: {
                  status: {
                    in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
                  },
                },
              },
              acceptedByV2: {
                every: {
                  status: {
                    in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
                  },
                },
              },
              sentAt: {
                gt: subDays(new Date(), 7),
              },
            },
            orderBy: {
              sentAt: "desc",
            },
            select: {
              id: true,
              sentAt: true,
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
              pendingByV2: {
                every: {
                  status: {
                    in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
                  },
                },
              },
              rejectedByV2: {
                every: {
                  status: {
                    in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
                  },
                },
              },
              acceptedByV2: {
                every: {
                  status: {
                    in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
                  },
                },
              },
              sentAt: {
                gt: subDays(new Date(), 7),
              },
            },
            orderBy: {
              sentAt: "desc",
            },
            select: {
              id: true,
              sentAt: true,
            },
          },
        },
      });

      return {
        rejectedByMember: member.rejectedMatches,
        acceptedByMember: member.acceptedMatches,
      };
    }),
  getMatchById: publicProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { matchId } }) => {
      return ctx.prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            select: { id: true },
          },
          rejectedByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            select: { id: true },
          },
          acceptedByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            select: { id: true },
          },
        },
      });
    }),
  getMatchTargetMemberProfile: publicProcedure
    .input(
      z.object({
        selfMemberId: z.string(),
        matchId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { selfMemberId, matchId } }) => {
      const match = await ctx.prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingByV2: {
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
                      videos: {
                        orderBy: {
                          index: "asc",
                        },
                      },
                      audios: {
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
          rejectedByV2: {
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
                      videos: {
                        orderBy: {
                          index: "asc",
                        },
                      },
                      audios: {
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
          acceptedByV2: {
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
                      videos: {
                        orderBy: {
                          index: "asc",
                        },
                      },
                      audios: {
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
        ...match.pendingByV2,
        ...match.rejectedByV2,
        ...match.acceptedByV2,
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
        memberId: z.string(),
        matchId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, matchId } }) => {
      const match = await ctx.prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
          },
          rejectedByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
          },
          acceptedByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
          },
        },
      });

      const members = [
        ...match.pendingByV2,
        ...match.rejectedByV2,
        ...match.acceptedByV2,
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
        match.pendingByV2.some((member) => {
          return member.id === memberId;
        }),
        new TRPCError({
          message: "requesting member must be in pendingBy",
          code: "BAD_REQUEST",
        }),
      );

      const hasOtherReplied =
        match.rejectedByV2.some((member) => {
          return member.id !== memberId;
        }) ||
        match.acceptedByV2.some((member) => {
          return member.id !== memberId;
        });

      const result = await ctx.prisma.basicMatchV2.update({
        where: {
          id: matchId,
        },
        data: {
          status: hasOtherReplied ? MatchStatus.REJECTED : undefined,
          pendingByV2: {
            disconnect: {
              id: memberId,
            },
          },
          rejectedByV2: {
            connect: {
              id: memberId,
            },
          },
        },
        include: {
          rejectedByV2: true,
          acceptedByV2: true,
        },
      });

      if (hasOtherReplied) {
        void sendSlackMessage({
          channel: "매칭_결과_알림",
          content: `[제안 실패]${
            result.acceptedByV2.length > 0
              ? `\n수락: ${result.acceptedByV2
                  .map((member) => member.name)
                  .join(", ")}`
              : ""
          }${
            result.rejectedByV2.length > 0
              ? `\n거절: ${result.rejectedByV2
                  .map((member) => member.name)
                  .join(", ")}`
              : ""
          }
          `,
        });
      }

      return true;
    }),
  accept: publicProcedure
    .input(z.object({ memberId: z.string(), matchId: z.string() }))
    .mutation(async ({ ctx, input: { memberId, matchId } }) => {
      const match = await ctx.prisma.basicMatchV2.findUniqueOrThrow({
        where: {
          id: matchId,
        },
        include: {
          pendingByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: { profile: true },
          },
          rejectedByV2: {
            where: {
              status: {
                in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
              },
            },
            include: { profile: true },
          },
          acceptedByV2: {
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
        ...match.pendingByV2,
        ...match.rejectedByV2,
        ...match.acceptedByV2,
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
        match.pendingByV2.some((member) => {
          return member.id === memberId;
        }),
        new TRPCError({
          message: "requesting member must be in pendingBy",
          code: "BAD_REQUEST",
        }),
      );

      const hasOtherAccepted = match.acceptedByV2.some((member) => {
        return member.id !== memberId;
      });
      const hasOtherReplied =
        hasOtherAccepted ||
        match.rejectedByV2.some((member) => {
          return member.id !== memberId;
        });
      const newStatus = !hasOtherReplied
        ? undefined
        : hasOtherAccepted
        ? MatchStatus.ACCEPTED
        : MatchStatus.REJECTED;

      await ctx.prisma.basicMatchV2.update({
        where: {
          id: matchId,
        },
        data: {
          status: newStatus,
          pendingByV2: {
            disconnect: {
              id: memberId,
            },
          },
          acceptedByV2: {
            connect: {
              id: memberId,
            },
          },
        },
      });

      if (hasOtherReplied) {
        void sendSlackMessage({
          channel: "매칭_결과_알림",
          content: `[제안 ${hasOtherAccepted ? "성공" : "실패"}] ${
            members[0].name
          } - ${members[1].name}${
            hasOtherAccepted ? ` 🙌 ${SLACK_USER_ID_MENTION}` : ""
          }`,
        });
      }

      return true;
    }),
});
