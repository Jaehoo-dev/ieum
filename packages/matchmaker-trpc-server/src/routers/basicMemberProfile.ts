import { MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { 테스트남성_아이디, 테스트여성_아이디 } from "../constants";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const basicMemberProfileRouter = createTRPCRouter({
  getProfileByMemberId: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMemberProfile.findUnique({
        where: {
          memberId: input.memberId,
          member: {
            status: {
              in: [
                MemberStatus.PENDING,
                MemberStatus.ACTIVE,
                MemberStatus.INACTIVE,
              ],
            },
          },
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
            selfGender === "male" ? 테스트여성_아이디 : 테스트남성_아이디,
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
  updateProfile: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        data: z.object({
          selfIntroduction: z.string().nullish(),
          idealTypeDescription: z.string().nullish(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.basicMemberProfile.update({
        where: {
          memberId: input.memberId,
        },
        data: input.data,
      });
    }),
});
