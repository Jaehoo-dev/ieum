import { UserType } from "@ieum/prisma";
import { solapiMessageService } from "@ieum/solapi";
import { assert, isKrPhoneNumberWithoutHyphens } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const otpRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { phoneNumber } }) => {
      assert(
        isKrPhoneNumberWithoutHyphens(phoneNumber),
        "Invalid phone number",
      );

      const latestOtp = await prisma.otp.findFirst({
        where: {
          phoneNumber,
          expiresAt: {
            gte: new Date(),
          },
          isUsed: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          code: true,
        },
      });

      if (latestOtp != null) {
        return {
          verificationId: latestOtp.id,
          isReused: true,
        };
      }

      const otp = await prisma.otp.create({
        data: {
          phoneNumber,
          code: Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, "0"),
          type: UserType.BASIC_MEMBER,
          expiresAt: new Date(Date.now() + OTP_DURATION),
          isUsed: false,
        },
        select: {
          id: true,
          code: true,
        },
      });

      await sendOtp(phoneNumber, otp.code);

      return {
        verificationId: otp.id,
        isReused: false,
      };
    }),
});

const OTP_DURATION = 3 * 60 * 1000; // 3 minutes

function sendOtp(to: string, code: string) {
  return solapiMessageService.sendOne({
    from: process.env.ADMIN_PHONE_NUMBER,
    to,
    text: `[이음] 인증번호: ${code}`,
  });
}
