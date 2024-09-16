import { 매치_유형 } from "@ieum/constants";
import { auth, FirebaseAuthError } from "@ieum/matchmaker-firebase-admin";
import {
  AnnualIncome,
  AssetsValue,
  BasicCondition,
  BodyShape,
  BooksReadPerYear,
  ContactFrequency,
  ContactMethod,
  createDealBreakerAndClause,
  DrinkingFrequency,
  EducationLevel,
  ExercisePerWeek,
  Eyelid,
  FashionStyle,
  Gender,
  MBTI,
  MemberStatus,
  OccupationStatus,
  orderedAnnualIncomes,
  orderedAssetsValues,
  orderedBooksReadPerYears,
  orderedEducationLevels,
  orderedExercisePerWeeks,
  PlannedNumberOfChildren,
  Region,
  Religion,
} from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { assert, hash, krToGlobal } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";
import { generateReferralCode } from "../utils/generateReferralCode";
import { getSimilarityScore } from "../utils/getSimilarityScore";

export const basicMemberRouter = createTRPCRouter({
  getAllByGender: protectedAdminProcedure
    .input(z.nativeEnum(Gender))
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMemberV2.findMany({
        where: {
          gender: input,
          status: MemberStatus.ACTIVE,
        },
      });
    }),
  create: protectedAdminProcedure
    .input(
      z.object({
        self: z.object({
          name: z.string(),
          phoneNumber: z.string(),
          gender: z.nativeEnum(Gender),
          birthYear: z.number(),
          residence: z.string(),
          height: z.number(),
          weight: z.number().nullable(),
          bmi: z.number().nullable(),
          bodyShape: z.nativeEnum(BodyShape).nullable(),
          fashionStyles: z.array(z.nativeEnum(FashionStyle)),
          eyelid: z.nativeEnum(Eyelid).nullable(),
          customEyelid: z.string().nullable(),
          confidentFacialBodyPart: z.string().nullable(),
          educationLevel: z.nativeEnum(EducationLevel),
          graduatedUniversity: z.string().nullable(),
          occupationStatus: z.nativeEnum(OccupationStatus).nullable(),
          workplace: z.string().nullable(),
          job: z.string().nullable(),
          currentSchool: z.string().nullable(),
          mbti: z.nativeEnum(MBTI).nullable(),
          isSmoker: z.boolean(),
          isDrinker: z.boolean(),
          alcoholConsumption: z.string().nullable(),
          alcoholTolerance: z.string().nullable(),
          religion: z.nativeEnum(Religion),
          annualIncome: z.nativeEnum(AnnualIncome).nullable(),
          assetsValue: z.nativeEnum(AssetsValue).nullable(),
          assetManagementApproach: z.string().nullable(),
          hobby: z.string(),
          booksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
          bookTaste: z.string().nullable(),
          leisureActivity: z.string().nullable(),
          siblings: z.string().nullable(),
          characteristics: z.string().nullable(),
          tenYearFuture: z.string().nullable(),
          plannedNumberOfChildren: z
            .nativeEnum(PlannedNumberOfChildren)
            .nullable(),
          lifePhilosophy: z.string().nullable(),
          workPhilosophy: z.string().nullable(),
          hasTattoo: z.boolean(),
          exercisePerWeek: z.nativeEnum(ExercisePerWeek),
          exerciseType: z.string().nullable(),
          hasCar: z.boolean(),
          doesGame: z.boolean().nullable(),
          gameType: z.string().nullable(),
          datingStyle: z.string().nullable(),
          contactStyle: z.string().nullable(),
          marriagePlan: z.string().nullable(),
          contactFrequency: z.nativeEnum(ContactFrequency).nullable(),
          customContactFrequency: z.string().nullable(),
          contactMethod: z.nativeEnum(ContactMethod).nullable(),
          customContactMethod: z.string().nullable(),
          hasPet: z.boolean(),
          selfIntroduction: z.string().nullable(),
          memo: z.string().nullable(),
          imageBucketPaths: z.array(z.string()),
          videoBucketPaths: z.array(z.string()),
          audioBucketPaths: z.array(z.string()),
          personalInfoConsent: z.boolean(),
          isMegaphoneUser: z.boolean(),
        }),
        idealType: z.object({
          minAgeBirthYear: z.number().nullable(),
          maxAgeBirthYear: z.number().nullable(),
          regions: z.array(z.nativeEnum(Region)),
          customRegion: z.string().nullable(),
          minHeight: z.number().nullable(),
          maxHeight: z.number().nullable(),
          bodyShapes: z.array(z.nativeEnum(BodyShape)),
          fashionStyles: z.array(z.nativeEnum(FashionStyle)),
          eyelids: z.array(z.nativeEnum(Eyelid)),
          facialBodyPart: z.string().nullable(),
          educationLevel: z.nativeEnum(EducationLevel).nullable(),
          schoolLevel: z.string().nullable(),
          occupationStatuses: z.array(z.nativeEnum(OccupationStatus)),
          nonPreferredWorkplace: z.string().nullable(),
          nonPreferredJob: z.string().nullable(),
          preferredMbtis: z.array(z.nativeEnum(MBTI)),
          nonPreferredMbtis: z.array(z.nativeEnum(MBTI)),
          isSmokerOk: z.boolean(),
          drinkingFrequency: z.nativeEnum(DrinkingFrequency).nullable(),
          customDrinkingFrequency: z.string().nullable(),
          preferredReligions: z.array(z.nativeEnum(Religion)),
          nonPreferredReligions: z.array(z.nativeEnum(Religion)),
          minAnnualIncome: z.nativeEnum(AnnualIncome).nullable(),
          minAssetsValue: z.nativeEnum(AssetsValue).nullable(),
          hobby: z.string().nullable(),
          booksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
          characteristics: z.string().nullable(),
          lifePhilosophy: z.string().nullable(),
          isTattooOk: z.boolean(),
          exercisePerWeek: z.nativeEnum(ExercisePerWeek).nullable(),
          shouldHaveCar: z.boolean().nullable(),
          isGamingOk: z.boolean().nullable(),
          isPetOk: z.boolean().nullable(),
          idealTypeDescription: z.string().nullable(),
        }),
      }),
    )
    .mutation(
      ({
        ctx,
        input: {
          self: {
            imageBucketPaths,
            videoBucketPaths,
            audioBucketPaths,
            ...selfRest
          },
          idealType,
        },
      }) => {
        return ctx.prisma.basicMemberV2.create({
          data: {
            ...selfRest,
            images: {
              createMany: {
                data: imageBucketPaths.map((bucketPath, index) => {
                  return {
                    bucketPath,
                    index,
                  };
                }),
              },
            },
            videos: {
              createMany: {
                data: videoBucketPaths.map((bucketPath, index) => {
                  return {
                    bucketPath,
                    index,
                  };
                }),
              },
            },
            audios: {
              createMany: {
                data: audioBucketPaths.map((bucketPath, index) => {
                  return {
                    bucketPath,
                    index,
                  };
                }),
              },
            },
            idealType: {
              create: idealType,
            },
            referralCode: generateReferralCode(),
          },
        });
      },
    ),
  update: protectedAdminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          self: z.object({
            name: z.string(),
            phoneNumber: z.string(),
            gender: z.nativeEnum(Gender),
            birthYear: z.number(),
            residence: z.string(),
            height: z.number(),
            weight: z.number().nullable(),
            bmi: z.number().nullable(),
            bodyShape: z.nativeEnum(BodyShape).nullable(),
            fashionStyles: z.array(z.nativeEnum(FashionStyle)),
            eyelid: z.nativeEnum(Eyelid).nullable(),
            customEyelid: z.string().nullable(),
            confidentFacialBodyPart: z.string().nullable(),
            educationLevel: z.nativeEnum(EducationLevel),
            graduatedUniversity: z.string().nullable(),
            occupationStatus: z.nativeEnum(OccupationStatus).nullable(),
            workplace: z.string().nullable(),
            job: z.string().nullable(),
            currentSchool: z.string().nullable(),
            mbti: z.nativeEnum(MBTI).nullable(),
            isSmoker: z.boolean(),
            isDrinker: z.boolean(),
            alcoholConsumption: z.string().nullable(),
            alcoholTolerance: z.string().nullable(),
            religion: z.nativeEnum(Religion),
            annualIncome: z.nativeEnum(AnnualIncome).nullable(),
            assetsValue: z.nativeEnum(AssetsValue).nullable(),
            assetManagementApproach: z.string().nullable(),
            hobby: z.string(),
            booksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
            bookTaste: z.string().nullable(),
            leisureActivity: z.string().nullable(),
            siblings: z.string().nullable(),
            characteristics: z.string().nullable(),
            tenYearFuture: z.string().nullable(),
            plannedNumberOfChildren: z
              .nativeEnum(PlannedNumberOfChildren)
              .nullable(),
            lifePhilosophy: z.string().nullable(),
            workPhilosophy: z.string().nullable(),
            hasTattoo: z.boolean(),
            exercisePerWeek: z.nativeEnum(ExercisePerWeek),
            exerciseType: z.string().nullable(),
            hasCar: z.boolean(),
            doesGame: z.boolean().nullable(),
            gameType: z.string().nullable(),
            datingStyle: z.string().nullable(),
            contactStyle: z.string().nullable(),
            marriagePlan: z.string().nullable(),
            contactFrequency: z.nativeEnum(ContactFrequency).nullable(),
            customContactFrequency: z.string().nullable(),
            contactMethod: z.nativeEnum(ContactMethod).nullable(),
            customContactMethod: z.string().nullable(),
            hasPet: z.boolean(),
            selfIntroduction: z.string().nullable(),
            memo: z.string().nullable(),
          }),
          idealType: z.object({
            minAgeBirthYear: z.number().nullable(),
            maxAgeBirthYear: z.number().nullable(),
            regions: z.array(z.nativeEnum(Region)),
            customRegion: z.string().nullable(),
            minHeight: z.number().nullable(),
            maxHeight: z.number().nullable(),
            bodyShapes: z.array(z.nativeEnum(BodyShape)),
            fashionStyles: z.array(z.nativeEnum(FashionStyle)),
            eyelids: z.array(z.nativeEnum(Eyelid)),
            facialBodyPart: z.string().nullable(),
            educationLevel: z.nativeEnum(EducationLevel).nullable(),
            schoolLevel: z.string().nullable(),
            occupationStatuses: z.array(z.nativeEnum(OccupationStatus)),
            nonPreferredWorkplace: z.string().nullable(),
            nonPreferredJob: z.string().nullable(),
            preferredMbtis: z.array(z.nativeEnum(MBTI)),
            nonPreferredMbtis: z.array(z.nativeEnum(MBTI)),
            isSmokerOk: z.boolean(),
            drinkingFrequency: z.nativeEnum(DrinkingFrequency).nullable(),
            customDrinkingFrequency: z.string().nullable(),
            preferredReligions: z.array(z.nativeEnum(Religion)),
            nonPreferredReligions: z.array(z.nativeEnum(Religion)),
            minAnnualIncome: z.nativeEnum(AnnualIncome).nullable(),
            minAssetsValue: z.nativeEnum(AssetsValue).nullable(),
            hobby: z.string().nullable(),
            booksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
            characteristics: z.string().nullable(),
            lifePhilosophy: z.string().nullable(),
            isTattooOk: z.boolean(),
            exercisePerWeek: z.nativeEnum(ExercisePerWeek).nullable(),
            shouldHaveCar: z.boolean().nullable(),
            isGamingOk: z.boolean().nullable(),
            isPetOk: z.boolean().nullable(),
            idealTypeDescription: z.string().nullable(),
            dealBreakers: z.array(z.nativeEnum(BasicCondition)),
            highPriorities: z.array(z.nativeEnum(BasicCondition)),
            mediumPriorities: z.array(z.nativeEnum(BasicCondition)),
            lowPriorities: z.array(z.nativeEnum(BasicCondition)),
          }),
        }),
      }),
    )
    .mutation(
      ({
        ctx,
        input: {
          id,
          data: { self, idealType },
        },
      }) => {
        return ctx.prisma.$transaction([
          ctx.prisma.basicMemberV2.update({
            where: {
              id,
            },
            data: {
              ...self,
            },
          }),
          ctx.prisma.basicMemberIdealTypeV2.update({
            where: {
              memberId: id,
            },
            data: {
              ...idealType,
            },
          }),
        ]);
      },
    ),
  infiniteFindByGender: protectedAdminProcedure
    .input(
      z.object({
        gender: z.nativeEnum(Gender),
        status: z.nativeEnum(MemberStatus),
        sort: z.enum(["desc", "asc", "lastMatchedAt"]),
        matchType: z.nativeEnum(매치_유형),
        take: z.number().min(1).max(100).default(5),
        cursor: z.string().optional(),
      }),
    )
    .query(
      async ({
        ctx,
        input: { gender, status, sort, matchType, take, cursor },
      }) => {
        const members = await ctx.prisma.basicMemberV2.findMany({
          take: take + 1,
          where: {
            gender,
            status,
            isMegaphoneUser: matchType === 매치_유형.확성기 ? true : undefined,
          },
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
          cursor: cursor ? { id: cursor } : undefined,
          orderBy:
            sort === "lastMatchedAt"
              ? { lastMatchedAt: "asc" }
              : { createdAt: sort },
        });

        const nextCursor =
          members.length > take ? members.pop()!.id : undefined;

        return {
          members,
          nextCursor,
        };
      },
    ),
  findById: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input: { id } }) => {
      return ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          idealType: true,
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
          pendingMatches: true,
          rejectedMatches: true,
          acceptedMatches: true,
          profile: true,
        },
      });
    }),
  searchByName: protectedAdminProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input: { name } }) => {
      return ctx.prisma.basicMemberV2.findMany({
        where: {
          name,
        },
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
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  findMatchCandidates: protectedAdminProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx, input: { memberId: id } }) => {
      const self = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id,
          status: {
            in: [
              MemberStatus.PENDING,
              MemberStatus.ACTIVE,
              MemberStatus.INACTIVE,
            ],
          },
        },
        include: {
          idealType: true,
          blacklisting: true,
          blacklistedBy: true,
        },
      });

      assert(self.idealType != null, "idealType is null");

      const blacklist = Array.from(
        new Set([
          ...self.blacklisting.map((blacklistItem) => {
            return blacklistItem.targetId;
          }),
          ...self.blacklistedBy.map((blacklistItem) => {
            return blacklistItem.blacklisterId;
          }),
        ]),
      );

      const candidates = await ctx.prisma.basicMemberV2.findMany({
        where: {
          status: MemberStatus.ACTIVE,
          gender: self.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
          id: {
            notIn: blacklist,
          },
          phoneNumber: {
            notIn: self.blacklistedPhoneNumbers,
          },
          name: {
            notIn: self.blacklistedNames,
          },
          OR: [
            { referrerCode: { not: self.referralCode } },
            { referrerCode: null },
          ],
          referralCode:
            self.referrerCode != null
              ? {
                  not: self.referrerCode,
                }
              : undefined,
          NOT: {
            OR: [
              {
                blacklistedPhoneNumbers: {
                  has: self.phoneNumber,
                },
              },
              {
                blacklistedNames: {
                  has: self.name,
                },
              },
            ],
          },
          AND: createDealBreakerAndClause(self.idealType),
          pendingMatches: {
            every: {
              pendingByV2: { none: { id: self.id } },
              rejectedByV2: { none: { id: self.id } },
              acceptedByV2: { none: { id: self.id } },
            },
          },
          rejectedMatches: {
            every: {
              pendingByV2: { none: { id: self.id } },
              rejectedByV2: { none: { id: self.id } },
              acceptedByV2: { none: { id: self.id } },
            },
          },
          acceptedMatches: {
            every: {
              pendingByV2: { none: { id: self.id } },
              rejectedByV2: { none: { id: self.id } },
              acceptedByV2: { none: { id: self.id } },
            },
          },
        },
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
        orderBy: {
          createdAt: "desc",
        },
      });

      const { highPriorities, mediumPriorities, lowPriorities } =
        self.idealType;

      if (
        highPriorities.length === 0 &&
        mediumPriorities.length === 0 &&
        lowPriorities.length === 0
      ) {
        return candidates;
      }

      return candidates.sort((a, b) => {
        assert(self.idealType != null, "idealType is null");

        const aIdealTypeSimilarity = getSimilarityScore(self.idealType, a);
        const bIdealTypeSimilarity = getSimilarityScore(self.idealType, b);

        return bIdealTypeSimilarity - aIdealTypeSimilarity;
      });
    }),
  findCustomMatchCandidates: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
        data: z.object({
          minAgeBirthYear: z.number().nullable(),
          maxAgeBirthYear: z.number().nullable(),
          minHeight: z.number().nullable(),
          maxHeight: z.number().nullable(),
          minEducationLevel: z.nativeEnum(EducationLevel).nullable(),
          occupationStatuses: z.array(z.nativeEnum(OccupationStatus)),
          preferredMbtis: z.array(z.nativeEnum(MBTI)),
          nonPreferredMbtis: z.array(z.nativeEnum(MBTI)),
          isSmokerOk: z.boolean(),
          preferredReligions: z.array(z.nativeEnum(Religion)),
          nonPreferredReligions: z.array(z.nativeEnum(Religion)),
          minAnnualIncome: z.nativeEnum(AnnualIncome).nullable(),
          minAssetsValue: z.nativeEnum(AssetsValue).nullable(),
          minBooksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
          isTattooOk: z.boolean(),
          exercisePerWeek: z.nativeEnum(ExercisePerWeek).nullable(),
          shouldHaveCar: z.boolean().nullable(),
          isGamingOk: z.boolean().nullable(),
          isPetOk: z.boolean().nullable(),
          dealBreakers: z.array(z.nativeEnum(BasicCondition)),
          highPriorities: z.array(z.nativeEnum(BasicCondition)),
          mediumPriorities: z.array(z.nativeEnum(BasicCondition)),
          lowPriorities: z.array(z.nativeEnum(BasicCondition)),
        }),
        matchType: z.nativeEnum(매치_유형),
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          memberId,
          data: {
            minAgeBirthYear,
            maxAgeBirthYear,
            minHeight,
            maxHeight,
            minEducationLevel,
            occupationStatuses,
            preferredMbtis,
            nonPreferredMbtis,
            isSmokerOk,
            preferredReligions,
            nonPreferredReligions,
            minAnnualIncome,
            minAssetsValue,
            minBooksReadPerYear,
            isTattooOk,
            exercisePerWeek,
            shouldHaveCar,
            isGamingOk,
            isPetOk,
            dealBreakers,
            highPriorities,
            mediumPriorities,
            lowPriorities,
          },
          matchType,
        },
      }) => {
        const self = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
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
          include: {
            idealType: true,
            blacklisting: true,
            blacklistedBy: true,
          },
        });
        const blacklist = Array.from(
          new Set([
            ...self.blacklisting.map((blacklistItem) => {
              return blacklistItem.targetId;
            }),
            ...self.blacklistedBy.map((blacklistItem) => {
              return blacklistItem.blacklisterId;
            }),
          ]),
        );
        const dealBreakersSet = new Set(dealBreakers);

        const candidates = await ctx.prisma.basicMemberV2.findMany({
          where: {
            status: MemberStatus.ACTIVE,
            gender: self.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
            id: {
              notIn: blacklist,
            },
            phoneNumber: {
              notIn: self.blacklistedPhoneNumbers,
            },
            name: {
              notIn: self.blacklistedNames,
            },
            OR: [
              { referrerCode: null },
              { referrerCode: { not: self.referralCode } },
            ],
            referralCode:
              self.referrerCode != null
                ? { not: self.referrerCode }
                : undefined,
            NOT: {
              OR: [
                {
                  blacklistedPhoneNumbers: {
                    has: self.phoneNumber,
                  },
                },
                {
                  blacklistedNames: {
                    has: self.name,
                  },
                },
              ],
            },
            AND: [
              {
                birthYear: dealBreakersSet.has(BasicCondition.AGE)
                  ? {
                      lte: minAgeBirthYear ?? undefined,
                      gte: maxAgeBirthYear ?? undefined,
                    }
                  : undefined,
                height: dealBreakersSet.has(BasicCondition.HEIGHT)
                  ? {
                      gte: minHeight ?? undefined,
                      lte: maxHeight ?? undefined,
                    }
                  : undefined,
                educationLevel:
                  minEducationLevel != null &&
                  dealBreakersSet.has(BasicCondition.EDUCATION_LEVEL)
                    ? {
                        in: orderedEducationLevels.slice(
                          orderedEducationLevels.indexOf(minEducationLevel),
                        ),
                      }
                    : undefined,
                // occupationStatus:
                //   dealBreakersSet.has(BasicCondition.OCCUPATION_STATUS) &&
                //   occupationStatuses.length > 0
                //     ? {
                //         in: occupationStatuses,
                //       }
                //     : undefined,
              },
              {
                mbti:
                  dealBreakersSet.has(BasicCondition.PREFERRED_MBTIS) &&
                  preferredMbtis.length > 0
                    ? { in: preferredMbtis }
                    : undefined,
              },
              {
                mbti:
                  dealBreakersSet.has(BasicCondition.NON_PREFERRED_MBTIS) &&
                  nonPreferredMbtis.length > 0
                    ? { notIn: nonPreferredMbtis }
                    : undefined,
              },
              {
                isSmoker:
                  dealBreakersSet.has(BasicCondition.IS_SMOKER_OK) &&
                  !isSmokerOk
                    ? false
                    : undefined,
              },
              {
                religion:
                  dealBreakersSet.has(BasicCondition.PREFERRED_RELIGIONS) &&
                  preferredReligions.length > 0
                    ? { in: preferredReligions }
                    : undefined,
              },
              {
                religion:
                  dealBreakersSet.has(BasicCondition.NON_PREFERRED_RELIGIONS) &&
                  nonPreferredReligions.length > 0
                    ? { notIn: nonPreferredReligions }
                    : undefined,
              },
              {
                annualIncome:
                  minAnnualIncome != null &&
                  dealBreakersSet.has(BasicCondition.MIN_ANNUAL_INCOME)
                    ? {
                        in: orderedAnnualIncomes.slice(
                          orderedAnnualIncomes.indexOf(minAnnualIncome),
                        ),
                      }
                    : undefined,
                assetsValue:
                  minAssetsValue != null &&
                  dealBreakersSet.has(BasicCondition.MIN_ASSETS_VALUE)
                    ? {
                        in: orderedAssetsValues.slice(
                          orderedAssetsValues.indexOf(minAssetsValue),
                        ),
                      }
                    : undefined,
                booksReadPerYear:
                  minBooksReadPerYear != null &&
                  dealBreakersSet.has(BasicCondition.BOOKS_READ_PER_YEAR)
                    ? {
                        in: orderedBooksReadPerYears.slice(
                          orderedBooksReadPerYears.indexOf(minBooksReadPerYear),
                        ),
                      }
                    : undefined,
                hasTattoo:
                  dealBreakersSet.has(BasicCondition.IS_TATTOO_OK) &&
                  !isTattooOk
                    ? false
                    : undefined,
                exercisePerWeek:
                  exercisePerWeek != null &&
                  dealBreakersSet.has(BasicCondition.EXERCISE_PER_WEEK)
                    ? { in: orderedExercisePerWeeks.slice(1) }
                    : undefined,
                hasCar: dealBreakersSet.has(BasicCondition.SHOULD_HAVE_CAR)
                  ? shouldHaveCar ?? undefined
                  : undefined,
                doesGame: dealBreakersSet.has(BasicCondition.IS_GAMING_OK)
                  ? isGamingOk ?? undefined
                  : undefined,
                hasPet: dealBreakersSet.has(BasicCondition.IS_PET_OK)
                  ? isPetOk ?? undefined
                  : undefined,
              },
            ],
            pendingMatches: {
              every: {
                pendingByV2: { none: { id: self.id } },
                rejectedByV2: { none: { id: self.id } },
                acceptedByV2: { none: { id: self.id } },
              },
            },
            rejectedMatches: {
              every: {
                pendingByV2: { none: { id: self.id } },
                rejectedByV2: { none: { id: self.id } },
                acceptedByV2: { none: { id: self.id } },
              },
            },
            acceptedMatches: {
              every: {
                pendingByV2: { none: { id: self.id } },
                rejectedByV2: { none: { id: self.id } },
                acceptedByV2: { none: { id: self.id } },
              },
            },
            // TODO: 정교화(receiver였을 땐?, 확성기 -> 기본 영향도 생각해야 하나?)
            megaphoneMatchesAsReceiver:
              matchType === 매치_유형.확성기
                ? { none: { senderId: self.id } }
                : undefined,
          },
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
          orderBy: {
            createdAt: "desc",
          },
        });

        if (
          highPriorities.length === 0 &&
          mediumPriorities.length === 0 &&
          lowPriorities.length === 0
        ) {
          return candidates;
        }

        return candidates.sort((a, b) => {
          assert(self.idealType != null, "idealType is null");

          const aIdealTypeSimilarity = getSimilarityScore(self.idealType, a);
          const bIdealTypeSimilarity = getSimilarityScore(self.idealType, b);

          return bIdealTypeSimilarity - aIdealTypeSimilarity;
        });
      },
    ),
  addToBlacklist: protectedAdminProcedure
    .input(z.object({ actionMemberId: z.string(), targetMemberId: z.string() }))
    .mutation(async ({ ctx, input: { actionMemberId, targetMemberId } }) => {
      return ctx.prisma.basicBlacklistItemV2.create({
        data: {
          blacklisterId: actionMemberId,
          targetId: targetMemberId,
        },
      });
    }),
  softDelete: protectedAdminProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input: { memberId } }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const member = await tx.basicMemberV2.findUniqueOrThrow({
          where: {
            id: memberId,
          },
          include: {
            pendingMatches: true,
            profile: true,
            images: true,
            videos: true,
            audios: true,
          },
        });

        await Promise.all([
          supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
            )
            .remove(member.images.map((image) => image.bucketPath)),
          supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!,
            )
            .remove(member.videos.map((video) => video.bucketPath)),
          supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!,
            )
            .remove(member.audios.map((audio) => audio.bucketPath)),
        ]);

        await Promise.all([
          tx.memberImageV2.deleteMany({
            where: {
              memberId: member.id,
            },
          }),
          tx.memberVideoV2.deleteMany({
            where: {
              memberId: member.id,
            },
          }),
          tx.memberAudio.deleteMany({
            where: {
              memberId: member.id,
            },
          }),
        ]);

        await tx.basicMatchV2.deleteMany({
          where: {
            id: {
              in: member.pendingMatches.map((match) => {
                return match.id;
              }),
            },
          },
        });

        if (member.profile != null) {
          await tx.basicMemberProfileV2.delete({
            where: {
              memberId: member.id,
            },
          });
        }

        try {
          const firebaseUser = await auth.getUserByPhoneNumber(
            krToGlobal(member.phoneNumber),
          );
          await auth.deleteUser(firebaseUser.uid);
        } catch (error) {
          if (
            !(error instanceof FirebaseAuthError) ||
            error.code !== "auth/user-not-found"
          ) {
            throw error;
          }
        }

        return tx.basicMemberV2.update({
          where: {
            id: memberId,
          },
          data: {
            phoneNumber: hash(
              member.phoneNumber,
              process.env.SOFT_DELETE_SECRET_KEY!,
            ),
            status: MemberStatus.DELETED,
          },
        });
      });
    }),
  hardDelete: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const member = await tx.basicMemberV2.findUniqueOrThrow({
          where: {
            id,
          },
          include: {
            pendingMatches: true,
            rejectedMatches: true,
            acceptedMatches: true,
            profile: true,
            images: true,
            videos: true,
            audios: true,
          },
        });

        const matches = [
          ...member.pendingMatches,
          ...member.rejectedMatches,
          ...member.acceptedMatches,
        ];

        await tx.basicMatchV2.deleteMany({
          where: {
            id: {
              in: matches.map((match) => {
                return match.id;
              }),
            },
          },
        });

        await Promise.all([
          supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
            )
            .remove(member.images.map((image) => image.bucketPath)),
          supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!,
            )
            .remove(member.videos.map((video) => video.bucketPath)),
          supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!,
            )
            .remove(member.audios.map((audio) => audio.bucketPath)),
        ]);

        await Promise.all([
          tx.memberImageV2.deleteMany({
            where: {
              memberId: member.id,
            },
          }),
          tx.memberVideoV2.deleteMany({
            where: {
              memberId: member.id,
            },
          }),
          tx.memberAudio.deleteMany({
            where: {
              memberId: member.id,
            },
          }),
        ]);

        if (member.profile != null) {
          await tx.basicMemberProfileV2.delete({
            where: {
              memberId: member.id,
            },
          });
        }

        return tx.basicMemberV2.delete({
          where: {
            id,
          },
        });
      });
    }),
  activate: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.prisma.basicMemberV2.update({
        where: {
          id,
        },
        data: {
          status: MemberStatus.ACTIVE,
        },
      });
    }),
  inactivate: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.prisma.basicMemberV2.update({
        where: {
          id,
        },
        data: {
          status: MemberStatus.INACTIVE,
        },
      });
    }),
  createProfile: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
        profile: z.object({
          birthYear: z.number(),
          residence: z.string(),
          height: z.number(),
          education: z.string(),
          job: z.string(),
          annualIncome: z.string().nullable(),
          assetsValue: z.string().nullable(),
          mbti: z.string().nullable(),
          hobby: z.string().nullable(),
          characteristic: z.string().nullable(),
          lifePhilosophy: z.string().nullable(),
          datingStyle: z.string().nullable(),
          contactStyle: z.string().nullable(),
          marriagePlan: z.string().nullable(),
          isSmoker: z.string(),
          religion: z.string(),
          selfIntroduction: z.string().nullable(),
          idealTypeDescription: z.string().nullable(),
        }),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, profile } }) => {
      return ctx.prisma.basicMemberProfileV2.create({
        data: {
          ...profile,
          member: {
            connect: {
              id: memberId,
            },
          },
        },
      });
    }),
  updateProfile: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
        profile: z.object({
          birthYear: z.number(),
          residence: z.string(),
          height: z.number(),
          education: z.string(),
          job: z.string(),
          annualIncome: z.string().nullable(),
          assetsValue: z.string().nullable(),
          mbti: z.string().nullable(),
          hobby: z.string().nullable(),
          characteristic: z.string().nullable(),
          lifePhilosophy: z.string().nullable(),
          datingStyle: z.string().nullable(),
          contactStyle: z.string().nullable(),
          marriagePlan: z.string().nullable(),
          isSmoker: z.string(),
          religion: z.string(),
          selfIntroduction: z.string().nullable(),
          idealTypeDescription: z.string().nullable(),
        }),
      }),
    )
    .mutation(({ ctx, input: { memberId, profile } }) => {
      return ctx.prisma.basicMemberProfileV2.update({
        where: {
          memberId,
        },
        data: profile,
      });
    }),
  getProfileByMemberId: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(({ ctx, input: { memberId } }) => {
      return ctx.prisma.basicMemberProfileV2.findUniqueOrThrow({
        where: {
          memberId,
        },
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
      });
    }),
  getAllNeverMatchedByGender: protectedAdminProcedure
    .input(z.nativeEnum(Gender))
    .query(async ({ ctx, input: gender }) => {
      const members = await ctx.prisma.basicMemberV2.findMany({
        where: {
          status: MemberStatus.ACTIVE,
          gender,
        },
        include: {
          idealType: true,
          pendingMatches: true,
          rejectedMatches: true,
          acceptedMatches: true,
        },
      });

      return members.filter((member) => {
        const hasBeenMatched =
          member.pendingMatches.length > 0 ||
          member.rejectedMatches.length > 0 ||
          member.acceptedMatches.length > 0;

        return !hasBeenMatched;
      });
    }),
});
