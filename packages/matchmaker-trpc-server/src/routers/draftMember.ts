import { 성별_라벨 } from "@ieum/constants";
import {
  AnnualIncome,
  AssetsValue,
  BodyShape,
  EducationLevel,
  ExercisePerWeek,
  Gender,
  MarriageStatus,
  MBTI,
  Region,
  Religion,
} from "@ieum/prisma";
import { sendSlackMessage } from "@ieum/slack";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const draftMemberRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        phoneNumber: z.string(),
        gender: z.nativeEnum(Gender),
        marriageStatus: z.nativeEnum(MarriageStatus),
        birthYear: z.number(),
        residence: z.string(),
        height: z.number(),
        weight: z.number(),
        confidentFacialBodyPart: z.string().nullable(),
        educationLevel: z.nativeEnum(EducationLevel),
        graduatedUniversity: z.string().nullable(),
        workplace: z.string(),
        job: z.string().nullable(),
        annualIncome: z.nativeEnum(AnnualIncome).nullable(),
        assetsValue: z.nativeEnum(AssetsValue).nullable(),
        mbti: z.nativeEnum(MBTI).nullable(),
        characteristics: z.string().nullable(),
        hobby: z.string(),
        exercisePerWeek: z.nativeEnum(ExercisePerWeek),
        exerciseType: z.string().nullable(),
        isSmoker: z.boolean(),
        isDrinker: z.boolean(),
        alcoholConsumption: z.string().nullable(),
        alcoholTolerance: z.string().nullable(),
        religion: z.nativeEnum(Religion),
        hasCar: z.boolean(),
        hasTattoo: z.boolean(),
        hasPet: z.boolean(),
        datingStyle: z.string(),
        selfIntroduction: z.string(),
        imageBucketPaths: z.string().array(),
        videoBucketPaths: z.string().array(),
        idealMinAgeBirthYear: z.number().nullable(),
        idealMaxAgeBirthYear: z.number().nullable(),
        idealRegions: z.nativeEnum(Region).array(),
        idealMinHeight: z.number().nullable(),
        idealMaxHeight: z.number().nullable(),
        idealBodyShapes: z.nativeEnum(BodyShape).array(),
        idealFacialBodyPart: z.string().nullable(),
        idealEducationLevel: z.nativeEnum(EducationLevel).nullable(),
        idealSchoolLevel: z.string().nullable(),
        idealNonPreferredWorkplace: z.string().nullable(),
        idealNonPreferredJob: z.string().nullable(),
        idealMinAnnualIncome: z.nativeEnum(AnnualIncome).nullable(),
        idealPreferredMbtis: z.nativeEnum(MBTI).array(),
        idealNonPreferredMbtis: z.nativeEnum(MBTI).array(),
        idealCharacteristics: z.string().nullable(),
        idealIsSmokerOk: z.boolean(),
        idealPreferredReligions: z.nativeEnum(Religion).array(),
        idealNonPreferredReligions: z.nativeEnum(Religion).array(),
        idealIsTattooOk: z.boolean(),
        idealTypeDescription: z.string(),
        referralCode: z.string().nullable(),
        memo: z.string().nullable(),
        personalInfoConsent: z.boolean(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { imageBucketPaths, videoBucketPaths, ...data },
      }) => {
        await ctx.prisma.draftBasicMember.create({
          data: {
            ...data,
            images: {
              createMany: {
                data: imageBucketPaths.map((bucketPath) => {
                  return {
                    bucketPath,
                  };
                }),
              },
            },
            videos: {
              createMany: {
                data: videoBucketPaths.map((bucketPath) => {
                  return {
                    bucketPath,
                  };
                }),
              },
            },
          },
        });

        await sendSlackMessage({
          channel: "폼_제출_알림",
          content: `*이음:cupid:베이직* 설문 제출\n*이름*: ${
            data.name
          }\n*전화번호*: ${data.phoneNumber}\n*성별*: ${
            성별_라벨[data.gender]
          }\n${JSON.stringify(data)}`,
        });

        return true;
      },
    ),
});
