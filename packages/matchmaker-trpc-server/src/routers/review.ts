import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const reviewRouter = createTRPCRouter({
  getFripReviews: publicProcedure
    .input(
      z.object({
        skip: z.number().int(),
        take: z.number().int(),
        orderBy: z.enum(["PRIORITY", "WRITTEN_AT"]),
      }),
    )
    .query(async ({ ctx: { prisma }, input: { skip, take, orderBy } }) => {
      const [reviews, count] = await Promise.all([
        prisma.fripReview.findMany({
          skip,
          take,
          orderBy:
            orderBy === "PRIORITY"
              ? [{ priority: "desc" }, { writtenAt: "desc" }]
              : { writtenAt: "desc" },
        }),
        prisma.fripReview.count(),
      ]);

      return {
        reviews,
        count,
      };
    }),
});
