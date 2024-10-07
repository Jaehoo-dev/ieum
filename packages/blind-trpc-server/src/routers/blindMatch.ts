import { BLIND_MATCH_DURATION_DAYS } from "@ieum/constants";
import { BlindMatchStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { addDays, endOfDay } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedBlindProcedure } from "../trpc";

export const blindMatchRouter = createTRPCRouter({
  propose: protectedBlindProcedure
    .input(
      z.object({
        proposerId: z.string(),
        respondentId: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { prisma }, input: { proposerId, respondentId } }) => {
        const existingMatch = await prisma.blindMatch.findFirst({
          where: {
            OR: [
              {
                proposerId,
                respondentId,
              },
              {
                proposerId: respondentId,
                respondentId: proposerId,
              },
            ],
          },
        });

        assert(
          existingMatch == null,
          new TRPCError({
            code: "CONFLICT",
          }),
        );

        await prisma.blindMatch.create({
          data: {
            proposerId,
            respondentId,
            status: BlindMatchStatus.PENDING,
            expiresAt: endOfDay(addDays(new Date(), BLIND_MATCH_DURATION_DAYS)),
          },
        });

        return true;
      },
    ),
  accept: protectedBlindProcedure
    .input(
      z.object({
        selfMemberId: z.string(),
        matchId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { selfMemberId, matchId } }) => {
      const match = await prisma.blindMatch.findUniqueOrThrow({
        where: {
          id: matchId,
          respondentId: selfMemberId,
        },
        select: {
          id: true,
        },
      });

      await prisma.blindMatch.update({
        where: {
          id: match.id,
        },
        data: {
          status: BlindMatchStatus.ACCEPTED,
          acceptedAt: new Date(),
          expiresAt: endOfDay(addDays(new Date(), BLIND_MATCH_DURATION_DAYS)),
        },
      });

      return true;
    }),
  getMatchInfo: protectedBlindProcedure
    .input(
      z.object({
        selfMemberId: z.string(),
        targetMemberId: z.string(),
      }),
    )
    .query(({ ctx: { prisma }, input: { selfMemberId, targetMemberId } }) => {
      return prisma.blindMatch.findFirst({
        where: {
          OR: [
            {
              proposerId: selfMemberId,
              respondentId: targetMemberId,
            },
            {
              proposerId: targetMemberId,
              respondentId: selfMemberId,
            },
          ],
        },
        select: {
          id: true,
          status: true,
          proposerId: true,
          respondentId: true,
          createdAt: true,
          expiresAt: true,
        },
      });
    }),
  getMatches: protectedBlindProcedure
    .input(
      z.object({
        selfMemberId: z.string(),
      }),
    )
    .query(async ({ ctx: { prisma }, input: { selfMemberId } }) => {
      const matches = await prisma.blindMatch.findMany({
        where: {
          OR: [
            {
              proposerId: selfMemberId,
            },
            {
              respondentId: selfMemberId,
            },
          ],
          expiresAt: {
            gte: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          expiresAt: true,
          status: true,
          proposerId: true,
          respondentId: true,
          proposer: {
            select: {
              id: true,
              nickname: true,
            },
          },
          respondent: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      });

      const pendingMatches = matches.filter((match) => {
        return match.status === BlindMatchStatus.PENDING;
      });
      const acceptedMatches = matches.filter((match) => {
        return match.status === BlindMatchStatus.ACCEPTED;
      });

      const result = {
        pending: {
          proposed: pendingMatches
            .filter((match) => {
              return match.proposerId === selfMemberId;
            })
            .map(
              ({
                proposer,
                respondent,
                proposerId,
                respondentId,
                ...match
              }) => {
                return {
                  ...match,
                  target: {
                    id: respondent.id,
                    nickname: respondent.nickname,
                  },
                };
              },
            ),
          received: pendingMatches
            .filter((match) => {
              return match.respondentId === selfMemberId;
            })
            .map(
              ({
                proposer,
                respondent,
                proposerId,
                respondentId,
                ...match
              }) => {
                return {
                  ...match,
                  target: {
                    id: proposer.id,
                    nickname: proposer.nickname,
                  },
                };
              },
            ),
        },
        accepted: acceptedMatches.map(
          ({ proposer, respondent, proposerId, respondentId, ...match }) => {
            return {
              ...match,
              target: {
                id: selfMemberId === proposerId ? respondent.id : proposer.id,
                nickname:
                  selfMemberId === proposerId
                    ? respondent.nickname
                    : proposer.nickname,
              },
            };
          },
        ),
      };

      return result;
    }),
});
