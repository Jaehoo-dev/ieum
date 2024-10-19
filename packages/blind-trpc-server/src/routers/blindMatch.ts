import {
  BLIND_MATCH_DURATION_DAYS,
  IEUM_BLIND_MATCHES_PAGE_URL,
  NOT_ENOUGH_HEARTS_ERROR_MESSAGE,
} from "@ieum/constants";
import { BlindMatchStatus } from "@ieum/prisma";
import { sendSlackMessage } from "@ieum/slack";
import { solapiMessageService } from "@ieum/solapi";
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
        const [existingMatch, member] = await Promise.all([
          prisma.blindMatch.findFirst({
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
          }),
          prisma.blindMember.findUniqueOrThrow({
            where: {
              id: proposerId,
            },
            select: {
              heartsLeft: true,
            },
          }),
        ]);

        assert(
          existingMatch == null,
          new TRPCError({
            code: "CONFLICT",
          }),
        );
        assert(
          member.heartsLeft > 0,
          new TRPCError({
            code: "BAD_REQUEST",
            message: "Not enough hearts",
          }),
        );

        await prisma.$transaction([
          prisma.blindMatch.create({
            data: {
              proposerId,
              respondentId,
              status: BlindMatchStatus.PENDING,
              expiresAt: endOfDay(
                addDays(new Date(), BLIND_MATCH_DURATION_DAYS),
              ),
            },
          }),
          prisma.blindMember.update({
            where: {
              id: proposerId,
            },
            data: {
              heartsLeft: {
                decrement: 1,
              },
            },
          }),
        ]);

        return true;
      },
    ),
  accept: protectedBlindProcedure
    .input(
      z.object({
        selfMemberId: z.string(),
        matchId: z.string(),
        kakaoOpenchatUrl: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx: { prisma },
        input: { selfMemberId, matchId, kakaoOpenchatUrl },
      }) => {
        const [member, match] = await Promise.all([
          prisma.blindMember.findUniqueOrThrow({
            where: {
              id: selfMemberId,
            },
            select: {
              nickname: true,
              heartsLeft: true,
            },
          }),
          // NOTE: validate member is respondent of match & get proposer
          prisma.blindMatch.findUniqueOrThrow({
            where: {
              id: matchId,
              respondentId: selfMemberId,
            },
            select: {
              id: true,
              proposer: {
                select: {
                  nickname: true,
                  phoneNumber: true,
                },
              },
            },
          }),
        ]);

        assert(
          member.heartsLeft > 0,
          new TRPCError({
            code: "BAD_REQUEST",
            message: NOT_ENOUGH_HEARTS_ERROR_MESSAGE,
          }),
        );

        await prisma.$transaction([
          prisma.blindMember.update({
            where: {
              id: selfMemberId,
            },
            data: {
              heartsLeft: {
                decrement: 1,
              },
            },
          }),
          prisma.blindMatch.update({
            where: {
              id: match.id,
            },
            data: {
              status: BlindMatchStatus.ACCEPTED,
              acceptedAt: new Date(),
              expiresAt: endOfDay(
                addDays(new Date(), BLIND_MATCH_DURATION_DAYS),
              ),
              kakaoOpenchatUrl,
            },
          }),
        ]);

        try {
          await solapiMessageService.sendOne({
            from: process.env.ADMIN_PHONE_NUMBER,
            to: match.proposer.phoneNumber,
            text: `[이음 블라인드] 축하합니다! ${member.nickname} 님도 하트를 보내 매칭이 성사되어요. 오픈채팅방에 입장해주세요.
${IEUM_BLIND_MATCHES_PAGE_URL}`,
          });
        } catch (err) {
          sendSlackMessage({
            channel: "에러_알림",
            content: `이음 블라인드 성사 알림 실패\nproposer: ${match.proposer.nickname} respondent: ${member.nickname}\n${err}`,
          });
        }

        return true;
      },
    ),
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
          kakaoOpenchatUrl: true,
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
