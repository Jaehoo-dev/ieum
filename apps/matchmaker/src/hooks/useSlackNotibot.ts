import { sendMessageToNotiChannel } from "@ieum/slack";

export function useSlackNotibot() {
  async function sendMessage(text: string) {
    if (process.env.NODE_ENV === "development") {
      console.log(text);

      return;
    }

    try {
      await sendMessageToNotiChannel(text);
    } catch {
      // ignore
    }
  }

  return {
    sendMessage,
  };
}
