import { 성별_라벨 } from "@ieum/constants";
import { Gender } from "@ieum/prisma";
import { sendSlackMessage } from "@ieum/slack";
import { krToKrHyphen } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const draftBlindMemberRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        phoneNumber: z.string(),
        nickname: z.string(),
        gender: z.nativeEnum(Gender),
        birthYear: z.number(),
        residence: z.string(),
        height: z.number(),
        bodyShape: z.string(),
        job: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input }) => {
      await prisma.draftBlindMember.create({
        data: input,
      });

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `*이음:cupid:블라인드* 설문 제출\n${
          input.name
        } / ${krToKrHyphen(input.phoneNumber)} / ${성별_라벨[input.gender]}`,
        throwOnError: false,
      });

      return true;
    }),
});
