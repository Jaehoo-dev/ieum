import { DEFAULT_HEART_COUNT } from "@ieum/constants";
import { MemberStatus } from "@ieum/prisma";
import {
  sendSlackMessage,
  SLACK_MANAGER1_ID_MENTION,
  SLACK_MANAGER2_ID_MENTION,
} from "@ieum/slack";
import { assert, formatUniqueMemberName } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedMatchmakerProcedure } from "../trpc";

export const blindRouter = createTRPCRouter({
  isBlindMember: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx: { prisma }, input: { memberId } }) => {
      const member = await prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          phoneNumber: true,
        },
      });

      const blindMember = await prisma.blindMember.findUnique({
        where: {
          phoneNumber: member.phoneNumber,
        },
      });

      return blindMember != null;
    }),
  create: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
        nickname: z.string(),
        bodyShape: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input }) => {
      const existingMember = await prisma.blindMember.findFirst({
        where: {
          nickname: input.nickname,
        },
      });

      if (existingMember != null) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nickname already exists",
        });
      }

      const member = await prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: input.memberId,
        },
        select: {
          name: true,
          phoneNumber: true,
          gender: true,
          birthYear: true,
          regionV2: true,
          profile: true,
        },
      });

      assert(member.regionV2 != null, "regionV2 should be defined");
      assert(member.profile != null, "profile should be defined");

      const blindMember = await prisma.blindMember.create({
        data: {
          phoneNumber: member.phoneNumber,
          status: MemberStatus.ACTIVE,
          nickname: input.nickname,
          gender: member.gender,
          birthYear: member.birthYear,
          region: member.regionV2,
          height: member.profile.height,
          bodyShape: input.bodyShape,
          job: member.profile.job,
          selfIntroduction: member.profile.selfIntroduction ?? "-",
          nameVerified: false,
          ageVerified: false,
          genderVerified: false,
          jobVerified: false,
          heartsLeft: DEFAULT_HEART_COUNT,
        },
      });

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `*이음:purple_heart:블라인드* 회원 생성\n${formatUniqueMemberName({
          name: member.name,
          phoneNumber: member.phoneNumber,
        })} 블라인드 가입 (${
          blindMember.nickname
        }) ${SLACK_MANAGER1_ID_MENTION} ${SLACK_MANAGER2_ID_MENTION}`,
      });

      return true;
    }),
  isNicknameAvailable: protectedMatchmakerProcedure
    .input(
      z.object({
        nickname: z.string(),
      }),
    )
    .query(async ({ ctx: { prisma }, input }) => {
      const count = await prisma.blindMember.count({
        where: {
          nickname: input.nickname,
        },
      });

      return count === 0;
    }),
});
