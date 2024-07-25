import { BasicCondition } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const basicMemberIdealTypeRouter = createTRPCRouter({
  getIdealTypeById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMemberIdealTypeV2.findUniqueOrThrow({
        where: {
          memberId: input.id,
        },
      });
    }),
  updatePriorities: publicProcedure
    .input(
      z.object({
        memberId: z.string(),
        priorities: z.object({
          dealBreakers: z.array(z.nativeEnum(BasicCondition)),
          highPriorities: z.array(z.nativeEnum(BasicCondition)),
          mediumPriorities: z.array(z.nativeEnum(BasicCondition)),
          lowPriorities: z.array(z.nativeEnum(BasicCondition)),
        }),
      }),
    )
    .mutation(({ ctx, input: { memberId, priorities } }) => {
      return ctx.prisma.basicMemberIdealTypeV2.update({
        where: {
          memberId,
        },
        data: priorities,
      });
    }),
});
