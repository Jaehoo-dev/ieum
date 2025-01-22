import type { 슬랙_채널 } from "@ieum/slack";
import { sendSlackMessage } from "@ieum/slack";

export function useSlackNotibot() {
  async function sendMessage({
    channel = "알림",
    content,
  }: {
    channel?: 슬랙_채널;
    content: string;
  }) {
    if (process.env.NODE_ENV === "development") {
      console.log(content);

      return;
    }

    try {
      await sendSlackMessage({
        channel,
        content,
      });
    } catch {
      // ignore
    }
  }

  return {
    sendMessage,
  };
}
