import { prisma } from "@ieum/prisma";
import { solapiMessageService } from "@ieum/solapi";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  return true;
}
