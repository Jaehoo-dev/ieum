import { MatchStatus, MegaphoneMatchMemberStatus } from "@ieum/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, protectedAdminProcedure } from "../trpc";

export const megaphoneMatchRouter = createTRPCRouter({
  create: protectedAdminProcedure
    .input(
      z.object({
        senderId: z.string(),
        receiverId: z.string(),
        initialStatus: z.nativeEnum({
          [MatchStatus.BACKLOG]: MatchStatus.BACKLOG,
          [MatchStatus.PREPARING]: MatchStatus.PREPARING,
        }),
      }),
    )
    .mutation(
      async ({ ctx, input: { senderId, receiverId, initialStatus } }) => {
        return ctx.prisma.megaphoneMatch.create({
          data: {
            status: initialStatus,
            senderId,
            receiverId,
          },
        });
      },
    ),
  find: protectedAdminProcedure
    .input(
      z.object({
        statuses: z.nativeEnum(MatchStatus).array(),
        from: z.string(),
        to: z.string(),
        name: z.string().optional(),
      }),
    )
    .query(({ ctx, input: { statuses, name, from, to } }) => {
      const 상태_필터가_있는가 =
        statuses.length > 0 &&
        statuses.length < Object.values(MatchStatus).length;
      const 이름_필터가_있는가 = name != null && name !== "";

      return ctx.prisma.megaphoneMatch.findMany({
        where: {
          AND: [
            {
              status: 상태_필터가_있는가 ? { in: statuses } : undefined,
              OR: 이름_필터가_있는가
                ? [
                    { sender: { name: { equals: name } } },
                    { receiver: { name: { equals: name } } },
                  ]
                : undefined,
            },
          ],
          OR: [
            {
              createdAt: {
                gte: startOfDay(from),
                lte: endOfDay(to),
              },
            },
            {
              updatedAt: {
                gte: startOfDay(from),
                lte: endOfDay(to),
              },
            },
          ],
        },
        include: {
          sender: {
            include: {
              idealType: true,
              megaphoneMatchesAsSender: true,
              megaphoneMatchesAsReceiver: true,
              profile: true,
              images: {
                orderBy: {
                  index: "asc",
                },
              },
            },
          },
          receiver: {
            include: {
              idealType: true,
              megaphoneMatchesAsSender: true,
              megaphoneMatchesAsReceiver: true,
              profile: true,
              images: {
                orderBy: {
                  index: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  updateReceiverStatus: protectedAdminProcedure
    .input(
      z.object({
        matchId: z.string(),
        status: z.nativeEnum(MegaphoneMatchMemberStatus),
      }),
    )
    .mutation(({ ctx, input: { matchId, status } }) => {
      return ctx.prisma.megaphoneMatch.update({
        where: {
          id: matchId,
        },
        data: {
          receiverStatus: status,
          status:
            status === MegaphoneMatchMemberStatus.REJECTED
              ? MatchStatus.REJECTED
              : undefined,
        },
      });
    }),
  updateSenderStatus: protectedAdminProcedure
    .input(
      z.object({
        matchId: z.string(),
        status: z.nativeEnum(MegaphoneMatchMemberStatus),
      }),
    )
    .mutation(({ ctx, input: { matchId, status } }) => {
      return ctx.prisma.megaphoneMatch.update({
        where: {
          id: matchId,
        },
        data: {
          senderStatus: status,
          sentToSenderAt:
            status === MegaphoneMatchMemberStatus.PENDING
              ? new Date()
              : undefined,
          status:
            status === MegaphoneMatchMemberStatus.ACCEPTED
              ? MatchStatus.ACCEPTED
              : status === MegaphoneMatchMemberStatus.REJECTED
              ? MatchStatus.REJECTED
              : undefined,
        },
      });
    }),
  initiateReceiver: protectedAdminProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .mutation(({ ctx, input: { matchId } }) => {
      return ctx.prisma.megaphoneMatch.update({
        where: {
          id: matchId,
        },
        data: {
          status: MatchStatus.PENDING,
          receiverStatus: MegaphoneMatchMemberStatus.PENDING,
          sentToReceiverAt: new Date(),
        },
      });
    }),
  initiateSender: protectedAdminProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .mutation(({ ctx, input: { matchId } }) => {
      return ctx.prisma.megaphoneMatch.update({
        where: {
          id: matchId,
        },
        data: {
          senderStatus: MegaphoneMatchMemberStatus.PENDING,
          sentToSenderAt: new Date(),
        },
      });
    }),
  delete: protectedAdminProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .mutation(({ ctx, input: { matchId } }) => {
      return ctx.prisma.megaphoneMatch.delete({
        where: {
          id: matchId,
        },
      });
    }),
  updateMatchStatus: protectedAdminProcedure
    .input(
      z.object({
        matchId: z.string(),
        status: z.enum([
          MatchStatus.BACKLOG,
          MatchStatus.PREPARING,
          MatchStatus.BROKEN_UP,
        ]),
      }),
    )
    .mutation(({ ctx, input: { matchId, status } }) => {
      return ctx.prisma.megaphoneMatch.update({
        where: {
          id: matchId,
        },
        data: {
          status,
        },
      });
    }),
});
