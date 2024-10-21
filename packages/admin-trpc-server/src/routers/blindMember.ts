import { Gender, RegionV2 } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const blindMemberRouter = createTRPCRouter({
  createDraft: protectedAdminProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        nickname: z.string(),
        gender: z.nativeEnum(Gender),
        birthYear: z.number(),
        region: z.nativeEnum(RegionV2),
        height: z.number(),
        bodyShape: z.string(),
        job: z.string(),
        selfIntroduction: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.draftBlindMember.create({
        data: input,
      });
    }),
  resetHearts: protectedAdminProcedure.mutation(({ ctx: { prisma } }) => {
    return prisma.blindMember.updateMany({
      data: {
        heartsLeft: 3,
      },
    });
  }),
});
