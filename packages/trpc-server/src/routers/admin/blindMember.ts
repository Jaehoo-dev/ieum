import { z } from "zod";
import { createTRPCRouter, protectedAdminProcedure } from "../../trpc";
import { $Enums, type BlindMember } from "@prisma/client";
import { match } from "ts-pattern";

export const adminBlindMemberRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        name: z.string(),
        phoneNumber: z.string(),
        gender: z.nativeEnum($Enums.Gender),
        birthYear: z.number(),
        residence: z.string(),
        height: z.number(),
        bodyShape: z.nativeEnum($Enums.BodyShape),
        weight: z.number(),
        mbti: z.nativeEnum($Enums.MBTI),
        workplace: z.string(),
        job: z.string(),
        isSmoker: z.boolean(),
        religion: z.nativeEnum($Enums.Religion),
        idealMinAgeBirthYear: z.number().nullable(),
        idealMaxAgeBirthYear: z.number().nullable(),
        idealRegions: z.array(z.string()),
        idealMinHeight: z.number().nullable(),
        idealMaxHeight: z.number().nullable(),
        idealBodyShapes: z.array(z.nativeEnum($Enums.BodyShape)),
        idealPreferredMbtis: z.array(z.nativeEnum($Enums.MBTI)),
        idealNonPreferredMbtis: z.array(z.nativeEnum($Enums.MBTI)),
        idealIsSmokerOk: z.boolean(),
        idealNonPreferredReligions: z.array(z.nativeEnum($Enums.Religion)),
        nonNegotiableConditions: z.array(z.nativeEnum($Enums.BlindCondition)),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.blindMember.create({
        data: {
          ...input,
          matchesLeft: 5,
        },
      });
    }),
  findAllByGender: protectedAdminProcedure
    .input(
      z.object({
        gender: z.nativeEnum($Enums.Gender),
        includeMatchHistory: z.boolean().optional(),
        includeMembership: z.boolean().optional(),
      }),
    )
    .query(({ ctx, input: { gender, includeMatchHistory = false } }) => {
      return ctx.db.blindMember.findMany({
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
      return ctx.db.blindMember.findUnique({
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
      const self = await ctx.db.blindMember.findUniqueOrThrow({
        where: {
          id: selfId,
        },
        include: {
          matchHistory: true,
        },
      });

      return ctx.db.blindMember.findMany({
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
