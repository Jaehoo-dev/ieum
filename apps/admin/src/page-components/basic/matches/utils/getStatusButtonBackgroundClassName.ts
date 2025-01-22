import type { MatchStatus } from "@ieum/prisma";
import { match } from "ts-pattern";

export function getStatusButtonBackgroundClassName(status: MatchStatus) {
  return match(status)
    .with("BACKLOG", () => {
      return "bg-yellow-900";
    })
    .with("PREPARING", () => {
      return "bg-gray-600";
    })
    .with("PENDING", () => {
      return "bg-yellow-400";
    })
    .with("REJECTED", () => {
      return "bg-red-500";
    })
    .with("ACCEPTED", () => {
      return "bg-green-500";
    })
    .with("BROKEN_UP", () => {
      return "bg-black";
    })
    .exhaustive();
}
