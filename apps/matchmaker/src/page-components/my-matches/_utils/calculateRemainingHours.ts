import { addHours } from "date-fns";

export function calculateRemainingHours({
  sentAt,
  durationHours,
}: {
  sentAt: Date;
  durationHours: number;
}) {
  const expiresAt = addHours(sentAt, durationHours);

  const result = Math.floor(
    (expiresAt.getTime() - new Date().getTime()) / 1000 / 60 / 60,
  );

  return result < 0 ? 0 : result;
}
