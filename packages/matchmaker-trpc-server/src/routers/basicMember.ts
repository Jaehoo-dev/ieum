import { MemberStatus } from "@ieum/prisma";
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
});
