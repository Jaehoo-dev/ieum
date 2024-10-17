import { NextApiRequest, NextApiResponse } from "next";
import { IEUM_BLIND_MATCHES_PAGE_URL } from "@ieum/constants";
import { BlindMatchStatus, prisma } from "@ieum/prisma";
import { solapiMessageService } from "@ieum/solapi";
import { assert, isKrPhoneNumberWithoutHyphens } from "@ieum/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // @ts-ignore
  const authHeader = req.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  // const lastNotification = await prisma.blindBulkNotification.findFirst({
  //   orderBy: {
  //     sentAt: "desc",
  //   },
  // });

  // assert(lastNotification != null, "No previous notification found");

  // const matchesCreatedAfterLastNotification = await prisma.blindMatch.findMany({
  //   where: {
  //     createdAt: {
  //       gt: lastNotification.sentAt,
  //     },
  //     status: BlindMatchStatus.PENDING,
  //   },
  //   include: {
  //     respondent: {
  //       select: {
  //         phoneNumber: true,
  //       },
  //     },
  //   },
  // });

  // const respondentPhoneNumbers = Array.from(
  //   new Set(
  //     matchesCreatedAfterLastNotification
  //       .map((match) => {
  //         return match.respondent.phoneNumber;
  //       })
  //       .filter((phoneNumber) => {
  //         return isKrPhoneNumberWithoutHyphens(phoneNumber);
  //       }),
  //   ),
  // );

  // await Promise.all([
  //   solapiMessageService.send(
  //     respondentPhoneNumbers.map((phoneNumber) => {
  //       return {
  //         to: phoneNumber,
  //         from: process.env.ADMIN_PHONE_NUMBER,
  //         text: `[이음 블라인드] 하트가 도착했습니다! '매칭 목록' 탭에서 확인해보세요.
  // ${IEUM_BLIND_MATCHES_PAGE_URL}`,
  //       };
  //     }),
  //   ),
  //   prisma.blindBulkNotification.create({
  //     data: {
  //       sentAt: new Date(),
  //       sentTo: respondentPhoneNumbers,
  //     },
  //   }),
  //   prisma.otp.deleteMany({
  //     where: {
  //       expiresAt: {
  //         lt: new Date(),
  //       },
  //     },
  //   }),
  // ]);

  res.status(200).json({ success: true });
}
