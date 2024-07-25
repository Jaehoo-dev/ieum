import {
  AnnualIncome,
  AssetsValue,
  BasicCondition,
  BooksReadPerYear,
  createDealBreakerAndClause,
  EducationLevel,
  ExercisePerWeek,
  Gender,
  MBTI,
  MemberStatus,
  OccupationStatus,
  Religion,
  satisfiesDealBreakers,
} from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const basicMatchIndexRouter = createTRPCRouter({
  getMatchIndex: publicProcedure
    .input(
      z.object({
        memberId: z.string(),
        customIdealType: z.object({
          minAgeBirthYear: z.number().nullable(),
          maxAgeBirthYear: z.number().nullable(),
          minHeight: z.number().nullable(),
          maxHeight: z.number().nullable(),
          educationLevel: z.nativeEnum(EducationLevel).nullable(),
          occupationStatuses: z.array(z.nativeEnum(OccupationStatus)),
          preferredMbtis: z.array(z.nativeEnum(MBTI)),
          nonPreferredMbtis: z.array(z.nativeEnum(MBTI)),
          isSmokerOk: z.boolean(),
          preferredReligions: z.array(z.nativeEnum(Religion)),
          nonPreferredReligions: z.array(z.nativeEnum(Religion)),
          minAnnualIncome: z.nativeEnum(AnnualIncome).nullable(),
          minAssetsValue: z.nativeEnum(AssetsValue).nullable(),
          booksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
          isTattooOk: z.boolean(),
          exercisePerWeek: z.nativeEnum(ExercisePerWeek).nullable(),
          shouldHaveCar: z.boolean().nullable(),
          isGamingOk: z.boolean(),
          isPetOk: z.boolean(),
          dealBreakers: z.array(z.nativeEnum(BasicCondition)),
          highPriorities: z.array(z.nativeEnum(BasicCondition)),
          mediumPriorities: z.array(z.nativeEnum(BasicCondition)),
          lowPriorities: z.array(z.nativeEnum(BasicCondition)),
        }),
      }),
    )
    .query(async ({ ctx, input: { memberId, customIdealType } }) => {
      const self = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        include: {
          idealType: true,
        },
      });

      assert(self.idealType != null, "idealType should not be null");

      const 반대_성별 =
        self.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

      const [oppositeGenderCount, oneWayCandidates] = await Promise.all([
        ctx.prisma.basicMemberV2.count({
          where: {
            gender: 반대_성별,
            status: {
              in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
            },
          },
        }),
        ctx.prisma.basicMemberV2.findMany({
          where: {
            gender: 반대_성별,
            status: {
              in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
            },
            AND: createDealBreakerAndClause({
              ...self.idealType,
              ...customIdealType,
            }),
          },
          include: {
            idealType: true,
          },
        }),
      ]);

      const filteredCandidatesCount = oneWayCandidates
        .filter((member) => {
          return member.idealType != null;
        })
        .filter((member) => {
          assert(member.idealType != null, "idealType cannot be null");

          return satisfiesDealBreakers({
            selfIdealType: member.idealType,
            target: self,
          });
        }).length;

      const 비율 = filteredCandidatesCount / oppositeGenderCount;

      if (비율 < 0.12) {
        return "LOW";
      }

      if (비율 < 0.2) {
        return "MID_LOW";
      }

      if (비율 > 0.62) {
        return "HIGH";
      }

      if (비율 > 0.45) {
        return "MID_HIGH";
      }

      return "MID";
    }),
});
