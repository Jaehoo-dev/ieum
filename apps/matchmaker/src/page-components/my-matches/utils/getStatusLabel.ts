import { MatchStatus } from "@ieum/prisma";
import { match } from "ts-pattern";

export function getStatusLabel(status: MatchStatus) {
  return match(status)
    .with(MatchStatus.PENDING, () => "🟡")
    .with(MatchStatus.REJECTED, () => "🔴")
    .with(MatchStatus.ACCEPTED, () => "🟢")
    .with(
      MatchStatus.BACKLOG,
      MatchStatus.PREPARING,
      MatchStatus.BROKEN_UP,
      () => {
        throw new Error("Invalid status");
      },
    )
    .exhaustive();
}
