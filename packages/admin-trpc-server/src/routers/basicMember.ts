import { auth, FirebaseAuthError } from "@ieum/firebase-admin";
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
import { assert, krToGlobal } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";
import { generateReferralCode } from "../utils/generateReferralCode";
import { getSimilarityScore } from "../utils/getSimilarityScore";

export const basicMemberRouter = createTRPCRouter({
  getAllByGender: protectedAdminProcedure
    .input(z.nativeEnum(Gender))
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMember.findMany({
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
          bodyShape: z.nativeEnum(BodyShape),
          fashionStyles: z.array(z.nativeEnum(FashionStyle)),
          eyelid: z.nativeEnum(Eyelid),
          customEyelid: z.string().nullable(),
          confidentFacialBodyPart: z.string(),
          educationLevel: z.nativeEnum(EducationLevel),
          graduatedUniversity: z.string().nullable(),
          occupationStatus: z.nativeEnum(OccupationStatus),
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
          booksReadPerYear: z.nativeEnum(BooksReadPerYear),
          bookTaste: z.string().nullable(),
          leisureActivity: z.string().nullable(),
          siblings: z.string().nullable(),
          characteristics: z.string().nullable(),
          tenYearFuture: z.string().nullable(),
          plannedNumberOfChildren: z.nativeEnum(PlannedNumberOfChildren),
          lifePhilosophy: z.string().nullable(),
          workPhilosophy: z.string().nullable(),
          hasTattoo: z.boolean(),
          exercisePerWeek: z.nativeEnum(ExercisePerWeek),
          exerciseType: z.string().nullable(),
          hasCar: z.boolean(),
          doesGame: z.boolean(),
          gameType: z.string().nullable(),
          datingStyle: z.string().nullable(),
          contactFrequency: z.nativeEnum(ContactFrequency),
          customContactFrequency: z.string().nullable(),
          contactMethod: z.nativeEnum(ContactMethod),
          customContactMethod: z.string().nullable(),
          hasPet: z.boolean(),
          selfIntroduction: z.string().nullable(),
          memo: z.string().nullable(),
          imageBucketPaths: z.array(z.string()),
          videoBucketPaths: z.array(z.string()),
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
          isGamingOk: z.boolean(),
          isPetOk: z.boolean(),
          idealTypeDescription: z.string().nullable(),
        }),
      }),
    )
    .mutation(
      ({
        ctx,
        input: {
          self: { imageBucketPaths, videoBucketPaths, ...selfRest },
          idealType,
        },
      }) => {
        return ctx.prisma.basicMember.create({
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
        id: z.number(),
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
            bodyShape: z.nativeEnum(BodyShape),
            fashionStyles: z.array(z.nativeEnum(FashionStyle)),
            eyelid: z.nativeEnum(Eyelid),
            customEyelid: z.string().nullable(),
            confidentFacialBodyPart: z.string(),
            educationLevel: z.nativeEnum(EducationLevel),
            graduatedUniversity: z.string().nullable(),
            occupationStatus: z.nativeEnum(OccupationStatus),
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
            booksReadPerYear: z.nativeEnum(BooksReadPerYear),
            bookTaste: z.string().nullable(),
            leisureActivity: z.string().nullable(),
            siblings: z.string().nullable(),
            characteristics: z.string().nullable(),
            tenYearFuture: z.string().nullable(),
            plannedNumberOfChildren: z.nativeEnum(PlannedNumberOfChildren),
            lifePhilosophy: z.string().nullable(),
            workPhilosophy: z.string().nullable(),
            hasTattoo: z.boolean(),
            exercisePerWeek: z.nativeEnum(ExercisePerWeek),
            exerciseType: z.string().nullable(),
            hasCar: z.boolean(),
            doesGame: z.boolean(),
            gameType: z.string().nullable(),
            datingStyle: z.string().nullable(),
            contactFrequency: z.nativeEnum(ContactFrequency),
            customContactFrequency: z.string().nullable(),
            contactMethod: z.nativeEnum(ContactMethod),
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
            isGamingOk: z.boolean(),
            isPetOk: z.boolean(),
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
          ctx.prisma.basicMember.update({
            where: {
              id,
            },
            data: {
              ...self,
            },
          }),
          ctx.prisma.basicMemberIdealType.update({
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
        limit: z.number().min(1).max(100).default(3),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input: { gender, status, sort, limit, cursor } }) => {
      const members = await ctx.prisma.basicMember.findMany({
        take: limit + 1,
        where: {
          gender,
          status,
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

      const nextCursor = members.length > limit ? members.pop()!.id : undefined;

      return {
        members,
        nextCursor,
      };
    }),
  findById: protectedAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input: { id } }) => {
      return ctx.prisma.basicMember.findUniqueOrThrow({
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
      return ctx.prisma.basicMember.findMany({
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
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input: { id } }) => {
      const self = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: {
          id,
          status: {
            in: [MemberStatus.PENDING, MemberStatus.ACTIVE],
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

      const candidates = await ctx.prisma.basicMember.findMany({
        where: {
          status: MemberStatus.ACTIVE,
          gender: self.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
          id: {
            notIn: blacklist,
          },
          phoneNumber: {
            notIn: self.blacklistedPhoneNumbers,
          },
          AND: createDealBreakerAndClause(self.idealType),
          pendingMatches: {
            every: {
              pendingBy: { none: { id: self.id } },
              rejectedBy: { none: { id: self.id } },
              acceptedBy: { none: { id: self.id } },
            },
          },
          rejectedMatches: {
            every: {
              pendingBy: { none: { id: self.id } },
              rejectedBy: { none: { id: self.id } },
              acceptedBy: { none: { id: self.id } },
            },
          },
          acceptedMatches: {
            every: {
              pendingBy: { none: { id: self.id } },
              rejectedBy: { none: { id: self.id } },
              acceptedBy: { none: { id: self.id } },
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
        memberId: z.number(),
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
          isGamingOk: z.boolean(),
          isPetOk: z.boolean(),
          dealBreakers: z.array(z.nativeEnum(BasicCondition)),
          highPriorities: z.array(z.nativeEnum(BasicCondition)),
          mediumPriorities: z.array(z.nativeEnum(BasicCondition)),
          lowPriorities: z.array(z.nativeEnum(BasicCondition)),
        }),
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
        },
      }) => {
        const self = await ctx.prisma.basicMember.findUniqueOrThrow({
          where: {
            id: memberId,
            status: {
              in: [MemberStatus.PENDING, MemberStatus.ACTIVE],
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

        const candidates = await ctx.prisma.basicMember.findMany({
          where: {
            status: MemberStatus.ACTIVE,
            gender: self.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
            id: {
              notIn: blacklist,
            },
            phoneNumber: {
              notIn: self.blacklistedPhoneNumbers,
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
                occupationStatus:
                  dealBreakersSet.has(BasicCondition.OCCUPATION_STATUS) &&
                  occupationStatuses.length > 0
                    ? {
                        in: occupationStatuses,
                      }
                    : undefined,
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
                pendingBy: { none: { id: self.id } },
                rejectedBy: { none: { id: self.id } },
                acceptedBy: { none: { id: self.id } },
              },
            },
            rejectedMatches: {
              every: {
                pendingBy: { none: { id: self.id } },
                rejectedBy: { none: { id: self.id } },
                acceptedBy: { none: { id: self.id } },
              },
            },
            acceptedMatches: {
              every: {
                pendingBy: { none: { id: self.id } },
                rejectedBy: { none: { id: self.id } },
                acceptedBy: { none: { id: self.id } },
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
    .input(z.object({ actionMemberId: z.number(), targetMemberId: z.number() }))
    .mutation(async ({ ctx, input: { actionMemberId, targetMemberId } }) => {
      return ctx.prisma.basicBlacklistItem.create({
        data: {
          blacklisterId: actionMemberId,
          targetId: targetMemberId,
        },
      });
    }),
  softDelete: protectedAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const member = await tx.basicMember.findUniqueOrThrow({
          where: {
            id,
          },
          include: {
            pendingMatches: true,
            profile: true,
          },
        });

        await tx.basicMatch.deleteMany({
          where: {
            id: {
              in: member.pendingMatches.map((match) => {
                return match.id;
              }),
            },
          },
        });

        if (member.profile != null) {
          await tx.basicMemberProfile.delete({
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

        return tx.basicMember.update({
          where: {
            id,
          },
          data: {
            status: MemberStatus.DELETED,
          },
        });
      });
    }),
  hardDelete: protectedAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.prisma.$transaction(async (tx) => {
        const member = await tx.basicMember.findUniqueOrThrow({
          where: {
            id,
          },
          include: {
            pendingMatches: true,
            rejectedMatches: true,
            acceptedMatches: true,
            profile: true,
          },
        });

        const matches = [
          ...member.pendingMatches,
          ...member.rejectedMatches,
          ...member.acceptedMatches,
        ];

        await tx.basicMatch.deleteMany({
          where: {
            id: {
              in: matches.map((match) => {
                return match.id;
              }),
            },
          },
        });

        if (member.profile != null) {
          await tx.basicMemberProfile.delete({
            where: {
              memberId: member.id,
            },
          });
        }

        return tx.basicMember.delete({
          where: {
            id,
          },
        });
      });
    }),
  activate: protectedAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.prisma.basicMember.update({
        where: {
          id,
        },
        data: {
          status: MemberStatus.ACTIVE,
        },
      });
    }),
  inactivate: protectedAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input: { id } }) => {
      return ctx.prisma.basicMember.update({
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
        memberId: z.number(),
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
          isSmoker: z.string(),
          religion: z.string(),
          selfIntroduction: z.string().nullable(),
          idealTypeDescription: z.string().nullable(),
        }),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, profile } }) => {
      return ctx.prisma.basicMemberProfile.create({
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
        memberId: z.number(),
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
          isSmoker: z.string(),
          religion: z.string(),
          selfIntroduction: z.string().nullable(),
          idealTypeDescription: z.string().nullable(),
        }),
      }),
    )
    .mutation(({ ctx, input: { memberId, profile } }) => {
      return ctx.prisma.basicMemberProfile.update({
        where: {
          memberId,
        },
        data: profile,
      });
    }),
  getProfileByMemberId: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .query(({ ctx, input: { memberId } }) => {
      return ctx.prisma.basicMemberProfile.findUniqueOrThrow({
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
            },
          },
        },
      });
    }),
  getAllNeverMatchedByGender: protectedAdminProcedure
    .input(z.nativeEnum(Gender))
    .query(async ({ ctx, input: gender }) => {
      const members = await ctx.prisma.basicMember.findMany({
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
