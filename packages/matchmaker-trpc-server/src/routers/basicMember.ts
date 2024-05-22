import { MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { 테스트남성_아이디, 테스트여성_아이디 } from "../constants";
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
          status: MemberStatus.ACTIVE,
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
        },
      });
    }),
  getProfileById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMemberProfile.findUnique({
        where: {
          memberId: input.id,
          member: {
            status: MemberStatus.ACTIVE,
          },
        },
      });
    }),
  getDemoProfile: publicProcedure
    .input(
      z.object({
        selfGender: z.string(),
      }),
    )
    .query(({ ctx, input: { selfGender } }) => {
      assert(
        selfGender === "male" || selfGender === "female",
        new TRPCError({
          code: "BAD_REQUEST",
          message: "gender should be male or female",
        }),
      );

      return ctx.prisma.basicMemberProfile.findUniqueOrThrow({
        where: {
          memberId:
            selfGender === "male" ? 테스트남성_아이디 : 테스트여성_아이디,
        },
      });
    }),
});
