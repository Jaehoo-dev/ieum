import { DraftStatus, MemberStatus, PrismaPromise, Region } from "@ieum/prisma";
import { sendSlackMessage, SLACK_USER_ID_MENTION } from "@ieum/slack";
import { supabase } from "@ieum/supabase";
import { calculateBmi, formatUniqueMemberName, hash } from "@ieum/utils";
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
        residence: true,
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
          videos: true,
          audios: true,
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

      const member = await ctx.prisma.basicMemberV2.findFirst({
        where: {
          OR: [
            { phoneNumber: hashedPhoneNumber },
            { phoneNumber: phoneNumber },
          ],
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      });

      if (member != null) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${
            member.phoneNumber === hashedPhoneNumber ? "Archived" : "Active"
          } member exists. Name: ${member.name}`,
        });
      }

      return true;
    }),
  createBasicMemberFromDraft: protectedAdminProcedure
    .input(
      z.object({ draftMemberId: z.string(), region: z.nativeEnum(Region) }),
    )
    .mutation(async ({ ctx, input: { draftMemberId, region } }) => {
      const draftMember = await ctx.prisma.draftBasicMember.findUniqueOrThrow({
        where: {
          id: draftMemberId,
        },
        include: {
          images: true,
          videos: true,
          audios: true,
        },
      });

      const hashedPhoneNumber = hash(
        draftMember.phoneNumber,
        process.env.SOFT_DELETE_SECRET_KEY!,
      );

      const member = await ctx.prisma.basicMemberV2.findFirst({
        where: {
          OR: [
            { phoneNumber: hashedPhoneNumber },
            { phoneNumber: draftMember.phoneNumber },
          ],
        },
        select: {
          phoneNumber: true,
        },
      });

      if (member != null) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${
            member.phoneNumber === hashedPhoneNumber ? "Archived" : "Active"
          } member exists`,
        });
      }

      const {
        id,
        marriageStatus,
        images,
        videos,
        audios,
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

      const imageBucketPaths = await Promise.all(
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

      const videoBucketPaths = await Promise.all(
        videos.map(async ({ bucketPath }) => {
          const { data, error } = await supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!,
            )
            .copy(bucketPath, nanoid());

          if (error != null) {
            throw error;
          }

          return data.path.replace(
            `${process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME}/`,
            "",
          );
        }),
      );

      const audiosBucketPaths = await Promise.all(
        audios.map(async ({ bucketPath }) => {
          const { data, error } = await supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!,
            )
            .copy(bucketPath, nanoid());

          if (error != null) {
            throw error;
          }

          return data.path.replace(
            `${process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME}/`,
            "",
          );
        }),
      );

      const referrer =
        draftMember.referrerCode == null
          ? null
          : await ctx.prisma.basicMemberV2.findUnique({
              where: {
                referralCode: draftMember.referrerCode,
              },
              select: {
                name: true,
                phoneNumber: true,
              },
            });

      const [newMember] = await ctx.prisma.$transaction([
        ctx.prisma.basicMemberV2.create({
          data: {
            ...self,
            region,
            bmi: calculateBmi(self.height, self.weight),
            status: MemberStatus.PENDING,
            referralCode: generateReferralCode(),
            isMegaphoneUser: false,
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
                data: audiosBucketPaths.map((bucketPath, index) => {
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

      if (referrer != null) {
        sendSlackMessage({
          channel: "폼_제출_알림",
          content: `${formatUniqueMemberName({
            name: referrer.name,
            phoneNumber: referrer.phoneNumber,
          })} 님의 추천으로 신규 회원 ${formatUniqueMemberName({
            name: newMember.name,
            phoneNumber: newMember.phoneNumber,
          })} 님 가입 ${SLACK_USER_ID_MENTION}`,
        });
      }

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
  delete: protectedAdminProcedure
    .input(z.object({ draftMemberId: z.string() }))
    .mutation(async ({ ctx, input: { draftMemberId } }) => {
      const draftMember = await ctx.prisma.draftBasicMember.findUniqueOrThrow({
        where: {
          id: draftMemberId,
        },
        select: {
          images: true,
          videos: true,
          audios: true,
          status: true,
        },
      });

      if (draftMember.status === DraftStatus.PENDING) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "status must not be PENDING",
        });
      }

      await Promise.all([
        supabase.storage
          .from(
            process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
          )
          .remove(draftMember.images.map((image) => image.bucketPath)),
        supabase.storage
          .from(
            process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!,
          )
          .remove(draftMember.videos.map((video) => video.bucketPath)),
        supabase.storage
          .from(
            process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!,
          )
          .remove(draftMember.videos.map((audio) => audio.bucketPath)),
      ]);

      return ctx.prisma.draftBasicMember.delete({
        where: {
          id: draftMemberId,
        },
      });
    }),
});
