import { FripRating } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const reviewRouter = createTRPCRouter({
  createFripReview: protectedAdminProcedure
    .input(
      z.object({
        nickname: z.string(),
        rating: z.nativeEnum(FripRating),
        writtenAt: z.date(),
        content: z.string(),
        option: z.string(),
        priority: z.number(),
      }),
    )
    .mutation(({ ctx: { prisma }, input }) => {
      return prisma.fripReview.create({
        data: input,
      });
    }),
});
