import type { BlindMember } from "@ieum/prisma";
import {
  BlindCondition,
  BodyShape,
  Gender,
  MBTI,
  Religion,
} from "@ieum/prisma";
import { match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const blindMemberRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        name: z.string(),
        phoneNumber: z.string(),
        gender: z.nativeEnum(Gender),
        birthYear: z.number(),
        residence: z.string(),
        height: z.number(),
        bodyShape: z.nativeEnum(BodyShape),
        weight: z.number(),
        mbti: z.nativeEnum(MBTI),
        workplace: z.string(),
        job: z.string(),
        isSmoker: z.boolean(),
        religion: z.nativeEnum(Religion),
        idealMinAgeBirthYear: z.number().nullable(),
        idealMaxAgeBirthYear: z.number().nullable(),
        idealRegions: z.array(z.string()),
        idealMinHeight: z.number().nullable(),
        idealMaxHeight: z.number().nullable(),
        idealBodyShapes: z.array(z.nativeEnum(BodyShape)),
        idealPreferredMbtis: z.array(z.nativeEnum(MBTI)),
        idealNonPreferredMbtis: z.array(z.nativeEnum(MBTI)),
        idealIsSmokerOk: z.boolean(),
        idealNonPreferredReligions: z.array(z.nativeEnum(Religion)),
        nonNegotiableConditions: z.array(z.nativeEnum(BlindCondition)),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.blindMember.create({
        data: {
          ...input,
          matchesLeft: 5,
        },
      });
    }),
  findAllByGender: protectedAdminProcedure
    .input(
      z.object({
        gender: z.nativeEnum(Gender),
        includeMatchHistory: z.boolean().optional(),
        includeMembership: z.boolean().optional(),
      }),
    )
    .query(({ ctx, input: { gender, includeMatchHistory = false } }) => {
      return ctx.prisma.blindMember.findMany({
        where: {
          gender,
          matchesLeft: {
            gt: 0,
          },
        },
        include: {
          matchHistory: includeMatchHistory,
        },
      });
    }),
  findById: protectedAdminProcedure
    .input(z.number())
    .query(({ ctx, input: id }) => {
      return ctx.prisma.blindMember.findUnique({
        where: {
          id,
        },
        include: {
          matchHistory: true,
        },
      });
    }),
  findNonNegotiableConditionsSatisfiedMembers: protectedAdminProcedure
    .input(z.object({ selfId: z.number() }))
    .query(async ({ ctx, input: { selfId } }) => {
      const self = await ctx.prisma.blindMember.findUniqueOrThrow({
        where: {
          id: selfId,
        },
        include: {
          matchHistory: true,
        },
      });

      return ctx.prisma.blindMember.findMany({
        where: {
          gender: self.gender === "MALE" ? "FEMALE" : "MALE",
          matchesLeft: {
            gt: 0,
          },
          birthYear: {
            gte: self.idealMaxAgeBirthYear ?? undefined,
            lte: self.idealMinAgeBirthYear ?? undefined,
          },
          matchHistory: {
            none: {
              members: {
                some: {
                  id: selfId,
                },
              },
            },
          },
          AND: [
            ...createConditionANDClause(self),
            {
              AND: [
                {
                  OR: [
                    { idealMinAgeBirthYear: null },
                    { idealMinAgeBirthYear: { gte: self.birthYear } },
                  ],
                },
                {
                  OR: [
                    { idealMaxAgeBirthYear: null },
                    { idealMaxAgeBirthYear: { lte: self.birthYear } },
                  ],
                },
              ],
            },
          ],
        },
        include: {
          matchHistory: true,
        },
      });
    }),
});

function createConditionANDClause(member: BlindMember) {
  return member.nonNegotiableConditions.map((condition) => {
    return match(condition)
      .with("HEIGHT", () => {
        return {
          height: {
            gte: member.idealMinHeight ?? undefined,
            lte: member.idealMaxHeight ?? undefined,
          },
        };
      })
      .with("PREFERRED_MBTIS", () => {
        return {
          mbti: {
            in: member.idealPreferredMbtis,
          },
        };
      })
      .with("NON_PREFERRED_MBTIS", () => {
        return {
          mbti: {
            notIn: member.idealNonPreferredMbtis,
          },
        };
      })
      .with("IS_SMOKER_OK", () => {
        return {
          isSmoker: member.idealIsSmokerOk,
        };
      })
      .with("NON_PREFERRED_RELIGIONS", () => {
        return {
          religion: {
            notIn: member.idealNonPreferredReligions,
          },
        };
      })
      .otherwise(() => {
        return {};
      });
  });
}
