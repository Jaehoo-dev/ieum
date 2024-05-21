import { MatchStatus } from "@ieum/prisma";
import { solapiMessageService } from "@ieum/solapi";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const adminMessageRouter = createTRPCRouter({
  sendMatchNotiMessage: protectedAdminProcedure
    .input(
      z.object({
        memberId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { memberId } }) => {
      const member = await ctx.prisma.basicMember.findUniqueOrThrow({
        where: {
          id: memberId,
        },
        select: {
          name: true,
          phoneNumber: true,
          pendingMatches: true,
        },
      });

      assert(
        member.pendingMatches.some((match) => {
          return match.status === MatchStatus.PENDING;
        }),
        new TRPCError({
          code: "BAD_REQUEST",
          message: "No pending matches.",
        }),
      );

      return solapiMessageService.send({
        to: member.phoneNumber,
        from: process.env.ADMIN_PHONE_NUMBER,
        subject: "[내편소] 매칭 안내",
        text: `${member.name} 님 안녕하세요! 내편소 호스트입니다. 매칭 제안드려요.

아래 사이트에서 상대방 프로필을 확인하시고 수락 여부를 결정해주세요.
${process.env.NEXT_PUBLIC_MATCHMAKER_DOMAIN_HOSTNAME}

양쪽 모두 수락하시면 소개가 성사되며 호스트가 연락을 드립니다.

감사합니다!

(개인정보를 우려하시는 분들이 많아 시스템을 바꿔봤습니다. 혹시 버그가 있다면 호스트에게 제보해주세요!)
        `,
      });
    }),
});
