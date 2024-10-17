import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@ieum/prisma";
import { solapiMessageService } from "@ieum/solapi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const testMember = await prisma.blindMember.findUniqueOrThrow({
    where: {
      nickname: "콜라",
    },
    select: {
      phoneNumber: true,
    },
  });

  await solapiMessageService.send({
    from: process.env.ADMIN_PHONE_NUMBER,
    to: testMember.phoneNumber,
    text: "cron job test",
  });

  res.status(200).json(true);
}
