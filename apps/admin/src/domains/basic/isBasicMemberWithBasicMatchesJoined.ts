import { BasicMemberWithBasicMatchesJoined } from "./types";

export function isBasicMemberWithBasicMatchesJoined(
  value: any,
): value is BasicMemberWithBasicMatchesJoined {
  return (
    value != null &&
    typeof value === "object" &&
    value.hasOwnProperty("idealType") &&
    value.hasOwnProperty("pendingMatches") &&
    value.hasOwnProperty("rejectedMatches") &&
    value.hasOwnProperty("acceptedMatches") &&
    value.hasOwnProperty("profile") &&
    value.hasOwnProperty("images")
  );
}
