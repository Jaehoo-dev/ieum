import { BlindMatchStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
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
        },
      });
    }),
});
