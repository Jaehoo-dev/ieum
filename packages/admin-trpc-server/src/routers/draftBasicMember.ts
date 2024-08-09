import { DraftStatus, MemberStatus } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { calculateBmi, hash } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";
import { generateReferralCode } from "../utils/generateReferralCode";

export const draftBasicMemberRouter = createTRPCRouter({
  getAll: protectedAdminProcedure.query(({ ctx }) => {
    return ctx.prisma.draftBasicMember.findMany({
      where: {
        status: DraftStatus.PENDING,
      },
      select: {
        id: true,
        createdAt: true,
        name: true,
        phoneNumber: true,
        gender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
  findOne: protectedAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.draftBasicMember.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          images: true,
        },
      });
    }),
  checkPhoneNumber: protectedAdminProcedure
    .input(z.object({ phoneNumber: z.string() }))
    .mutation(async ({ ctx, input: { phoneNumber } }) => {
      const hashedPhoneNumber = hash(
        phoneNumber,
        process.env.SOFT_DELETE_SECRET_KEY!,
      );

      const member = await ctx.prisma.basicMemberV2.findUnique({
        where: {
          phoneNumber: hashedPhoneNumber,
        },
        select: {
          name: true,
        },
      });

      if (member != null) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Archived member exists. Name: ${member.name}`,
        });
      }

      return true;
    }),
  createBasicMemberFromDraft: protectedAdminProcedure
    .input(z.object({ draftMemberId: z.string() }))
    .mutation(async ({ ctx, input: { draftMemberId } }) => {
      const draftMember = await ctx.prisma.draftBasicMember.findUniqueOrThrow({
        where: {
          id: draftMemberId,
        },
        include: {
          images: true,
        },
      });

      const hashedPhoneNumber = hash(
        draftMember.phoneNumber,
        process.env.SOFT_DELETE_SECRET_KEY!,
      );

      const member = await ctx.prisma.basicMemberV2.findUnique({
        where: {
          phoneNumber: hashedPhoneNumber,
        },
      });

      if (member != null) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Archived member exists",
        });
      }

      const {
        id,
        marriageStatus,
        images,
        idealMinAgeBirthYear,
        idealMaxAgeBirthYear,
        idealRegions,
        idealMinHeight,
        idealMaxHeight,
        idealBodyShapes,
        idealFacialBodyPart,
        idealEducationLevel,
        idealSchoolLevel,
        idealNonPreferredWorkplace,
        idealNonPreferredJob,
        idealMinAnnualIncome,
        idealPreferredMbtis,
        idealNonPreferredMbtis,
        idealCharacteristics,
        idealIsSmokerOk,
        idealPreferredReligions,
        idealNonPreferredReligions,
        idealIsTattooOk,
        idealTypeDescription,
        dealBreakers,
        highPriorities,
        mediumPriorities,
        lowPriorities,
        ...self
      } = draftMember;

      const bucketPaths = await Promise.all(
        images.map(async ({ bucketPath }) => {
          const { data, error } = await supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
            )
            .copy(bucketPath, nanoid());

          if (error != null) {
            throw error;
          }

          return data.path.replace(
            `${process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME}/`,
            "",
          );
        }),
      );

      console.log(bucketPaths);

      const [newMember] = await ctx.prisma.$transaction([
        ctx.prisma.basicMemberV2.create({
          data: {
            ...self,
            bmi: calculateBmi(draftMember.height, draftMember.weight),
            status: MemberStatus.PENDING,
            referralCode: generateReferralCode(),
            images: {
              createMany: {
                data: bucketPaths.map((bucketPath, index) => {
                  return {
                    bucketPath,
                    index,
                  };
                }),
              },
            },
            idealType: {
              create: {
                minAgeBirthYear: idealMinAgeBirthYear,
                maxAgeBirthYear: idealMaxAgeBirthYear,
                regions: idealRegions,
                minHeight: idealMinHeight,
                maxHeight: idealMaxHeight,
                bodyShapes: idealBodyShapes,
                facialBodyPart: idealFacialBodyPart,
                educationLevel: idealEducationLevel,
                schoolLevel: idealSchoolLevel,
                nonPreferredWorkplace: idealNonPreferredWorkplace,
                nonPreferredJob: idealNonPreferredJob,
                preferredMbtis: idealPreferredMbtis,
                nonPreferredMbtis: idealNonPreferredMbtis,
                isSmokerOk: idealIsSmokerOk,
                preferredReligions: idealPreferredReligions,
                nonPreferredReligions: idealNonPreferredReligions,
                minAnnualIncome: idealMinAnnualIncome,
                characteristics: idealCharacteristics,
                isTattooOk: idealIsTattooOk,
                idealTypeDescription,
                dealBreakers,
                highPriorities,
                mediumPriorities,
                lowPriorities,
              },
            },
          },
        }),
        ctx.prisma.draftBasicMember.update({
          where: {
            id: draftMemberId,
          },
          data: {
            status: DraftStatus.APPROVED,
          },
        }),
      ]);

      return newMember;
    }),
  reject: protectedAdminProcedure
    .input(z.object({ draftMemberId: z.string() }))
    .mutation(async ({ ctx, input: { draftMemberId } }) => {
      return ctx.prisma.draftBasicMember.update({
        where: {
          id: draftMemberId,
        },
        data: {
          status: DraftStatus.REJECTED,
        },
      });
    }),
});
