import { 성별_라벨 } from "@ieum/constants";
import { Gender, MemberStatus, Region } from "@ieum/prisma";
import { sendSlackMessage } from "@ieum/slack";
import { assert, isKrPhoneNumberWithoutHyphens } from "@ieum/utils";
import { match } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, protectedBlindProcedure } from "../trpc";

export const blindMemberRouter = createTRPCRouter({
  create: protectedBlindProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        nickname: z.string(),
        gender: z.nativeEnum(Gender),
        birthYear: z.number(),
        region: z.nativeEnum(Region),
        height: z.number(),
        bodyShape: z.string(),
        job: z.string(),
        selfIntroduction: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input }) => {
      await prisma.blindMember.create({
        data: {
          ...input,
          status: MemberStatus.ACTIVE,
          idVerified: false,
          jobVerified: false,
        },
      });

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `*이음:cupid:블라인드* 설문 제출\n${input.nickname} / ${
          성별_라벨[input.gender]
        }`,
        throwOnError: false,
      });

      return true;
    }),
  findByPhoneNumber: protectedBlindProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      }),
    )
    .query(({ ctx: { prisma }, input: { phoneNumber } }) => {
      return prisma.blindMember.findUnique({
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
          phoneNumber: true,
          gender: true,
        },
      });
    }),
  getInfiniteCandidates: protectedBlindProcedure
    .input(
      z.object({
        selfMemberId: z.string(),
        take: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(
      async ({ ctx: { prisma }, input: { selfMemberId, take, cursor } }) => {
        const self = await prisma.blindMember.findUniqueOrThrow({
          where: {
            id: selfMemberId,
            status: {
              in: [
                MemberStatus.ACTIVE,
                MemberStatus.PENDING,
                MemberStatus.INACTIVE,
              ],
            },
          },
          select: {
            id: true,
            gender: true,
            phoneNumber: true,
            blacklistedPhoneNumbers: true,
          },
        });

        const members = await prisma.blindMember.findMany({
          where: {
            gender: match(self.gender)
              .with(Gender.MALE, () => Gender.FEMALE)
              .with(Gender.FEMALE, () => Gender.MALE)
              .exhaustive(),
            status: MemberStatus.ACTIVE,
            phoneNumber: {
              notIn: self.blacklistedPhoneNumbers,
            },
            NOT: {
              blacklistedPhoneNumbers: {
                has: self.phoneNumber,
              },
            },
            matchesAsProposer: {
              none: {
                respondentId: selfMemberId,
              },
            },
            matchesAsRespondent: {
              none: {
                proposerId: selfMemberId,
              },
            },
          },
          take: take + 1,
          cursor: cursor ? { id: cursor } : undefined,
          select: {
            id: true,
            nickname: true,
            birthYear: true,
            gender: true,
            height: true,
            bodyShape: true,
            job: true,
            region: true,
          },
          orderBy: {
            birthYear: "asc",
          },
        });

        const nextCursor =
          members.length > take ? members.pop()!.id : undefined;

        return {
          members,
          nextCursor,
        };
      },
    ),
  getProfile: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(({ ctx: { prisma }, input: { memberId } }) => {
      return prisma.blindMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          id: true,
          nickname: true,
          gender: true,
          birthYear: true,
          region: true,
          height: true,
          bodyShape: true,
          job: true,
          selfIntroduction: true,
          idVerified: true,
          jobVerified: true,
        },
      });
    }),
  getStatus: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx: { prisma }, input: { memberId } }) => {
      const member = await prisma.blindMember.findUniqueOrThrow({
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
  inactivate: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId } }) => {
      await prisma.blindMember.update({
        where: {
          id: memberId,
        },
        data: {
          status: MemberStatus.INACTIVE,
        },
      });

      return true;
    }),
  activate: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId } }) => {
      await prisma.blindMember.update({
        where: {
          id: memberId,
        },
        data: {
          status: MemberStatus.ACTIVE,
        },
      });

      return true;
    }),
  addToBlacklist: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId, phoneNumber } }) => {
      assert(
        isKrPhoneNumberWithoutHyphens(phoneNumber),
        "Invalid phone number",
      );

      await prisma.blindMember.update({
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
  getBlacklist: protectedBlindProcedure
    .input(z.object({ memberId: z.string() }))
    .query(async ({ ctx: { prisma }, input: { memberId } }) => {
      const member = await prisma.blindMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          blacklistedPhoneNumbers: true,
        },
      });

      return member.blacklistedPhoneNumbers;
    }),
  updateProfile: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
        data: z.object({
          nickname: z.string().optional(),
          height: z.number().optional(),
          bodyShape: z.string().optional(),
          job: z.string().optional(),
          selfIntroduction: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId, data } }) => {
      await prisma.blindMember.update({
        where: {
          id: memberId,
        },
        data,
      });

      return true;
    }),
  getVerificationStatus: protectedBlindProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx: { prisma }, input: { memberId } }) => {
      const member = await prisma.blindMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          idVerified: true,
          jobVerified: true,
        },
      });

      return {
        id: member.idVerified,
        job: member.jobVerified,
      };
    }),
});
