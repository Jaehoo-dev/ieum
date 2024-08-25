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
        memberId: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMemberProfileV2.findUnique({
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
              videos: {
                orderBy: {
                  index: "asc",
                },
              },
              audios: {
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

      return ctx.prisma.basicMemberProfileV2.findUniqueOrThrow({
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
              videos: {
                orderBy: {
                  index: "asc",
                },
              },
              audios: {
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
        memberId: z.string(),
        data: z.object({
          selfIntroduction: z.string().nullish(),
          idealTypeDescription: z.string().nullish(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.basicMemberProfileV2.update({
        where: {
          memberId: input.memberId,
        },
        data: input.data,
      });
    }),
});
