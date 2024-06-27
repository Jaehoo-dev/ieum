import { auth, FirebaseAuthError } from "@ieum/firebase-admin";
import type { BasicMember } from "@ieum/prisma";
import {
  AnnualIncome,
  AssetsValue,
  BasicCondition,
  BodyShape,
  BooksReadPerYear,
  ContactFrequency,
  ContactMethod,
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
import { krToGlobal } from "@ieum/utils";
import { match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

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
        idealMinAgeBirthYear: z.number().nullable(),
        idealMaxAgeBirthYear: z.number().nullable(),
        idealRegions: z.array(z.nativeEnum(Region)),
        idealCustomRegion: z.string().nullable(),
        idealMinHeight: z.number().nullable(),
        idealMaxHeight: z.number().nullable(),
        idealBodyShapes: z.array(z.nativeEnum(BodyShape)),
        idealFashionStyles: z.array(z.nativeEnum(FashionStyle)),
        idealEyelids: z.array(z.nativeEnum(Eyelid)),
        idealFacialBodyPart: z.string().nullable(),
        idealEducationLevel: z.nativeEnum(EducationLevel).nullable(),
        idealSchoolLevel: z.string().nullable(),
        idealOccupationStatuses: z.array(z.nativeEnum(OccupationStatus)),
        idealNonPreferredWorkplace: z.string().nullable(),
        idealNonPreferredJob: z.string().nullable(),
        idealPreferredMbtis: z.array(z.nativeEnum(MBTI)),
        idealNonPreferredMbtis: z.array(z.nativeEnum(MBTI)),
        idealIsSmokerOk: z.boolean(),
        idealDrinkingFrequency: z.nativeEnum(DrinkingFrequency).nullable(),
        idealCustomDrinkingFrequency: z.string().nullable(),
        idealPreferredReligions: z.array(z.nativeEnum(Religion)),
        idealNonPreferredReligions: z.array(z.nativeEnum(Religion)),
        idealMinAnnualIncome: z.nativeEnum(AnnualIncome).nullable(),
        idealMinAssetsValue: z.nativeEnum(AssetsValue).nullable(),
        idealHobby: z.string().nullable(),
        idealBooksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
        idealCharacteristics: z.string().nullable(),
        idealLifePhilosophy: z.string().nullable(),
        idealIsTattooOk: z.boolean(),
        idealExercisePerWeek: z.nativeEnum(ExercisePerWeek).nullable(),
        idealShouldHaveCar: z.boolean(),
        idealIsGamingOk: z.boolean(),
        idealIsPetOk: z.boolean(),
        idealTypeDescription: z.string().nullable(),
        nonNegotiableConditions: z.array(z.nativeEnum(BasicCondition)),
        memo: z.string().nullable(),
        imageBucketPaths: z.array(z.string()),
      }),
    )
    .mutation(({ ctx, input: { imageBucketPaths, ...rest } }) => {
      return ctx.prisma.basicMember.create({
        data: {
          ...rest,
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
        },
      });
    }),
  update: protectedAdminProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
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
          idealMinAgeBirthYear: z.number().nullable(),
          idealMaxAgeBirthYear: z.number().nullable(),
          idealRegions: z.array(z.nativeEnum(Region)),
          idealCustomRegion: z.string().nullable(),
          idealMinHeight: z.number().nullable(),
          idealMaxHeight: z.number().nullable(),
          idealBodyShapes: z.array(z.nativeEnum(BodyShape)),
          idealFashionStyles: z.array(z.nativeEnum(FashionStyle)),
          idealEyelids: z.array(z.nativeEnum(Eyelid)),
          idealFacialBodyPart: z.string().nullable(),
          idealEducationLevel: z.nativeEnum(EducationLevel).nullable(),
          idealSchoolLevel: z.string().nullable(),
          idealOccupationStatuses: z.array(z.nativeEnum(OccupationStatus)),
          idealNonPreferredWorkplace: z.string().nullable(),
          idealNonPreferredJob: z.string().nullable(),
          idealPreferredMbtis: z.array(z.nativeEnum(MBTI)),
          idealNonPreferredMbtis: z.array(z.nativeEnum(MBTI)),
          idealIsSmokerOk: z.boolean(),
          idealDrinkingFrequency: z.nativeEnum(DrinkingFrequency).nullable(),
          idealCustomDrinkingFrequency: z.string().nullable(),
          idealPreferredReligions: z.array(z.nativeEnum(Religion)),
          idealNonPreferredReligions: z.array(z.nativeEnum(Religion)),
          idealMinAnnualIncome: z.nativeEnum(AnnualIncome).nullable(),
          idealMinAssetsValue: z.nativeEnum(AssetsValue).nullable(),
          idealHobby: z.string().nullable(),
          idealBooksReadPerYear: z.nativeEnum(BooksReadPerYear).nullable(),
          idealCharacteristics: z.string().nullable(),
          idealLifePhilosophy: z.string().nullable(),
          idealIsTattooOk: z.boolean(),
          idealExercisePerWeek: z.nativeEnum(ExercisePerWeek).nullable(),
          idealShouldHaveCar: z.boolean(),
          idealIsGamingOk: z.boolean(),
          idealIsPetOk: z.boolean(),
          idealTypeDescription: z.string().nullable(),
          nonNegotiableConditions: z.array(z.nativeEnum(BasicCondition)),
          memo: z.string().nullable(),
        }),
      }),
    )
    .mutation(({ ctx, input: { id, data } }) => {
      return ctx.prisma.basicMember.update({
        where: {
          id,
        },
        data,
      });
    }),
  infiniteFindByGender: protectedAdminProcedure
    .input(
      z.object({
        gender: z.nativeEnum(Gender),
        limit: z.number().min(1).max(100).default(3),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input: { gender, limit, cursor } }) => {
      const members = await ctx.prisma.basicMember.findMany({
        take: limit + 1,
        where: {
          gender,
          status: MemberStatus.ACTIVE,
        },
        include: {
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
        orderBy: {
          createdAt: "desc",
        },
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
          images: {
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
          status: MemberStatus.ACTIVE,
        },
        include: {
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

      return ctx.prisma.basicMember.findMany({
        where: {
          status: MemberStatus.ACTIVE,
          gender: self.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
          id: {
            notIn: blacklist,
          },
          AND: createConditionANDClause(self),
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
  findCustomMatchCandidates: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
        conditions: z.object({
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
          shouldHaveCar: z.boolean(),
          isGamingOk: z.boolean(),
          isPetOk: z.boolean(),
        }),
        nonNegotiableConditions: z.array(z.nativeEnum(BasicCondition)),
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          memberId,
          conditions: {
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
          },
          nonNegotiableConditions,
        },
      }) => {
        const self = await ctx.prisma.basicMember.findUniqueOrThrow({
          where: {
            id: memberId,
            status: MemberStatus.ACTIVE,
          },
          include: {
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
        const nonNegotiableConditionsSet = new Set(nonNegotiableConditions);

        return ctx.prisma.basicMember.findMany({
          where: {
            status: MemberStatus.ACTIVE,
            gender: self.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
            id: {
              notIn: blacklist,
            },
            AND: [
              {
                birthYear: nonNegotiableConditionsSet.has(BasicCondition.AGE)
                  ? {
                      lte: minAgeBirthYear ?? undefined,
                      gte: maxAgeBirthYear ?? undefined,
                    }
                  : undefined,
                height: nonNegotiableConditionsSet.has(BasicCondition.HEIGHT)
                  ? {
                      gte: minHeight ?? undefined,
                      lte: maxHeight ?? undefined,
                    }
                  : undefined,
                educationLevel:
                  minEducationLevel != null &&
                  nonNegotiableConditionsSet.has(BasicCondition.EDUCATION_LEVEL)
                    ? {
                        in: orderedEducationLevels.slice(
                          orderedEducationLevels.indexOf(minEducationLevel),
                        ),
                      }
                    : undefined,
                occupationStatus:
                  nonNegotiableConditionsSet.has(
                    BasicCondition.OCCUPATION_STATUS,
                  ) && occupationStatuses.length > 0
                    ? {
                        in: occupationStatuses,
                      }
                    : undefined,
              },
              {
                mbti:
                  nonNegotiableConditionsSet.has(
                    BasicCondition.PREFERRED_MBTIS,
                  ) && preferredMbtis.length > 0
                    ? { in: preferredMbtis }
                    : undefined,
              },
              {
                mbti:
                  nonNegotiableConditionsSet.has(
                    BasicCondition.NON_PREFERRED_MBTIS,
                  ) && nonPreferredMbtis.length > 0
                    ? { notIn: nonPreferredMbtis }
                    : undefined,
              },
              {
                isSmoker:
                  nonNegotiableConditionsSet.has(BasicCondition.IS_SMOKER_OK) &&
                  !isSmokerOk
                    ? false
                    : undefined,
              },
              {
                religion:
                  nonNegotiableConditionsSet.has(
                    BasicCondition.PREFERRED_RELIGIONS,
                  ) && preferredReligions.length > 0
                    ? { in: preferredReligions }
                    : undefined,
              },
              {
                religion:
                  nonNegotiableConditionsSet.has(
                    BasicCondition.NON_PREFERRED_RELIGIONS,
                  ) && nonPreferredReligions.length > 0
                    ? { notIn: nonPreferredReligions }
                    : undefined,
              },
              {
                annualIncome:
                  minAnnualIncome != null &&
                  nonNegotiableConditionsSet.has(
                    BasicCondition.MIN_ANNUAL_INCOME,
                  )
                    ? {
                        in: orderedAnnualIncomes.slice(
                          orderedAnnualIncomes.indexOf(minAnnualIncome),
                        ),
                      }
                    : undefined,
                assetsValue:
                  minAssetsValue != null &&
                  nonNegotiableConditionsSet.has(
                    BasicCondition.MIN_ASSETS_VALUE,
                  )
                    ? {
                        in: orderedAssetsValues.slice(
                          orderedAssetsValues.indexOf(minAssetsValue),
                        ),
                      }
                    : undefined,
                booksReadPerYear:
                  minBooksReadPerYear != null &&
                  nonNegotiableConditionsSet.has(
                    BasicCondition.BOOKS_READ_PER_YEAR,
                  )
                    ? {
                        in: orderedBooksReadPerYears.slice(
                          orderedBooksReadPerYears.indexOf(minBooksReadPerYear),
                        ),
                      }
                    : undefined,
                hasTattoo:
                  nonNegotiableConditionsSet.has(BasicCondition.IS_TATTOO_OK) &&
                  !isTattooOk
                    ? false
                    : undefined,
                exercisePerWeek:
                  exercisePerWeek != null &&
                  nonNegotiableConditionsSet.has(
                    BasicCondition.EXERCISE_PER_WEEK,
                  )
                    ? { in: orderedExercisePerWeeks.slice(1) }
                    : undefined,
                hasCar: nonNegotiableConditionsSet.has(
                  BasicCondition.SHOULD_HAVE_CAR,
                )
                  ? shouldHaveCar ?? undefined
                  : undefined,
                doesGame: nonNegotiableConditionsSet.has(
                  BasicCondition.IS_GAMING_OK,
                )
                  ? isGamingOk ?? undefined
                  : undefined,
                hasPet: nonNegotiableConditionsSet.has(BasicCondition.IS_PET_OK)
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

function createConditionANDClause(member: BasicMember) {
  return member.nonNegotiableConditions.map((condition) => {
    return match(condition)
      .with("AGE", () => {
        return {
          birthYear: {
            gte: member.idealMaxAgeBirthYear ?? undefined,
            lte: member.idealMinAgeBirthYear ?? undefined,
          },
        };
      })
      .with("HEIGHT", () => {
        return {
          height: {
            gte: member.idealMinHeight ?? undefined,
            lte: member.idealMaxHeight ?? undefined,
          },
        };
      })
      .with("EDUCATION_LEVEL", () => {
        return {
          educationLevel:
            member.idealEducationLevel != null
              ? {
                  in: orderedEducationLevels.slice(
                    orderedEducationLevels.indexOf(member.idealEducationLevel),
                  ),
                }
              : undefined,
        };
      })
      .with("OCCUPATION_STATUS", () => {
        return {
          occupationStatus: {
            in: member.idealOccupationStatuses,
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
          isSmoker: !member.idealIsSmokerOk ? false : undefined,
        };
      })
      .with("PREFERRED_RELIGIONS", () => {
        return {
          religion: {
            in: member.idealPreferredReligions,
          },
        };
      })
      .with("NON_PREFERRED_RELIGIONS", () => {
        return {
          religion: {
            notIn: member.idealNonPreferredReligions,
          },
        };
      })
      .with("MIN_ANNUAL_INCOME", () => {
        return {
          annualIncome: {
            in:
              member.idealMinAnnualIncome != null
                ? orderedAnnualIncomes.slice(
                    orderedAnnualIncomes.indexOf(member.idealMinAnnualIncome),
                  )
                : undefined,
          },
        };
      })
      .with("MIN_ASSETS_VALUE", () => {
        return {
          assetsValue: {
            in:
              member.idealMinAssetsValue != null
                ? orderedAssetsValues.slice(
                    orderedAssetsValues.indexOf(member.idealMinAssetsValue),
                  )
                : undefined,
          },
        };
      })
      .with("BOOKS_READ_PER_YEAR", () => {
        return {
          booksReadPerYear:
            member.idealBooksReadPerYear != null
              ? {
                  in: orderedBooksReadPerYears.slice(
                    orderedBooksReadPerYears.indexOf(
                      member.idealBooksReadPerYear,
                    ),
                  ),
                }
              : undefined,
        };
      })
      .with("IS_TATTOO_OK", () => {
        return {
          hasTattoo: !member.idealIsTattooOk ? false : undefined,
        };
      })
      .with("EXERCISE_PER_WEEK", () => {
        return {
          exercisePerWeek:
            member.idealExercisePerWeek != null &&
            member.idealExercisePerWeek !== "NONE"
              ? { in: orderedExercisePerWeeks.slice(1) }
              : undefined,
        };
      })
      .with("SHOULD_HAVE_CAR", () => {
        return {
          hasCar: member.idealShouldHaveCar,
        };
      })
      .with("IS_GAMING_OK", () => {
        return {
          doesGame: member.idealIsGamingOk,
        };
      })
      .with("IS_PET_OK", () => {
        return {
          hasPet: member.idealIsPetOk,
        };
      })
      .otherwise(() => {
        return {};
      });
  });
}
