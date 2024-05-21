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
});
