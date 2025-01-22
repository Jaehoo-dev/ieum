import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@ieum/prisma";
import { sendSlackMessage, SLACK_MANAGER1_ID_MENTION } from "@ieum/slack";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  await prisma.blindMember.updateMany({
    data: {
      heartsLeft: 3,
    },
  });

  await sendSlackMessage({
    channel: "알림",
    content: `하트 초기화 완료 ${SLACK_MANAGER1_ID_MENTION}`,
  });

  res.status(200).json({ success: true });
}
