import { MemberStatus } from "@ieum/prisma";
import { sendSlackMessage, SLACK_USER_ID_MENTION } from "@ieum/slack";
import {
  assert,
  formatUniqueMemberName,
  isKrPhoneNumberWithoutHyphens,
} from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const basicMemberRouter = createTRPCRouter({
  findByPhoneNumber: protectedProcedure
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
  getReferralCode: protectedProcedure
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
  getDiscountCouponCount: protectedProcedure
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
  getBlacklist: protectedProcedure
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
  addToBlacklist: protectedProcedure
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
  removeFromBlacklist: protectedProcedure
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
  getStatus: protectedProcedure
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
  requestActivation: protectedProcedure
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
        )} - 휴면 해제 요청 ${SLACK_USER_ID_MENTION}`,
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
  isMegaphoneUser: protectedProcedure
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
  updateIsMegaphoneUser: protectedProcedure
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
});
