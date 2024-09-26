import { BlindMatchStatus } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const blindMatchRouter = createTRPCRouter({
  initiate: publicProcedure
    .input(
      z.object({
        proposerId: z.string(),
        respondentId: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { prisma }, input: { proposerId, respondentId } }) => {
        await prisma.blindMatch.create({
          data: {
            proposerId,
            respondentId,
            status: BlindMatchStatus.PENDING,
          },
        });

        return true;
      },
    ),
});
