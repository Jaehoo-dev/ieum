import { MemberStatus } from "@ieum/prisma";
import { assert, isKrPhoneNumberWithoutHyphens } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const basicMemberRouter = createTRPCRouter({
  findByPhoneNumber: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      }),
    )
    .query(({ ctx, input: { phoneNumber } }) => {
      return ctx.prisma.basicMember.findUnique({
        where: {
          phoneNumber,
          status: {
            in: [MemberStatus.ACTIVE, MemberStatus.INACTIVE],
          },
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      });
    }),
  getReferralCode: publicProcedure
    .input(z.object({ memberId: z.number() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          referralCode: true,
        },
      });

      return member.referralCode;
    }),
  getDiscountCouponCount: publicProcedure
    .input(z.object({ memberId: z.number() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          discountCouponCount: true,
        },
      });

      return member.discountCouponCount;
    }),
  getBlacklist: publicProcedure
    .input(z.object({ memberId: z.number() }))
    .query(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          blacklistedPhoneNumbers: true,
        },
      });

      return member.blacklistedPhoneNumbers;
    }),
  addToBlacklist: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, phoneNumber } }) => {
      assert(
        isKrPhoneNumberWithoutHyphens(phoneNumber),
        "Invalid phone number",
      );

      await ctx.prisma.basicMember.update({
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
  removeFromBlacklist: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId, phoneNumber } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
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

      await ctx.prisma.basicMember.update({
        where: {
          id: memberId,
        },
        data: {
          blacklistedPhoneNumbers: updatedBlacklistedPhoneNumbers,
        },
      });

      return true;
    }),
});
