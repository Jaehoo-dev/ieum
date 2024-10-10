import { sendSlackMessage } from "@ieum/slack";
import { formatUniqueMemberName } from "@ieum/utils";
import { z } from "zod";

import { createTRPCRouter, protectedMatchmakerProcedure } from "../trpc";

export const blindRouter = createTRPCRouter({
  updateKakaotalkId: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
        kakaotalkId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId, kakaotalkId } }) => {
      const member = await prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      });

      await prisma.blindPreRegisteredMember.update({
        where: {
          phoneNumber: member.phoneNumber,
        },
        data: {
          kakaotalkId,
        },
      });

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `${formatUniqueMemberName(
          member,
        )} - 이음 블라인드 카카오톡 ID 업데이트`,
      });

      return true;
    }),
  preRegister: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
        kakaotalkId: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma }, input: { memberId, kakaotalkId } }) => {
      const member = await prisma.basicMemberV2.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          name: true,
          phoneNumber: true,
        },
      });

      await prisma.blindPreRegisteredMember.create({
        data: {
          name: member.name,
          phoneNumber: member.phoneNumber,
          kakaotalkId,
        },
      });

      sendSlackMessage({
        channel: "폼_제출_알림",
        content: `${formatUniqueMemberName(member)} - 이음 블라인드 사전 신청`,
      });

      return true;
    }),
  getPreRegisterStatus: protectedMatchmakerProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(
      async ({
        ctx: { prisma },
        input: { memberId },
      }): Promise<"DONE" | "KAKAOTALK_ID_MISSING" | "NON_REGISTERED"> => {
        const member = await prisma.basicMemberV2.findUniqueOrThrow({
          where: {
            id: memberId,
          },
          select: {
            phoneNumber: true,
          },
        });

        const preRegisteredMember =
          await prisma.blindPreRegisteredMember.findUnique({
            where: {
              phoneNumber: member.phoneNumber,
            },
            select: {
              id: true,
              kakaotalkId: true,
            },
          });

        if (preRegisteredMember == null) {
          return "NON_REGISTERED";
        }

        return preRegisteredMember.kakaotalkId == null
          ? "KAKAOTALK_ID_MISSING"
          : "DONE";
      },
    ),
});
