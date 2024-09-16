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
import { krToKrHyphen } from "@ieum/utils";
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
        contactStyle: z.string(),
        marriagePlan: z.string().nullable(),
        selfIntroduction: z.string(),
        imageBucketPaths: z.string().array(),
        videoBucketPaths: z.string().array(),
        audioBucketPaths: z.string().array(),
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
        referrerCode: z.string().nullable(),
        memo: z.string().nullable(),
        personalInfoConsent: z.boolean(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          imageBucketPaths,
          videoBucketPaths,
          audioBucketPaths,
          ...data
        },
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
            audios: {
              createMany: {
                data: audioBucketPaths.map((bucketPath) => {
                  return {
                    bucketPath,
                  };
                }),
              },
            },
          },
        });

        await Promise.all([
          sendSlackMessage({
            channel: "폼_제출_알림",
            content: `*이음:cupid:베이직* 설문 제출\n${
              data.name
            } / ${krToKrHyphen(data.phoneNumber)} / ${성별_라벨[data.gender]}`,
            throwOnError: false,
          }),
          sendSlackMessage({
            channel: "폼_백업",
            content: JSON.stringify(data),
            throwOnError: false,
          }),
        ]);

        return true;
      },
    ),
});
