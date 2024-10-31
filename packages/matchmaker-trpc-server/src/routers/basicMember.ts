import { MemberStatus, UserType } from "@ieum/prisma";
import { sendSlackMessage, SLACK_MANAGER1_ID_MENTION } from "@ieum/slack";
import { supabase } from "@ieum/supabase";
import {
  assert,
  formatUniqueMemberName,
  hash,
  isKrPhoneNumberWithoutHyphens,
} from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, protectedMatchmakerProcedure } from "../trpc";

export const basicMemberRouter = createTRPCRouter({
  findByPhoneNumber: protectedMatchmakerProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      }),
    )
    .query(({ ctx, input: { phoneNumber } }) => {
      return ctx.prisma.basicMemberV2.findUnique({
        where: {
          phoneNumber,
          status: {
            in: [
              MemberStatus.PENDING,
              MemberStatus.ACTIVE,
              MemberStatus.INACTIVE,
            ],
          },
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          gender: true,
        },
      });
    }),
  getReferralCode: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          referralCode: true,
        },
      });

      return member.referralCode;
    }),
  getDiscountCouponCount: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          discountCouponCount: true,
        },
      });

      return member.discountCouponCount;
    }),
  getBlacklist: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          blacklistedPhoneNumbers: true,
        },
      });

      return member.blacklistedPhoneNumbers;
    }),
  addToBlacklist: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, phoneNumber } }) => {
      assert(
        isKrPhoneNumberWithoutHyphens(phoneNumber),
        "Invalid phone number",
      );

      await ctx.prisma.basicMemberV2.update({
        where: {
          id: memberId,
        },
        data: {
          blacklistedPhoneNumbers: {
            push: phoneNumber,
          },
        },
      });

      return true;
    }),
  removeFromBlacklist: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, phoneNumber } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          blacklistedPhoneNumbers: true,
        },
      });

      const updatedBlacklistedPhoneNumbers =
        member.blacklistedPhoneNumbers.filter((_phoneNumber) => {
          return _phoneNumber !== phoneNumber;
        });

      await ctx.prisma.basicMemberV2.update({
        where: {
          id: memberId,
        },
        data: {
          blacklistedPhoneNumbers: updatedBlacklistedPhoneNumbers,
        },
      });

      return true;
    }),
  getStatus: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          status: true,
        },
      });

      assert(
        member.status === MemberStatus.PENDING ||
          member.status === MemberStatus.ACTIVE ||
          member.status === MemberStatus.INACTIVE,
        "Invalid member status",
      );

      return member.status;
    }),
  inactivate: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      });

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `${formatUniqueMemberName(
          member,
        )} - 휴면 신청 ${SLACK_MANAGER1_ID_MENTION}`,
      });

      await ctx.prisma.basicMemberV2.update({
        where: {
          id: memberId,
        },
        data: {
          status: MemberStatus.INACTIVE,
        },
      });

      return true;
    }),
  requestActivation: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      });

      await sendSlackMessage({
        channel: "폼_제출_알림",
        content: `${formatUniqueMemberName(
          member,
        )} - 활성화 요청 ${SLACK_MANAGER1_ID_MENTION}`,
        throwOnError: true,
      });

      await ctx.prisma.basicMemberV2.update({
        where: {
          id: memberId,
        },
        data: {
          status: MemberStatus.PENDING,
        },
      });

      return true;
    }),
  isMegaphoneUser: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          isMegaphoneUser: true,
        },
      });

      return member.isMegaphoneUser;
    }),
  updateIsMegaphoneUser: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
        isMegaphoneUser: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, isMegaphoneUser } }) => {
      await ctx.prisma.basicMemberV2.update({
        where: {
          id: memberId,
        },
        data: {
          isMegaphoneUser,
        },
      });

      return true;
    }),
  deleteAccount: protectedMatchmakerProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx: { prisma }, input: { memberId } }) => {
      await prisma.$transaction(async (tx) => {
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

        const user = await tx.user.findUnique({
          where: {
            phoneNumber_type: {
              phoneNumber: member.phoneNumber,
              type: UserType.BASIC_MEMBER,
            },
          },
          select: {
            id: true,
          },
        });

        if (user != null) {
          await tx.user.delete({
            where: {
              id: user.id,
            },
          });
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

      return true;
    }),
});
