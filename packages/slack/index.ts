export async function sendMessageToNotiChannel(text: string) {
  try {
    return await fetch(process.env.NEXT_PUBLIC_SLACK_NOTIBOT_WEBHOOK_URL!, {
      method: "POST",
      body: JSON.stringify({
        text,
      }),
    });
  } catch {
    // ignore
  }
}

export async function sendMessageToMatchResultChannel(text: string) {
  try {
    return await fetch(
      process.env.NEXT_PUBLIC_SLACK_MATCH_NOTIBOT_WEBHOOK_URL!,
      {
        method: "POST",
        body: JSON.stringify({
          text,
        }),
      },
    );
  } catch {
    // ignore
  }
}
