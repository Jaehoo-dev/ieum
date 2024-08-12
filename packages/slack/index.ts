export type 슬랙_채널 =
  | "에러_알림"
  | "알림"
  | "매칭_결과_알림"
  | "폼_제출_알림"
  | "폼_백업";

export async function sendSlackMessage({
  channel,
  content,
}: {
  channel: 슬랙_채널;
  content: string;
}) {
  const webhookUrl: Record<슬랙_채널, string> = {
    에러_알림: process.env.NEXT_PUBLIC_ERROR_CHANNEL_WEBHOOK_URL!,
    알림: process.env.NEXT_PUBLIC_SLACK_NOTIBOT_WEBHOOK_URL!,
    매칭_결과_알림: process.env.NEXT_PUBLIC_SLACK_MATCH_NOTIBOT_WEBHOOK_URL!,
    폼_제출_알림: process.env.NEXT_PUBLIC_SLACK_FORM_NOTIBOT_WEBHOOK_URL!,
    폼_백업: process.env.NEXT_PUBLIC_SLACK_FORM_BACKUP_WEBHOOK_URL!,
  };

  try {
    return await fetch(webhookUrl[channel], {
      method: "POST",
      body: JSON.stringify({
        text: content,
      }),
    });
  } catch {
    // ignore
  }
}

export const SLACK_USER_ID_MENTION = "<@U06LZ57FHPA>";
