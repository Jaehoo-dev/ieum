import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const reviewRouter = createTRPCRouter({
  getFripReviews: publicProcedure
    .input(
      z.object({
        skip: z.number().int(),
        take: z.number().int(),
      }),
    )
    .query(async ({ ctx: { prisma }, input }) => {
      const [reviews, count] = await Promise.all([
        prisma.fripReview.findMany({
          ...input,
          orderBy: {
            writtenAt: "desc",
          },
        }),
        prisma.fripReview.count(),
      ]);

      return {
        reviews,
        count,
      };
    }),
});
