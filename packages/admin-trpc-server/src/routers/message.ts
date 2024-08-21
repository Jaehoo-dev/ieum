import { solapiMessageService } from "@ieum/solapi";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const adminMessageRouter = createTRPCRouter({
  sendMessages: protectedAdminProcedure
    .input(
      z.array(
        z.object({
          to: z.string(),
          subject: z.string().optional(),
          text: z.string(),
        }),
      ),
    )
    .mutation(({ input }) => {
      return solapiMessageService.send(
        input.map((messageData) => {
          return {
            from: process.env.ADMIN_PHONE_NUMBER,
            ...messageData,
          };
        }),
      );
    }),
  sendMatchAlimtalks: protectedAdminProcedure
    .input(
      z.array(
        z.object({
          to: z.string(),
          name: z.string(),
        }),
      ),
    )
    .mutation(({ input }) => {
      return solapiMessageService.send(
        input.map(({ to, name }) => {
          return {
            to,
            from: process.env.ADMIN_PHONE_NUMBER,
            kakaoOptions: {
              pfId: process.env.KAKAO_CHANNEL_PFID!,
              templateId: process.env.MATCH_ALIMTALK_TEMPLATE_ID!,
              variables: {
                "#{회원명}": name,
              },
            },
          };
        }),
      );
    }),
});
