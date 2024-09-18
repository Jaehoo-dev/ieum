import { Gender, MemberStatus } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, protectedBlindProcedure } from "../trpc";

export const blindMemberRouter = createTRPCRouter({
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
          name: true,
          phoneNumber: true,
          gender: true,
        },
      });
    }),
  getInfiniteMembers: protectedBlindProcedure
    .input(
      z.object({
        gender: z.nativeEnum(Gender),
        take: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        excludedIds: z.array(z.string()).optional(),
      }),
    )
    .query(
      async ({
        ctx: { prisma },
        input: { gender, take, cursor, excludedIds },
      }) => {
        const members = await prisma.blindMember.findMany({
          where: {
            gender,
            status: MemberStatus.ACTIVE,
            id: {
              notIn: excludedIds,
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
            residence: true,
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
});
