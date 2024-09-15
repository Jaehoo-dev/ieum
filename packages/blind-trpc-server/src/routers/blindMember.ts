import { MemberStatus } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, protectedBlindProcedure } from "../trpc";

export const blindMemberRouter = createTRPCRouter({
  findByPhoneNumber: protectedBlindProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      }),
    )
    .query(({ ctx, input: { phoneNumber } }) => {
      return ctx.prisma.blindMember.findUnique({
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
});
