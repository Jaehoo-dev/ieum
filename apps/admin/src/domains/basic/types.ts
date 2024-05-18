import type { BasicMatch, BasicMember, BasicMemberProfile } from "@ieum/prisma";

export type BasicMemberWithMatches = BasicMember & {
  pendingMatches: BasicMatch[];
  rejectedMatches: BasicMatch[];
  acceptedMatches: BasicMatch[];
  profile: BasicMemberProfile | null;
};

export type BasicMatchWithMembers = BasicMatch & {
  pendingBy: BasicMemberWithMatches[];
  rejectedBy: BasicMemberWithMatches[];
  acceptedBy: BasicMemberWithMatches[];
};
