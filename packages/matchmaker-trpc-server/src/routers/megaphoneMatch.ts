import {
  MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS_EXTENDED,
  MEGAPHONE_MATCH_SENDER_DURATION_HOURS_EXTENDED,
  확성기_매치_참가자_유형,
} from "@ieum/constants";
import {
  MatchStatus,
  MegaphoneMatchMemberStatus,
  MemberStatus,
} from "@ieum/prisma";
import { sendSlackMessage, SLACK_USER_ID_MENTION } from "@ieum/slack";
import { assert } from "@ieum/utils";
import { TRPCError } from "@trpc/server";
import { subHours } from "date-fns";
import { match as matchPattern } from "ts-pattern";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const megaphoneMatchRouter = createTRPCRouter({
  findActiveMatchesAsReceiverByMemberId: protectedProcedure
    .input(z.object({ memberId: z.string() }))
    .query(({ ctx: { prisma }, input: { memberId } }) => {
      return prisma.megaphoneMatch.findMany({
        where: {
          status: MatchStatus.PENDING,
          receiverId: memberId,
          sentToReceiverAt: {
            gt: subHours(new Date(), 72),
          },
          receiverStatus: MegaphoneMatchMemberStatus.PENDING,
          receiver: {
            status: {
              in: [
                MemberStatus.PENDING,
                MemberStatus.ACTIVE,
                MemberStatus.INACTIVE,
              ],
            },
          },
          sender: {
            status: MemberStatus.ACTIVE,
          },
        },
        orderBy: {
          sentToReceiverAt: "desc",
        },
        select: {
          id: true,
          status: true,
          sentToReceiverAt: true,
          receiverStatus: true,
          receiverId: true,
        },
      });
    }),
  getMatchData: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        selfMemberId: z.string(),
      }),
    )
    .query(async ({ ctx: { prisma }, input: { matchId, selfMemberId } }) => {
      const match = await prisma.megaphoneMatch.findUniqueOrThrow({
        where: {
          id: matchId,
          sender: {
            status: {
              in: [
                MemberStatus.PENDING,
                MemberStatus.ACTIVE,
                MemberStatus.INACTIVE,
              ],
            },
          },
          receiver: {
            status: {
              in: [
                MemberStatus.PENDING,
                MemberStatus.ACTIVE,
                MemberStatus.INACTIVE,
              ],
            },
          },
        },
        select: {
          status: true,
          receiverId: true,
          senderId: true,
          sentToReceiverAt: true,
          sentToSenderAt: true,
          receiverStatus: true,
          senderStatus: true,
        },
      });

      const {
        status: matchStatus,
        receiverId,
        senderId,
        sentToReceiverAt,
        sentToSenderAt,
        receiverStatus,
        senderStatus,
      } = match;

      assert(
        matchStatus === MatchStatus.PENDING ||
          matchStatus === MatchStatus.ACCEPTED,
        new TRPCError({
          message: "Match status must be PENDING or ACCEPTED",
          code: "FORBIDDEN",
        }),
      );
      assert(
        senderId === selfMemberId || receiverId === selfMemberId,
        new TRPCError({
          message: "Member must be sender or receiver",
          code: "FORBIDDEN",
        }),
      );

      const selfMemberType = matchPattern(selfMemberId)
        .with(senderId, () => {
          return 확성기_매치_참가자_유형.SENDER;
        })
        .with(receiverId, () => {
          return 확성기_매치_참가자_유형.RECEIVER;
        })
        .otherwise(() => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Requested member is not in the match",
          });
        });

      assert(
        (selfMemberType === 확성기_매치_참가자_유형.RECEIVER &&
          sentToReceiverAt != null &&
          receiverStatus !== MegaphoneMatchMemberStatus.REJECTED &&
          subHours(
            new Date(),
            MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS_EXTENDED,
          ) < sentToReceiverAt) ||
          (selfMemberType === 확성기_매치_참가자_유형.SENDER &&
            receiverStatus === MegaphoneMatchMemberStatus.ACCEPTED &&
            sentToSenderAt != null &&
            subHours(
              new Date(),
              MEGAPHONE_MATCH_SENDER_DURATION_HOURS_EXTENDED,
            ) < sentToSenderAt),
        new TRPCError({
          code: "BAD_REQUEST",
          message: "Requested match is not valid",
        }),
      );

      const targetMemberId = matchPattern(selfMemberId)
        .with(senderId, () => {
          return receiverId;
        })
        .with(receiverId, () => {
          return senderId;
        })
        .otherwise(() => {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Requested member is not in the match",
          });
        });

      const targetMemberProfile =
        await prisma.basicMemberProfileV2.findUniqueOrThrow({
          where: {
            memberId: targetMemberId,
          },
          include: {
            member: {
              select: {
                images: {
                  orderBy: {
                    index: "asc",
                  },
                },
                videos: {
                  orderBy: {
                    index: "asc",
                  },
                },
                audios: {
                  orderBy: {
                    index: "asc",
                  },
                },
              },
            },
          },
        });

      const isSelfMemberPending = matchPattern(selfMemberType)
        .with(확성기_매치_참가자_유형.RECEIVER, () => {
          return receiverStatus === MegaphoneMatchMemberStatus.PENDING;
        })
        .with(확성기_매치_참가자_유형.SENDER, () => {
          return senderStatus === MegaphoneMatchMemberStatus.PENDING;
        })
        .exhaustive();

      return {
        selfMemberType,
        isSelfMemberPending,
        isMatchPending: matchStatus === MatchStatus.PENDING,
        targetMemberProfile,
      };
    }),
  reject: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        actionMemberId: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { prisma }, input: { matchId, actionMemberId } }) => {
        const match = await prisma.megaphoneMatch.findUniqueOrThrow({
          where: {
            id: matchId,
          },
          select: {
            id: true,
            senderId: true,
            receiverId: true,
            sender: {
              select: {
                name: true,
              },
            },
            receiver: {
              select: {
                name: true,
              },
            },
          },
        });

        const actionMemberType = matchPattern(actionMemberId)
          .with(match.senderId, () => {
            return 확성기_매치_참가자_유형.SENDER;
          })
          .with(match.receiverId, () => {
            return 확성기_매치_참가자_유형.RECEIVER;
          })
          .otherwise(() => {
            throw new TRPCError({
              code: "BAD_REQUEST",
            });
          });

        if (actionMemberType === 확성기_매치_참가자_유형.SENDER) {
          await prisma.megaphoneMatch.update({
            where: {
              id: matchId,
            },
            data: {
              senderStatus: MegaphoneMatchMemberStatus.REJECTED,
              status: MatchStatus.REJECTED,
            },
          });

          sendSlackMessage({
            channel: "매칭_결과_알림",
            content: `[확성기 실패]\n거절: ${match.sender.name}\n수락: ${match.receiver.name}`,
          });

          return true;
        }

        await prisma.megaphoneMatch.update({
          where: {
            id: matchId,
          },
          data: {
            receiverStatus: MegaphoneMatchMemberStatus.REJECTED,
            status: MatchStatus.REJECTED,
          },
        });

        sendSlackMessage({
          channel: "매칭_결과_알림",
          content: `[확성기 실패]\n거절: ${match.receiver.name}`,
        });

        return true;
      },
    ),
  accept: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        actionMemberId: z.string(),
      }),
    )
    .mutation(
      async ({ ctx: { prisma }, input: { matchId, actionMemberId } }) => {
        const match = await prisma.megaphoneMatch.findUniqueOrThrow({
          where: {
            id: matchId,
          },
          select: {
            id: true,
            senderId: true,
            receiverId: true,
            sender: {
              select: {
                name: true,
              },
            },
            receiver: {
              select: {
                name: true,
              },
            },
          },
        });

        const actionMemberType = matchPattern(actionMemberId)
          .with(match.senderId, () => {
            return 확성기_매치_참가자_유형.SENDER;
          })
          .with(match.receiverId, () => {
            return 확성기_매치_참가자_유형.RECEIVER;
          })
          .otherwise(() => {
            throw new TRPCError({
              code: "BAD_REQUEST",
            });
          });

        if (actionMemberType === 확성기_매치_참가자_유형.SENDER) {
          await prisma.megaphoneMatch.update({
            where: {
              id: matchId,
            },
            data: {
              senderStatus: MegaphoneMatchMemberStatus.ACCEPTED,
              status: MatchStatus.ACCEPTED,
            },
          });

          sendSlackMessage({
            channel: "매칭_결과_알림",
            content: `[확성기 성공]\n수락: ${match.sender.name}, ${match.receiver.name} ${SLACK_USER_ID_MENTION}`,
          });

          return true;
        }

        await prisma.megaphoneMatch.update({
          where: {
            id: matchId,
          },
          data: {
            receiverStatus: MegaphoneMatchMemberStatus.ACCEPTED,
          },
        });

        sendSlackMessage({
          channel: "매칭_결과_알림",
          content: `[확성기 수락] ${match.receiver.name} ${SLACK_USER_ID_MENTION}`,
        });

        return true;
      },
    ),
});
