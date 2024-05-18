export function sendSlackNotibotMessage(input: string) {
  if (isLocalhostBrowser()) {
    console.log("[slack]", input);

    return;
  }

  return fetch(
    "https://hooks.slack.com/services/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",
    {
      method: "POST",
      body: JSON.stringify({
        text: input,
      }),
    },
  );
}

function isLocalhostBrowser() {
  return (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  );
}
