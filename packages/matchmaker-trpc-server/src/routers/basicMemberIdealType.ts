import { BasicCondition } from "@ieum/prisma";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const basicMemberIdealTypeRouter = createTRPCRouter({
  getIdealTypeById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.basicMemberIdealType.findUniqueOrThrow({
        where: {
          memberId: input.id,
        },
      });
    }),
  updateDealBreakers: publicProcedure
    .input(
      z.object({
        memberId: z.number(),
        dealBreakers: z.array(z.nativeEnum(BasicCondition)),
      }),
    )
    .mutation(({ ctx, input: { memberId, dealBreakers } }) => {
      return ctx.prisma.$transaction([
        ctx.prisma.basicMemberIdealType.update({
          where: {
            memberId,
          },
          data: {
            dealBreakers,
          },
        }),
        ctx.prisma.basicMember.update({
          where: {
            id: memberId,
          },
          data: {
            nonNegotiableConditions: dealBreakers,
          },
        }),
      ]);
    }),
});
